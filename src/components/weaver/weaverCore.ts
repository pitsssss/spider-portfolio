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

  dispose(): void {
    if (this.onFinished) this.mixer.removeEventListener('finished', this.onFinished)
    this.mixer.stopAllAction()
    this.actions.clear()
  }
}

export function isWeaverClip(name: string): name is WeaverClip {
  return WEAVER_CLIPS.includes(name as WeaverClip)
}
