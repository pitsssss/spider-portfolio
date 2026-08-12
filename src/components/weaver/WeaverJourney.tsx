'use client'

import { useEffect, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import {
  getChapterPoses,
  HERO_YAW,
  interpolatePose,
  INTRO_SESSION_KEY,
  JOURNEY_CHAPTER_ORDER,
  resolveProjectClip,
  type JourneyChapterKey,
} from './chapterConfig'
import {
  computeIntroSnapshot,
  findNode,
  fitModelToHeroRegion,
  getHeroScreenBounds,
  getIntroTimings,
  HeroJointController,
  normalizeModelVisual,
  projectWorldToScreen,
  tuneWeaverMaterials,
  validateRearFacing,
  type IntroSnapshot,
} from './heroIntro'
import { WEAVER_MAX_DPR, WEAVER_MODEL_URL, type WeaverClip } from './weaverConfig'
import {
  disposeObject,
  getViewportTier,
  hasWebGL,
  smoothstep,
  WeaverMixerController,
} from './weaverCore'
import styles from './WeaverJourney.module.css'

type WeaverJourneyProps = {
  rootRef: RefObject<HTMLElement | null>
  reducedMotion: boolean
  onChapterChange?: (key: JourneyChapterKey, progress: number) => void
  onIntroPhase?: (phase: IntroPhase) => void
  onIntroSnapshot?: (snapshot: IntroSnapshot) => void
}

export type IntroPhase = 'pending' | 'environment' | 'descend' | 'settle' | 'pulse' | 'reveal' | 'idle' | 'skipped'

type ScrollSegment = { key: JourneyChapterKey; element: HTMLElement }

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
      const local = (probe - top) / height
      const next = segments[i + 1]
      return {
        key,
        local: Math.max(0, Math.min(1, local)),
        blend: Math.max(0, Math.min(1, local)),
        nextKey: next?.key ?? key,
        global:
          root.offsetHeight > window.innerHeight
            ? window.scrollY / (root.offsetHeight - window.innerHeight)
            : 0,
      }
    }
  }
  const last = segments[segments.length - 1]
  return { key: last.key, local: 1, blend: 1, nextKey: last.key, global: 1 }
}

function pickClip(key: JourneyChapterKey, local: number, played: Set<string>): WeaverClip | null {
  if (key === 'hero') return 'Idle'
  if (key.startsWith('project-')) {
    const clip = resolveProjectClip(local, played, key)
    if (clip === 'WebPulse') played.add(`${key}-pulse`)
    if (clip === 'Inspect') played.add(`${key}-inspect`)
    return clip
  }
  if (key === 'process') return local > 0.15 && local < 0.85 ? 'Crawl' : 'Idle'
  if (key.startsWith('experience-')) return local > 0.2 && local < 0.7 ? 'Crawl' : 'Idle'
  if (key === 'contact' && local > 0.25 && !played.has('contact-pulse')) {
    played.add('contact-pulse')
    return 'WebPulse'
  }
  return 'Idle'
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3
}

