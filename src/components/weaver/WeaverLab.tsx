'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { WEAVER_MODEL_URL, WEAVER_CROSSFADE, WEAVER_LOOPING, WEAVER_CLIPS, type WeaverClip } from './weaverConfig'
import styles from './WeaverLab.module.css'

type ClipName = WeaverClip
type Status = 'loading' | 'ready' | 'nowebgl' | 'error'

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function isCoarsePointer(): boolean {
  return window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768
}

function disposeObject(root: THREE.Object3D): void {
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

export default function WeaverLab() {
  const hostRef = useRef<HTMLDivElement>(null)
  const playRef = useRef<(name: ClipName) => void>(() => undefined)
  const [status, setStatus] = useState<Status>('loading')
  const [active, setActive] = useState<ClipName>('Idle')

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    if (!hasWebGL()) {
      setStatus('nowebgl')
      return
    }

    const reducedMotion = prefersReducedMotion()
    const mobile = isCoarsePointer()
    let disposed = false
    let frame = 0
    let mixer: THREE.AnimationMixer | null = null
    let current: ClipName = 'Idle'
    let finished: ((event: { action: THREE.AnimationAction }) => void) | null = null

    const renderer = new THREE.WebGLRenderer({ antialias: !mobile, alpha: false, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setClearColor(0x07090e, 1)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.12
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    host.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x07090e)
    scene.fog = new THREE.Fog(0x07090e, 7, 24)

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50)
    const clock = new THREE.Clock()

    const hemi = new THREE.HemisphereLight(0x78e7ff, 0x07090e, 0.28)
    scene.add(hemi)

    const key = new THREE.DirectionalLight(0x78e7ff, 2.4)
    key.position.set(3.2, 6.4, 3.6)
    key.castShadow = true
    key.shadow.mapSize.set(1024, 1024)
    key.shadow.radius = 5
    key.shadow.bias = -0.00025
    key.shadow.camera.near = 0.5
    key.shadow.camera.far = 22
    key.shadow.camera.left = -4
    key.shadow.camera.right = 4
    key.shadow.camera.top = 4
    key.shadow.camera.bottom = -4
    scene.add(key)

    const rim = new THREE.DirectionalLight(0xff8b5c, 0.7)
    rim.position.set(-4.2, 2.2, -3.4)
    scene.add(rim)

    const fill = new THREE.PointLight(0x78e7ff, 0.35, 12)
    fill.position.set(-1.4, 1.8, 3.2)
    scene.add(fill)

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(4.5, 48),
      new THREE.ShadowMaterial({ opacity: 0.38 }),
    )
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    scene.add(floor)

    const rig = new THREE.Group()
    scene.add(rig)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.enablePan = !mobile
    controls.enableZoom = !mobile
    controls.minDistance = 1.4
    controls.maxDistance = 8
    controls.minPolarAngle = 0.7
    controls.maxPolarAngle = 1.45
    controls.rotateSpeed = mobile ? 0.55 : 0.7

    const actions = new Map<ClipName, THREE.AnimationAction>()

    const fit = () => {
      const width = Math.max(host.clientWidth, 1)
      const height = Math.max(host.clientHeight, 1)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
    }

    const frameModel = (root: THREE.Object3D) => {
      const box = new THREE.Box3().setFromObject(root)
      const size = box.getSize(new THREE.Vector3())
      const center = box.getCenter(new THREE.Vector3())
      root.position.sub(center)
      root.position.y -= new THREE.Box3().setFromObject(root).min.y
      const maxDim = Math.max(size.x, size.y, size.z)
      const dist = (maxDim / (2 * Math.tan((camera.fov * Math.PI) / 360))) * (mobile ? 2.35 : 1.7)
      camera.position.set(dist * 0.62, dist * 0.42, dist * 0.95)
      controls.target.set(0, size.y * 0.38, 0)
      controls.update()
    }

    const playClip = (name: ClipName) => {
      const next = actions.get(name)
      if (!next || !mixer) return
      const prev = actions.get(current)
      if (finished) {
        mixer.removeEventListener('finished', finished)
        finished = null
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
      current = name
      setActive(name)
      if (!WEAVER_LOOPING.has(name)) {
        finished = (event) => {
          if (event.action !== next) return
          playClip('Idle')
        }
        mixer.addEventListener('finished', finished)
      }
    }
    playRef.current = playClip

    const loop = () => {
      if (disposed) return
      frame = requestAnimationFrame(loop)
      if (document.hidden) return
      const dt = clock.getDelta()
      mixer?.update(dt)
      if (!reducedMotion) {
        rig.position.y = Math.sin(clock.elapsedTime * 0.7) * 0.035
      }
      controls.update()
      renderer.render(scene, camera)
    }

    const onVisibility = () => {
      if (!document.hidden && !disposed) {
        clock.getDelta()
        cancelAnimationFrame(frame)
        frame = requestAnimationFrame(loop)
      }
    }

    fit()
    window.addEventListener('resize', fit)
    document.addEventListener('visibilitychange', onVisibility)

    const loader = new GLTFLoader()
    loader.load(
      WEAVER_MODEL_URL,
      (gltf) => {
        if (disposed) {
          disposeObject(gltf.scene)
          return
        }
        gltf.scene.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.castShadow = true
            object.receiveShadow = true
          }
        })
        rig.add(gltf.scene)
        frameModel(rig)

        mixer = new THREE.AnimationMixer(gltf.scene)
        for (const name of WEAVER_CLIPS) {
          const clip = THREE.AnimationClip.findByName(gltf.animations, name)
          if (!clip) continue
          actions.set(name, mixer.clipAction(clip))
        }

        const idle = actions.get('Idle')
        if (idle) {
          idle.setLoop(THREE.LoopRepeat, Infinity)
          idle.play()
          if (reducedMotion) {
            mixer.update(0)
            idle.paused = true
          }
        }

        setStatus('ready')
        frame = requestAnimationFrame(loop)
      },
      undefined,
      () => {
        if (!disposed) setStatus('error')
      },
    )

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', fit)
      document.removeEventListener('visibilitychange', onVisibility)
      if (mixer && finished) mixer.removeEventListener('finished', finished)
      mixer?.stopAllAction()
      actions.clear()
      controls.dispose()
      disposeObject(scene)
      floor.geometry.dispose()
      floor.material.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
    }
  }, [])

  return (
    <main id="main-content" className={styles.lab}>
      <div ref={hostRef} className={styles.viewport} aria-hidden="true" />
      {status === 'nowebgl' || status === 'error' ? (
        <div className={styles.fallback} role="alert">
          <p>
            {status === 'nowebgl'
              ? 'WebGL is unavailable, so WEAVER-01 cannot be previewed in this browser.'
              : 'WEAVER-01 failed to load. Confirm public/models/weaver-01.glb is available and try again.'}
          </p>
        </div>
      ) : (
        <div className={styles.chrome}>
          <header className={styles.meta}>
            <p className={styles.kicker}>WEAVER-01 / LAB</p>
            <h1 className={styles.title}>System Weaver</h1>
            <p className={styles.note}>Isolated GLB preview. Idle loops by default.</p>
            {status === 'loading' && <p className={styles.status}>Loading model</p>}
          </header>
          <div className={styles.dock} role="toolbar" aria-label="WEAVER-01 animation clips">
            {WEAVER_CLIPS.map((name) => (
              <button
                key={name}
                type="button"
                className={styles.clip}
                aria-pressed={active === name}
                disabled={status !== 'ready'}
                onClick={() => playRef.current(name)}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
