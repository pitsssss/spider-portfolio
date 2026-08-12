'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import {
  MACBOOK_CLIPS,
  MACBOOK_CROSSFADE,
  MACBOOK_DRACO_PATH,
  MACBOOK_LOOPING,
  MACBOOK_MAX_DPR,
  MACBOOK_MODEL_URL,
  type MacbookClip,
} from './macbookConfig'
import styles from './MacbookLab.module.css'

type Status = 'loading' | 'ready' | 'nowebgl' | 'error'

const TARGET_CENTER = new THREE.Vector3(2.8, 0.3, 0)
const CAMERA_LOOK_AT = new THREE.Vector3(2.5, 1.2, 0)

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

function isFiniteBox3(box: THREE.Box3): boolean {
  return (
    Number.isFinite(box.min.x) &&
    Number.isFinite(box.min.y) &&
    Number.isFinite(box.min.z) &&
    Number.isFinite(box.max.x) &&
    Number.isFinite(box.max.y) &&
    Number.isFinite(box.max.z)
  )
}

function tuneMacbookMaterials(root: THREE.Object3D, env: THREE.Texture | null): void {
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    const materials = Array.isArray(object.material) ? object.material : [object.material]
    for (const mat of materials) {
      if (!(mat instanceof THREE.MeshStandardMaterial)) continue
      if (env) mat.envMap = env
      mat.envMapIntensity = mat.name === 'aluminium' ? 1.35 : mat.name === 'blackmatte' ? 0.85 : 0.65
      if (mat.name === 'aluminium') {
        mat.metalness = 0.92
        mat.roughness = 0.22
      } else if (mat.name === 'blackmatte') {
        mat.metalness = 0.35
        mat.roughness = 0.38
      } else if (mat.name === 'matte') {
        mat.metalness = 0.08
        mat.roughness = 0.42
      }
      mat.needsUpdate = true
    }
  })
}

function placePresentationGroup(presentationGroup: THREE.Group, model: THREE.Object3D) {
  model.updateMatrixWorld(true)
  const box = new THREE.Box3().setFromObject(model)

  if (!isFiniteBox3(box)) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[MacbookLab] invalid bbox', box.min, box.max)
    }
    presentationGroup.scale.setScalar(0.11)
    presentationGroup.position.copy(TARGET_CENTER)
    return { scale: 0.11, size: new THREE.Vector3(), center: new THREE.Vector3(), box }
  }

  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z)

  let scale = 0.11
  if (maxDim > 0 && Number.isFinite(maxDim)) {
    scale = 10 / maxDim
  }
  if (!Number.isFinite(scale) || scale <= 0) {
    scale = 0.11
  }

  presentationGroup.scale.setScalar(scale)
  presentationGroup.position.set(
    TARGET_CENTER.x - center.x * scale,
    TARGET_CENTER.y - center.y * scale,
    TARGET_CENTER.z - center.z * scale,
  )
  presentationGroup.visible = true
  model.visible = true
  presentationGroup.updateMatrixWorld(true)

  return { scale, size, center, box }
}

function placeShadowFloor(floor: THREE.Mesh, model: THREE.Object3D) {
  model.updateMatrixWorld(true)
  const worldBox = new THREE.Box3().setFromObject(model)
  if (!isFiniteBox3(worldBox)) return

  const footprint = Math.max(worldBox.max.x - worldBox.min.x, worldBox.max.z - worldBox.min.z, 0.4)
  floor.position.set(
    (worldBox.min.x + worldBox.max.x) * 0.5,
    worldBox.min.y + 0.001,
    (worldBox.min.z + worldBox.max.z) * 0.5,
  )
  floor.scale.setScalar(Math.max(footprint * 0.55, 0.35))
  floor.visible = true
}