export default function WeaverJourney({
  rootRef,
  reducedMotion,
  onChapterChange,
  onIntroPhase,
  onIntroSnapshot,
}: WeaverJourneyProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const onChapterChangeRef = useRef(onChapterChange)
  const onIntroPhaseRef = useRef(onIntroPhase)
  const onIntroSnapshotRef = useRef(onIntroSnapshot)
  onChapterChangeRef.current = onChapterChange
  onIntroPhaseRef.current = onIntroPhase
  onIntroSnapshotRef.current = onIntroSnapshot

  useEffect(() => {
    const host = hostRef.current
    const root = rootRef.current
    if (!host || !root) return

    if (!hasWebGL()) {
      host.classList.add(styles.fallbackActive)
      onIntroPhaseRef.current?.('idle')
      return
    }

    let disposed = false
    let frame = 0
    let tier = getViewportTier()
    let poses = getChapterPoses(tier)
    let segments = collectSegments(root)
    let lastChapter: JourneyChapterKey | null = null
    let lastClip: WeaverClip | null = null
    const played = new Set<string>()
    let mixer: WeaverMixerController | null = null
    let joints: HeroJointController | null = null
    let spinnerRig: THREE.Object3D | null = null
    const pointer = { tx: 0, ty: 0 }
    let introActive = false
    let introStart = 0
    let introSkipped = false
    let introBlending = false
    let modelReady = false
    let heroFitScale = 1

    try {
      introActive = !reducedMotion && !sessionStorage.getItem(INTRO_SESSION_KEY) && window.scrollY < 24
    } catch {
      introActive = !reducedMotion && window.scrollY < 24
    }

    if (!introActive) onIntroPhaseRef.current?.('idle')
    else onIntroPhaseRef.current?.('pending')

    const renderer = new THREE.WebGLRenderer({
      antialias: tier !== 'mobile',
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, WEAVER_MAX_DPR))
    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.26
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    host.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 50)
    const clock = new THREE.Clock()

    const hemi = new THREE.HemisphereLight(0xcadde3, 0xeee9df, 0.9)
    scene.add(hemi)

    const keyLight = new THREE.DirectionalLight(0xfff4e5, 2.2)
    keyLight.position.set(-3.4, 5.8, 4.2)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.set(1024, 1024)
    keyLight.shadow.radius = 6
    keyLight.shadow.bias = -0.0002
    keyLight.shadow.camera.near = 0.5
    keyLight.shadow.camera.far = 24
    keyLight.shadow.camera.left = -5
    keyLight.shadow.camera.right = 5
    keyLight.shadow.camera.top = 5
    keyLight.shadow.camera.bottom = -5
    scene.add(keyLight)

    const cyanRim = new THREE.DirectionalLight(0x36cbe8, 0.85)
    cyanRim.position.set(4.2, 2.4, -2.8)
    scene.add(cyanRim)

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.65)
    fillLight.position.set(-1.5, 2.8, 5.5)
    scene.add(fillLight)

    const amberAccent = new THREE.PointLight(0xf3a63b, 0.28, 8)
    amberAccent.position.set(0.8, 0.9, 1.2)
    scene.add(amberAccent)

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(6, 64),
      new THREE.MeshStandardMaterial({
        color: 0xe8e3d8,
        metalness: 0.08,
        roughness: 0.35,
        transparent: true,
        opacity: 0.55,
      }),
    )
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -0.02
    floor.receiveShadow = true
    scene.add(floor)

    const contactShadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.9, 32),
      new THREE.ShadowMaterial({ opacity: 0.22 }),
    )
    contactShadow.rotation.x = -Math.PI / 2
    contactShadow.position.y = 0.01
    scene.add(contactShadow)

    const journeyGroup = new THREE.Group()
    scene.add(journeyGroup)
    const placementGroup = new THREE.Group()
    journeyGroup.add(placementGroup)
    const introMotionGroup = new THREE.Group()
    placementGroup.add(introMotionGroup)
    const modelVisual = new THREE.Group()
    introMotionGroup.add(modelVisual)

    const hangThread = new THREE.Mesh(
      new THREE.CylinderGeometry(0.003, 0.003, 1, 6),
      new THREE.MeshBasicMaterial({ color: 0xe8e4dc, transparent: true, opacity: 0.72 }),
    )
    hangThread.visible = false
    scene.add(hangThread)
    const hangMat = hangThread.material as THREE.MeshBasicMaterial

    const fit = () => {
      const width = Math.max(window.innerWidth, 1)
      const height = Math.max(window.innerHeight, 1)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
    }

    const refitHero = () => {
      if (!modelReady) return
      const bounds = getHeroScreenBounds(tier, window.innerWidth)
      const hero = poses.hero
      applyPose(hero, 0, false)
      const copyEl = root.querySelector<HTMLElement>('.heroCopy')
      const copyRight = copyEl?.getBoundingClientRect().right
      heroFitScale = fitModelToHeroRegion(
        placementGroup,
        modelVisual,
        camera,
        bounds,
        HERO_YAW,
        copyRight,
      )
    }

    const applyPose = (pose: ReturnType<typeof interpolatePose>, yBoost = 0, refit = true) => {
      journeyGroup.position.set(pose.model.position.x, pose.model.position.y + yBoost, pose.model.position.z)
      journeyGroup.rotation.set(pose.model.rotation.x, pose.model.rotation.y, pose.model.rotation.z)
      journeyGroup.scale.setScalar(pose.model.scale)
      camera.position.set(pose.camera.position.x, pose.camera.position.y, pose.camera.position.z)
      camera.lookAt(pose.camera.lookAt.x, pose.camera.lookAt.y, pose.camera.lookAt.z)
      keyLight.intensity = pose.lights.key
      cyanRim.intensity = pose.lights.rim
      fillLight.intensity = pose.lights.fill
      contactShadow.position.x = journeyGroup.position.x + placementGroup.position.x
      contactShadow.position.z = journeyGroup.position.z
      contactShadow.scale.setScalar(0.75 + heroFitScale * 0.25)
      if (refit && modelReady) refitHero()
    }

    const updateHangThread = () => {
      if (!spinnerRig || !hangThread.visible) return
      const top = new THREE.Vector3()
      const anchor = new THREE.Vector3()
      spinnerRig.getWorldPosition(anchor)
      top.set(anchor.x, anchor.y + 3.8, anchor.z)
      const mid = top.clone().lerp(anchor, 0.5)
      const len = top.distanceTo(anchor)
      hangThread.scale.set(1, len, 1)
      hangThread.position.copy(mid)
      hangThread.lookAt(anchor)
      hangThread.rotateX(Math.PI / 2)
    }

    const emitSnapshot = (snapshot: IntroSnapshot) => {
      if (spinnerRig && snapshot.phase !== 'establish') {
        snapshot.spinnerScreen = projectWorldToScreen(
          spinnerRig,
          camera,
          window.innerWidth,
          window.innerHeight,
        )
      }
      onIntroSnapshotRef.current?.(snapshot)
    }

    const finishIntro = (phase: IntroPhase = 'idle') => {
      introActive = false
      introSkipped = true
      introBlending = false
      hangThread.visible = false
      introMotionGroup.position.set(0, 0, 0)
      introMotionGroup.rotation.set(0, 0, 0)
      joints?.resetAll()
      try {
        sessionStorage.setItem(INTRO_SESSION_KEY, '1')
      } catch {
        /* ignore */
      }
      onIntroPhaseRef.current?.(phase)
      if (mixer) {
        mixer.play('Idle')
        lastClip = 'Idle'
      }
    }

    const runIntro = (elapsed: number) => {
      const hero = poses.hero
      const timings = getIntroTimings(tier)
      const t = elapsed
      const snap = computeIntroSnapshot(t, timings)
      applyPose(hero, 0, false)

      if (t < timings.establish) {
        onIntroPhaseRef.current?.('environment')
        introMotionGroup.position.y = 2.2
        hangThread.visible = true
        hangMat.opacity = 0.72 * (t / timings.establish)
        joints?.beginFrame()
        joints?.applyFold(1)
        emitSnapshot(snap)
        updateHangThread()
        return
      }

      if (t < timings.descendEnd) {
        onIntroPhaseRef.current?.('descend')
        const u = easeOutCubic((t - timings.establish) / (timings.descendEnd - timings.establish))
        const arcX = Math.sin(u * Math.PI) * (tier === 'mobile' ? 0.04 : 0.07)
        introMotionGroup.position.y = 2.2 * (1 - u)
        introMotionGroup.position.x = arcX
        introMotionGroup.rotation.z = Math.sin(t * 1.8) * 0.035 * (1 - u)
        introMotionGroup.rotation.y = Math.sin(t * 1.2) * 0.04 * (1 - u)
        hangThread.visible = true
        joints?.beginFrame()
        joints?.applyDescent(u, 1 - u * 0.55, {
          roll: Math.sin(t * 1.8) * 0.035 * (1 - u),
          yaw: Math.sin(t * 1.2) * 0.04 * (1 - u),
        })
        emitSnapshot(snap)
        updateHangThread()
        return
      }

      if (t < timings.settleEnd) {
        onIntroPhaseRef.current?.('settle')
        const u = (t - timings.descendEnd) / (timings.settleEnd - timings.descendEnd)
        const rebound = Math.sin(u * Math.PI) * 0.12
        introMotionGroup.position.y = rebound * 0.08
        introMotionGroup.position.x *= 0.92
        introMotionGroup.rotation.z *= 0.88
        hangThread.visible = true
        joints?.beginFrame()
        joints?.applySettle(u, rebound)
        joints?.setSpinnerPulse(Math.sin(u * Math.PI))
        emitSnapshot(snap)
        updateHangThread()
        return
      }

      if (t < timings.webEnd) {
        onIntroPhaseRef.current?.('pulse')
        introMotionGroup.position.y = 0
        hangThread.visible = true
        joints?.beginFrame()
        joints?.applyWebShot(snap.webProgress, snap.threadTension)
        emitSnapshot(snap)
        updateHangThread()
        return
      }

      if (t < timings.revealEnd) {
        onIntroPhaseRef.current?.('reveal')
        hangThread.visible = snap.threadTension > 0.15
        joints?.beginFrame()
        joints?.applyWebShot(1, snap.threadTension * 0.35)
        emitSnapshot(snap)
        updateHangThread()
        return
      }

      if (!introBlending) {
        introBlending = true
        joints?.startBlendOut()
      }
      const blended = joints?.updateBlendOut(400) ?? true
      hangThread.visible = false
      emitSnapshot(snap)
      if (blended && t >= timings.total) {
        finishIntro('idle')
      }
    }

    const updateScene = () => {
      if (segments.length === 0) segments = collectSegments(root)
      if (introActive && !introSkipped) return

      const scroll = readScroll(root, segments)
      const pose = interpolatePose(poses[scroll.key], poses[scroll.nextKey], scroll.blend)
      applyPose(pose)

      if (!reducedMotion && mixer && modelReady) {
        const clip = pickClip(scroll.key, scroll.local, played)
        if (clip && clip !== lastClip) {
          mixer.play(clip)
          lastClip = clip
        }
        if (scroll.key !== lastChapter) {
          lastChapter = scroll.key
          onChapterChangeRef.current?.(scroll.key, scroll.global)
        }
        if (mixer.getCurrent() === 'Idle') {
          modelVisual.rotation.y += (pointer.tx * 0.03 - modelVisual.rotation.y) * 0.03
          modelVisual.rotation.x += (pointer.ty * 0.02 - modelVisual.rotation.x) * 0.03
        }
      }
    }

    const loop = () => {
      if (disposed) return
      frame = requestAnimationFrame(loop)
      if (document.hidden) return
      const dt = clock.getDelta()
      if (!introActive || introSkipped) mixer?.update(dt)

      if (introActive && !introSkipped && modelReady) {
        if (!introStart) introStart = performance.now()
        runIntro((performance.now() - introStart) / 1000)
      } else if (!reducedMotion) {
        updateScene()
      }

      renderer.render(scene, camera)
    }

    const onPointer = (event: PointerEvent) => {
      if (reducedMotion) return
      pointer.tx = (event.clientX / window.innerWidth - 0.5) * 2
      pointer.ty = -(event.clientY / window.innerHeight - 0.5) * 2
    }

    const onScroll = () => {
      if (introActive && !introSkipped && window.scrollY > 40) {
        finishIntro('skipped')
      }
      updateScene()
    }

    const onResize = () => {
      const nextTier = getViewportTier()
      if (nextTier !== tier) {
        tier = nextTier
        poses = getChapterPoses(tier)
      }
      segments = collectSegments(root)
      fit()
      refitHero()
      updateScene()
    }

    const onVisibility = () => {
      if (!document.hidden && !disposed) {
        clock.getDelta()
        cancelAnimationFrame(frame)
        frame = requestAnimationFrame(loop)
      }
    }

    fit()
    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)

    new GLTFLoader().load(
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
        tuneWeaverMaterials(gltf.scene)
        normalizeModelVisual(modelVisual, gltf.scene)
        joints = new HeroJointController(gltf.scene)
        spinnerRig = findNode(gltf.scene, 'SpinnerRig')
        const headRig = findNode(gltf.scene, 'HeadRig')
        mixer = new WeaverMixerController(gltf.scene, gltf.animations)

        applyPose(poses.hero, 0, false)
        refitHero()
        validateRearFacing(headRig, spinnerRig, camera)

        if (reducedMotion) {
          mixer.pauseIdle()
          onIntroPhaseRef.current?.('idle')
        } else if (!introActive) {
          mixer.play('Idle')
          lastClip = 'Idle'
        } else {
          mixer.stopAllActions()
        }

        modelReady = true
        updateScene()
        frame = requestAnimationFrame(loop)
      },
      undefined,
      () => {
        host.classList.add(styles.fallbackActive)
        onIntroPhaseRef.current?.('idle')
      },
    )

    if (reducedMotion) {
      applyPose(poses.hero, 0, false)
      renderer.render(scene, camera)
    }

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', onVisibility)
      mixer?.dispose()
      disposeObject(scene)
      hangThread.geometry.dispose()
      ;(hangThread.material as THREE.Material).dispose()
      floor.geometry.dispose()
      ;(floor.material as THREE.Material).dispose()
      contactShadow.geometry.dispose()
      ;(contactShadow.material as THREE.Material).dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
    }
  }, [reducedMotion, rootRef])

  return (
    <div ref={hostRef} className={styles.stage} aria-hidden="true">
      <div className={styles.fallback} />
    </div>
  )
}
