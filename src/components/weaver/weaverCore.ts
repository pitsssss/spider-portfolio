import * as THREE from 'three'
import {
  WEAVER_CLIPS,
  WEAVER_CROSSFADE,
  WEAVER_LOOPING,
  type WeaverClip,
} from './weaverConfig'

export function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export type ViewportTier = 'desktop' | 'tablet' | 'mobile'

export function getViewportTier(): ViewportTier {
  const w = window.innerWidth
  if (w < 768) return 'mobile'
  if (w < 1100) return 'tablet'
  return 'desktop'
}

export function disposeObject(root: THREE.Object3D): void {
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    object.geometry.dispose()
    const materials = Array.isArray(object.material) ? object.material : [object.material]
    for (const material of materials) {
      for (const value of Object.values(material)) {
        if (value instanceof THREE.Texture) value.dispose()
      }
      material.dispose()
    }
  })
}

export function frameModelRoot(root: THREE.Object3D): THREE.Vector3 {
  const box = new THREE.Box3().setFromObject(root)
  const center = box.getCenter(new THREE.Vector3())
  root.position.sub(center)
  root.position.y -= new THREE.Box3().setFromObject(root).min.y
  return box.getSize(new THREE.Vector3())
}

/** Lift dark GLB shells toward readable gunmetal for the light production scene only. */
export function liftWeaverMaterials(root: THREE.Object3D): void {
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    const materials = Array.isArray(object.material) ? object.material : [object.material]
    const nextMats = materials.map((mat) => {
      const next = mat.clone()
      if (next instanceof THREE.MeshStandardMaterial || next instanceof THREE.MeshPhysicalMaterial) {
        const c = next.color
        const luminance = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b
        const isCyan = c.b > 0.45 && c.g > 0.35 && c.r < 0.45
        const isAmber = c.r > 0.55 && c.g > 0.25 && c.b < 0.35
        if (!isCyan && !isAmber && luminance < 0.22) {
          next.color.setRGB(0.18, 0.2, 0.22)
          next.metalness = Math.min(0.85, Math.max(0.45, next.metalness))
          next.roughness = Math.min(0.55, Math.max(0.28, next.roughness))
          next.envMapIntensity = 1.15
        }
        if (isAmber) {
          next.emissive = new THREE.Color(0xf3a63b)
          next.emissiveIntensity = Math.max(next.emissiveIntensity, 0.55)
        }
        if (isCyan) {
          next.emissive = new THREE.Color(0x36cbe8)
          next.emissiveIntensity = Math.max(next.emissiveIntensity, 0.25)
        }
      }
      return next
    })
    object.material = Array.isArray(object.material) ? nextMats : nextMats[0]
  })
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function smoothstep(t: number): number {
  const x = Math.max(0, Math.min(1, t))
  return x * x * (3 - 2 * x)
}

export class WeaverMixerController {
  private mixer: THREE.AnimationMixer
  private actions = new Map<WeaverClip, THREE.AnimationAction>()
  private current: WeaverClip = 'Idle'
  private onFinished: ((event: { action: THREE.AnimationAction }) => void) | null = null

  constructor(root: THREE.Object3D, clips: THREE.AnimationClip[]) {
    this.mixer = new THREE.AnimationMixer(root)
    for (const clip of clips) {
      if (!WEAVER_CLIPS.includes(clip.name as WeaverClip)) continue
      const name = clip.name as WeaverClip
      this.actions.set(name, this.mixer.clipAction(clip))
    }
    const idle = this.actions.get('Idle')
    if (idle) {
      idle.setLoop(THREE.LoopRepeat, Infinity)
      idle.play()
    }
  }

  play(name: WeaverClip, onReturnIdle = true): void {
    const next = this.actions.get(name)
    if (!next || name === this.current) return
    const prev = this.actions.get(this.current)
    if (this.onFinished) {
      this.mixer.removeEventListener('finished', this.onFinished)
      this.onFinished = null
    }
    next.reset()
    next.enabled = true
    next.clampWhenFinished = !WEAVER_LOOPING.has(name)
    next.setLoop(
      WEAVER_LOOPING.has(name) ? THREE.LoopRepeat : THREE.LoopOnce,
      WEAVER_LOOPING.has(name) ? Infinity : 1,
    )
    if (prev && prev !== next) prev.fadeOut(WEAVER_CROSSFADE)
    next.fadeIn(WEAVER_CROSSFADE).play()
    this.current = name
    if (!WEAVER_LOOPING.has(name) && onReturnIdle) {
      this.onFinished = (event) => {
        if (event.action !== next) return
        this.play('Idle', false)
      }
      this.mixer.addEventListener('finished', this.onFinished)
    }
  }

  getCurrent(): WeaverClip {
    return this.current
  }

  update(dt: number): void {
    this.mixer.update(dt)
  }

  pauseIdle(): void {
    const idle = this.actions.get('Idle')
    if (idle) {
      idle.paused = true
      this.mixer.update(0)
    }
  }

  stopAllActions(): void {
    if (this.onFinished) this.mixer.removeEventListener('finished', this.onFinished)
    this.onFinished = null
    for (const action of this.actions.values()) {
      action.stop()
    }
    this.current = 'Idle'
  }

  dispose(): void {
    if (this.onFinished) this.mixer.removeEventListener('finished', this.onFinished)
    this.mixer.stopAllAction()
    this.actions.clear()
  }
}

export function isWeaverClip(name: string): name is WeaverClip {
  return WEAVER_CLIPS.includes(name as WeaverClip)
}