export default function MacbookLab() {
  const hostRef = useRef<HTMLDivElement>(null)
  const playRef = useRef<(name: MacbookClip) => void>(() => undefined)
  const pauseRef = useRef<() => void>(() => undefined)
  const [status, setStatus] = useState<Status>('loading')
  const [active, setActive] = useState<MacbookClip | 'Pause'>('Open')
  const [paused, setPaused] = useState(false)
  const [clipNames, setClipNames] = useState<string[]>([])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    if (!hasWebGL()) {
      setStatus('nowebgl')
      return
    }

    const reducedMotion = prefersReducedMotion()
    const mobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768
    let disposed = false
    let frame = 0
    let mixer: THREE.AnimationMixer | null = null
    let current: MacbookClip | null = null
    let isPaused = false
    let finished: ((event: { action: THREE.AnimationAction }) => void) | null = null
    let pmrem: THREE.PMREMGenerator | null = null
    let envMap: THREE.Texture | null = null

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, MACBOOK_MAX_DPR))
    renderer.setClearColor(0xeee9df, 1)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.14
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.domElement.style.opacity = '1'
    host.appendChild(renderer.domElement)

    if (process.env.NODE_ENV === 'development') {
      renderer.debug.checkShaderErrors = true
    }

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xeee9df)

    pmrem = new THREE.PMREMGenerator(renderer)
    pmrem.compileEquirectangularShader()
    envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = envMap

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200)
    camera.position.set(12, 7, 18)
    camera.lookAt(CAMERA_LOOK_AT)

    const clock = new THREE.Clock()

    const hemi = new THREE.HemisphereLight(0xf7f2ea, 0xcadde3, 0.42)
    scene.add(hemi)

    const key = new THREE.DirectionalLight(0xfff1df, 2.1)
    key.position.set(-3.6, 5.8, 4.2)
    key.castShadow = true
    key.shadow.mapSize.set(2048, 2048)
    key.shadow.radius = 3
    key.shadow.bias = -0.00015
    key.shadow.normalBias = 0.02
    key.shadow.camera.near = 0.1
    key.shadow.camera.far = 40
    scene.add(key)

    const fill = new THREE.DirectionalLight(0xdce8ef, 0.48)
    fill.position.set(2.8, 2.6, 4.8)
    scene.add(fill)

    const rim = new THREE.DirectionalLight(0xcadde3, 0.32)
    rim.position.set(4.8, 2.2, -2.6)
    scene.add(rim)

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(1, 64),
      new THREE.ShadowMaterial({ opacity: 0.12, color: 0x162027 }),
    )
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    floor.visible = false
    scene.add(floor)

    const presentationGroup = new THREE.Group()
    presentationGroup.visible = true
    scene.add(presentationGroup)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.enablePan = false
    controls.enableZoom = !mobile
    controls.autoRotate = false
    controls.rotateSpeed = mobile ? 0.45 : 0.55
    controls.minDistance = 8
    controls.maxDistance = 40
    controls.minPolarAngle = 0.45
    controls.maxPolarAngle = 1.25
    controls.target.copy(CAMERA_LOOK_AT)
    controls.update()

    const actions = new Map<MacbookClip, THREE.AnimationAction>()

    const fitViewport = () => {
      const vw = Math.max(host.clientWidth, 1)
      const vh = Math.max(host.clientHeight, 1)
      camera.aspect = vw / vh
      camera.updateProjectionMatrix()
      renderer.setSize(vw, vh, false)
    }

    const playClip = (name: MacbookClip, onComplete?: () => void) => {
      const next = actions.get(name)
      if (!next || !mixer) return
      const prev = current ? actions.get(current) : null
      if (finished) {
        mixer.removeEventListener('finished', finished)
        finished = null
      }
      next.reset()
      next.enabled = true
      next.paused = false
      next.clampWhenFinished = !MACBOOK_LOOPING.has(name)
      next.setLoop(
        MACBOOK_LOOPING.has(name) ? THREE.LoopRepeat : THREE.LoopOnce,
        MACBOOK_LOOPING.has(name) ? Infinity : 1,
      )
      if (prev && prev !== next) prev.fadeOut(MACBOOK_CROSSFADE)
      next.fadeIn(MACBOOK_CROSSFADE).play()
      current = name
      isPaused = false
      setPaused(false)
      setActive(name)

      if (!MACBOOK_LOOPING.has(name)) {
        finished = (event) => {
          if (event.action !== next) return
          onComplete?.()
        }
        mixer.addEventListener('finished', finished)
      }
    }
    playRef.current = playClip

    pauseRef.current = () => {
      if (!mixer) return
      isPaused = !isPaused
      for (const action of actions.values()) {
        action.paused = isPaused
      }
      setPaused(isPaused)
      setActive(isPaused ? 'Pause' : (current ?? 'Open'))
    }

    const loop = () => {
      if (disposed) return
      frame = requestAnimationFrame(loop)
      if (document.hidden) return
      if (!isPaused) {
        const dt = clock.getDelta()
        mixer?.update(dt)
      } else {
        clock.getDelta()
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

    const onContextLost = (event: Event) => {
      event.preventDefault()
      if (process.env.NODE_ENV === 'development') {
        console.error('[MacbookLab] WebGL context lost')
      }
    }

    fitViewport()
    window.addEventListener('resize', fitViewport)
    document.addEventListener('visibilitychange', onVisibility)
    renderer.domElement.addEventListener('webglcontextlost', onContextLost)

    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath(MACBOOK_DRACO_PATH)

    const loader = new GLTFLoader()
    loader.setDRACOLoader(dracoLoader)

    loader.load(
      MACBOOK_MODEL_URL,
      (gltf) => {
        if (disposed) {
          disposeObject(gltf.scene)
          return
        }

        dracoLoader.dispose()

        gltf.scene.visible = true
        gltf.scene.traverse((object) => {
          object.visible = true
          if (object instanceof THREE.Mesh) {
            object.castShadow = true
            object.receiveShadow = true
          }
        })

        tuneMacbookMaterials(gltf.scene, envMap)
        presentationGroup.add(gltf.scene)

        const placement = placePresentationGroup(presentationGroup, gltf.scene)
        placeShadowFloor(floor, gltf.scene)

        if (process.env.NODE_ENV === 'development') {
          console.table({
            bboxMin: {
              x: placement.box.min.x,
              y: placement.box.min.y,
              z: placement.box.min.z,
            },
            bboxMax: {
              x: placement.box.max.x,
              y: placement.box.max.y,
              z: placement.box.max.z,
            },
            size: {
              x: placement.size.x,
              y: placement.size.y,
              z: placement.size.z,
            },
            center: {
              x: placement.center.x,
              y: placement.center.y,
              z: placement.center.z,
            },
            scale: placement.scale,
            cameraPosition: {
              x: camera.position.x,
              y: camera.position.y,
              z: camera.position.z,
            },
          })
        }

        const discovered = gltf.animations.map((clip) => clip.name)
        setClipNames(discovered)
        if (process.env.NODE_ENV === 'development') {
          console.info('[MacbookLab] animation clips:', discovered)
        }

        mixer = new THREE.AnimationMixer(gltf.scene)
        for (const name of MACBOOK_CLIPS) {
          const clip = THREE.AnimationClip.findByName(gltf.animations, name)
          if (clip) actions.set(name, mixer.clipAction(clip))
        }

        if (reducedMotion) {
          const open = actions.get('Open')
          if (open) {
            open.setLoop(THREE.LoopOnce, 1)
            open.clampWhenFinished = true
            open.play()
            open.time = open.getClip().duration
            mixer.update(0)
            open.paused = true
            current = 'Open'
            setActive('Open')
          }
        } else {
          playClip('Open', () => playClip('HeroLoop'))
        }

        renderer.render(scene, camera)
        setStatus('ready')
        frame = requestAnimationFrame(loop)
      },
      undefined,
      (error) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('[MacbookLab] GLTF load error:', error)
        }
        if (!disposed) setStatus('error')
      },
    )

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', fitViewport)
      document.removeEventListener('visibilitychange', onVisibility)
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost)
      if (mixer && finished) mixer.removeEventListener('finished', finished)
      mixer?.stopAllAction()
      actions.clear()
      controls.dispose()
      dracoLoader.dispose()
      disposeObject(scene)
      floor.geometry.dispose()
      ;(floor.material as THREE.Material).dispose()
      envMap?.dispose()
      pmrem?.dispose()
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
              ? 'WebGL is unavailable, so the MacBook preview cannot run in this browser.'
              : 'The MacBook model failed to load. Confirm the GLB and Draco decoder are available, then try again.'}
          </p>
        </div>
      ) : (
        <div className={styles.chrome}>
          <header className={styles.meta}>
            <p className={styles.kicker}>MACBOOK / LAB</p>
            <h1 className={styles.title}>MacBook Pro Preview</h1>
            <p className={styles.note}>
              Isolated GLB preview. Open plays once, then HeroLoop.
            </p>
            {status === 'loading' && <p className={styles.status}>Loading model…</p>}
            {process.env.NODE_ENV === 'development' && clipNames.length > 0 && (
              <p className={styles.devClips}>Clips: {clipNames.join(', ')}</p>
            )}
          </header>
          <div className={styles.dock} role="toolbar" aria-label="MacBook animation controls">
            {MACBOOK_CLIPS.map((name) => (
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
            <button
              type="button"
              className={styles.clip}
              aria-pressed={paused}
              disabled={status !== 'ready'}
              onClick={() => pauseRef.current()}
            >
              Pause
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
