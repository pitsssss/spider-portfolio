'use client'

import { useEffect, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import {
  MACBOOK_CLIPS,
  MACBOOK_CROSSFADE,
  MACBOOK_DRACO_PATH,
  MACBOOK_LOOPING,
  MACBOOK_MAX_DPR,
  MACBOOK_MODEL_URL,
  type MacbookClip,
} from './macbookConfig'
import {
  MACBOOK_CAMERA_LOOK_AT,
  MACBOOK_CAMERA_POSITION,
  damp,
  dampEuler,
  dampVec3,
  disposeObject,
  getViewportTier,
  hasWebGL,
  placePresentationGroup,
  placeShadowFloor,
  tuneMacbookMaterials,
} from './macbookCore'
import {
  chapterToNarrative,
  getMacbookPoses,
  getPoseForAlign,
  interpolateMacbookPose,
  MACBOOK_JOURNEY_MODEL_SCALE,
  type ContentAlign,
} from './macbookJourneyConfig'
import { JOURNEY_CHAPTER_ORDER, type JourneyChapterKey } from '../weaver/chapterConfig'
import styles from './MacbookJourney.module.css'

type MacbookJourneyProps = {
  rootRef: RefObject<HTMLElement | null>
  reducedMotion: boolean
  onChapterChange?: (key: JourneyChapterKey, progress: number, local: number) => void
}

type ScrollSegment = { key: JourneyChapterKey; element: HTMLElement }

function getSectionAlign(element: HTMLElement): ContentAlign {
  const value = element.dataset.contentAlign
  if (value === 'right' || value === 'center') return value
  return 'left'
}

function findSegment(segments: ScrollSegment[], key: JourneyChapterKey) {
  return segments.find((segment) => segment.key === key)
}

function collectSegments(root: HTMLElement): ScrollSegment[] {
  return JOURNEY_CHAPTER_ORDER.flatMap((key) => {
    const element = root.querySelector<HTMLElement>(`[data-journey-chapter="${key}"]`)
    return element ? [{ key, element }] : []
  })
}

function readScroll(root: HTMLElement, segments: ScrollSegment[]) {
  const probe = window.scrollY + window.innerHeight * 0.42
  for (let i = 0; i < segments.length; i++) {
    const { key, element } = segments[i]
    const top = element.offsetTop
    const height = Math.max(element.offsetHeight, 1)
    const bottom = top + height
    if (probe < bottom || i === segments.length - 1) {
      const local = Math.max(0, Math.min(1, (probe - top) / height))
      const next = segments[i + 1]
      return {
        key,
        local,
        nextKey: next?.key ?? key,
        blend: local,
      }
    }
  }
  const last = segments[segments.length - 1]
  return { key: last.key, local: 1, nextKey: last.key, blend: 1 }
}

export default function MacbookJourney({
  rootRef,
  reducedMotion,
  onChapterChange,
}: MacbookJourneyProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const onChapterChangeRef = useRef(onChapterChange)
  const devHudRef = useRef<HTMLDivElement>(null)
  onChapterChangeRef.current = onChapterChange

  useEffect(() => {
    const host = hostRef.current
    const root = rootRef.current
    if (!host || !root) return

    if (!hasWebGL()) {
      host.classList.add(styles.fallbackActive)
      return
    }

    const mobile = getViewportTier() === 'mobile'
    const staticJourney = reducedMotion || mobile
    let disposed = false
    let frame = 0
    let tier = getViewportTier()
    let poses = getMacbookPoses(tier)
    let segments = collectSegments(root)
    let lastChapter: JourneyChapterKey | null = null
    let closePlayed = false
    let openPlayed = false

    let mixer: THREE.AnimationMixer | null = null
    let finished: ((event: { action: THREE.AnimationAction }) => void) | null = null
    const actions = new Map<MacbookClip, THREE.AnimationAction>()
    let pmrem: THREE.PMREMGenerator | null = null
    let envMap: THREE.Texture | null = null
    let modelReady = false
    let elapsed = 0

    const basePos = new THREE.Vector3()
    const baseRot = new THREE.Euler(0, -0.18, 0)
    const idlePos = new THREE.Vector3()
    const idleRot = new THREE.Euler()
    const current = {
      position: new THREE.Vector3(),
      rotation: new THREE.Euler(0, -0.18, 0),
      scaleMul: 1,
    }
    const target = {
      position: new THREE.Vector3(),
      rotation: new THREE.Euler(0, -0.18, 0),
      scaleMul: 1,
    }
    const tmpEuler = new THREE.Euler()

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, MACBOOK_MAX_DPR))
    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.14
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    host.appendChild(renderer.domElement)

    const scene = new THREE.Scene()

    pmrem = new THREE.PMREMGenerator(renderer)
    pmrem.compileEquirectangularShader()
    envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = envMap

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200)
    camera.position.copy(MACBOOK_CAMERA_POSITION)
    camera.lookAt(MACBOOK_CAMERA_LOOK_AT)

    const clock = new THREE.Clock()

    const hemi = new THREE.HemisphereLight(0xf7f2ea, 0xcadde3, 0.42)
    scene.add(hemi)

    const keyLight = new THREE.DirectionalLight(0xfff1df, 2.1)
    keyLight.position.set(-3.6, 5.8, 4.2)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.set(2048, 2048)
    keyLight.shadow.radius = 3
    keyLight.shadow.bias = -0.00015
    keyLight.shadow.normalBias = 0.02
    keyLight.shadow.camera.near = 0.1
    keyLight.shadow.camera.far = 40
    scene.add(keyLight)

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

    const journeyGroup = new THREE.Group()
    scene.add(journeyGroup)

    const presentationGroup = new THREE.Group()
    journeyGroup.add(presentationGroup)

    const applyTargetPose = (pose: ReturnType<typeof interpolateMacbookPose>) => {
      target.position.set(pose.offset.x, pose.offset.y, pose.offset.z)
      target.rotation.set(pose.rotation.x, pose.rotation.y, pose.rotation.z)
      target.scaleMul = pose.scaleMul
    }

    const setHeroTarget = () => {
      applyTargetPose(poses.hero)
    }
    setHeroTarget()

    const playClip = (name: MacbookClip, onComplete?: () => void) => {
      const next = actions.get(name)
      if (!next || !mixer) return
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
      next.fadeIn(MACBOOK_CROSSFADE).play()
      if (!MACBOOK_LOOPING.has(name)) {
        finished = (event) => {
          if (event.action !== next) return
          onComplete?.()
        }
        mixer.addEventListener('finished', finished)
      }
    }

    const updateJourneyTarget = () => {
      if (staticJourney) {
        setHeroTarget()
        return
      }
      if (segments.length === 0) segments = collectSegments(root)
      const scroll = readScroll(root, segments)
      const currentNarrative = chapterToNarrative(scroll.key)
      const nextNarrative = chapterToNarrative(scroll.nextKey)
      const currentSeg = findSegment(segments, scroll.key)
      const nextSeg = findSegment(segments, scroll.nextKey)
      const currentAlign = currentSeg ? getSectionAlign(currentSeg.element) : 'left'
      const nextAlign = nextSeg ? getSectionAlign(nextSeg.element) : currentAlign
      const pose = interpolateMacbookPose(
        getPoseForAlign(currentAlign, tier, currentNarrative),
        getPoseForAlign(nextAlign, tier, nextNarrative),
        scroll.blend,
      )
      applyTargetPose(pose)

      if (scroll.key !== lastChapter) {
        lastChapter = scroll.key
        onChapterChangeRef.current?.(scroll.key, scroll.local, scroll.local)
      }

      if (process.env.NODE_ENV === 'development' && devHudRef.current) {
        devHudRef.current.textContent = `${currentNarrative} · ${currentAlign} · ${scroll.local.toFixed(2)}`
      }

      if (scroll.key === 'contact' && scroll.local > 0.72 && !closePlayed && modelReady) {
        closePlayed = true
        playClip('Close')
      }
    }

    const applyIdleMotion = () => {
      if (reducedMotion) {
        idlePos.set(0, 0, 0)
        idleRot.set(0, 0, 0)
        return
      }
      const t = elapsed
      idlePos.set(
        Math.cos(t * 0.28) * 0.008 + Math.sin(t * 0.17) * 0.004,
        Math.sin(t * 0.42) * 0.016 + Math.sin(t * 0.19) * 0.007,
        Math.sin(t * 0.33) * 0.005,
      )
      idleRot.set(
        Math.sin(t * 0.37) * 0.014,
        Math.sin(t * 0.31) * 0.024,
        Math.sin(t * 0.23) * 0.006,
      )
    }

    const fitViewport = () => {
      const vw = Math.max(host.clientWidth, 1)
      const vh = Math.max(host.clientHeight, 1)
      camera.aspect = vw / vh
      camera.updateProjectionMatrix()
      renderer.setSize(vw, vh, false)
    }

    const loop = () => {
      if (disposed) return
      frame = requestAnimationFrame(loop)
      if (document.hidden) return

      const dt = Math.min(clock.getDelta(), 0.05)
      elapsed += dt
      mixer?.update(dt)

      if (!staticJourney && modelReady) {
        updateJourneyTarget()
        dampVec3(basePos, target.position, 2.15, dt, basePos)
        dampEuler(baseRot, target.rotation, 2.15, dt, tmpEuler)
        baseRot.copy(tmpEuler)
        const nextScale = damp(current.scaleMul, target.scaleMul, 2.15, dt)
        current.scaleMul = nextScale
        const breathe = reducedMotion ? 0 : Math.sin(elapsed * 0.34) * 0.014
        journeyGroup.scale.setScalar(nextScale + breathe)

        applyIdleMotion()
        journeyGroup.position.set(
          basePos.x + idlePos.x,
          basePos.y + idlePos.y,
          basePos.z + idlePos.z,
        )
        journeyGroup.rotation.set(
          baseRot.x + idleRot.x,
          baseRot.y + idleRot.y,
          baseRot.z + idleRot.z,
        )
      } else if (staticJourney && modelReady) {
        applyIdleMotion()
        journeyGroup.position.set(
          basePos.x + idlePos.x * 0.35,
          basePos.y + idlePos.y * 0.35,
          basePos.z + idlePos.z * 0.35,
        )
        journeyGroup.rotation.set(
          baseRot.x + idleRot.x * 0.35,
          baseRot.y + idleRot.y * 0.35,
          baseRot.z + idleRot.z * 0.35,
        )
      }

      renderer.render(scene, camera)
    }

    const onScroll = () => {
      if (!staticJourney) updateJourneyTarget()
    }

    const onResize = () => {
      const nextTier = getViewportTier()
      if (nextTier !== tier) {
        tier = nextTier
        poses = getMacbookPoses(tier)
      }
      segments = collectSegments(root)
      fitViewport()
      if (staticJourney) setHeroTarget()
      else updateJourneyTarget()
    }

    const onVisibility = () => {
      if (!document.hidden && !disposed) {
        clock.getDelta()
        cancelAnimationFrame(frame)
        frame = requestAnimationFrame(loop)
      }
    }

    fitViewport()
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)

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
        placePresentationGroup(presentationGroup, gltf.scene, MACBOOK_JOURNEY_MODEL_SCALE)
        placeShadowFloor(floor, gltf.scene)

        if (process.env.NODE_ENV === 'development') {
          console.info('[MacbookJourney] clips:', gltf.animations.map((c) => c.name))
        }

        mixer = new THREE.AnimationMixer(gltf.scene)
        for (const name of MACBOOK_CLIPS) {
          const clip = THREE.AnimationClip.findByName(gltf.animations, name)
          if (clip) actions.set(name, mixer.clipAction(clip))
        }

        modelReady = true

        if (reducedMotion) {
          const open = actions.get('Open')
          if (open) {
            open.setLoop(THREE.LoopOnce, 1)
            open.clampWhenFinished = true
            open.play()
            open.time = open.getClip().duration
            mixer.update(0)
            open.paused = true
          }
        } else if (!openPlayed) {
          openPlayed = true
          playClip('Open')
        }

        journeyGroup.position.copy(target.position)
        journeyGroup.rotation.copy(target.rotation)
        basePos.copy(target.position)
        baseRot.copy(target.rotation)
        journeyGroup.scale.setScalar(target.scaleMul)
        current.scaleMul = target.scaleMul

        updateJourneyTarget()
        renderer.render(scene, camera)
        frame = requestAnimationFrame(loop)
      },
      undefined,
      (error) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('[MacbookJourney] GLTF load error:', error)
        }
        host.classList.add(styles.fallbackActive)
      },
    )

    frame = requestAnimationFrame(loop)

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', onVisibility)
      if (mixer && finished) mixer.removeEventListener('finished', finished)
      mixer?.stopAllAction()
      actions.clear()
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
  }, [reducedMotion, rootRef])

  return (
    <>
      <div ref={hostRef} className={styles.stage} aria-hidden="true">
        <div className={styles.fallback} />
      </div>
      {process.env.NODE_ENV === 'development' && (
        <div ref={devHudRef} className={styles.devHud} aria-hidden="true" />
      )}
    </>
  )
}
