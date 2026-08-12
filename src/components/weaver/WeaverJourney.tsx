'use client'

import { useEffect, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import {
  getChapterPoses,
  interpolatePose,
  JOURNEY_CHAPTER_ORDER,
  resolveHeroClip,
  resolveProjectClip,
  type JourneyChapterKey,
} from './chapterConfig'
import { WEAVER_MAX_DPR, WEAVER_MODEL_URL, type WeaverClip } from './weaverConfig'
import {
  disposeObject,
  frameModelRoot,
  getViewportTier,
  hasWebGL,
  WeaverMixerController,
} from './weaverCore'
import styles from './WeaverJourney.module.css'

type WeaverJourneyProps = {
  rootRef: RefObject<HTMLElement | null>
  reducedMotion: boolean
  onChapterChange?: (key: JourneyChapterKey, progress: number) => void
}

type ScrollSegment = {
  key: JourneyChapterKey
  element: HTMLElement
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
    const height = element.offsetHeight
    const bottom = top + height
    if (probe < bottom || i === segments.length - 1) {
      const local = height > 0 ? (probe - top) / height : 0
      const next = segments[i + 1]
      return {
        key,
        local: Math.max(0, Math.min(1, local)),
        blend: Math.max(0, Math.min(1, local)),
        nextKey: next?.key ?? key,
        global: root.offsetHeight > window.innerHeight
          ? window.scrollY / (root.offsetHeight - window.innerHeight)
          : 0,
      }
    }
  }
  const last = segments[segments.length - 1]
  return { key: last.key, local: 1, blend: 1, nextKey: last.key, global: 1 }
}

function pickClip(key: JourneyChapterKey, local: number, played: Set<string>): WeaverClip | null {
  if (key === 'hero') {
    const clip = resolveHeroClip(local, played)
    if (clip === 'Descend') played.add('hero-descend')
    if (clip === 'Land') played.add('hero-land')
    return clip
  }
  if (key.startsWith('project-')) {
    const clip = resolveProjectClip(local, played, key)
    if (clip === 'WebPulse') played.add(`${key}-pulse`)
    if (clip === 'Inspect') played.add(`${key}-inspect`)
    return clip
  }
  if (key === 'process') return 'Crawl'
  if (key.startsWith('experience-')) return local > 0.12 ? 'Crawl' : 'Idle'
  if (key === 'contact' && local > 0.2 && !played.has('contact-pulse')) {
    played.add('contact-pulse')
    return 'WebPulse'
  }
  if (key === 'skills' || key === 'about') return 'Idle'
  return null
}

export default function WeaverJourney({ rootRef, reducedMotion, onChapterChange }: WeaverJourneyProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const onChapterChangeRef = useRef(onChapterChange)
  onChapterChangeRef.current = onChapterChange

  useEffect(() => {
    const host = hostRef.current
    const root = rootRef.current
    if (!host || !root) return

    if (!hasWebGL()) {
      host.classList.add(styles.fallbackActive)
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
    const pointer = { tx: 0, ty: 0 }

    const renderer = new THREE.WebGLRenderer({
      antialias: tier !== 'mobile',
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, WEAVER_MAX_DPR))
    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.08
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    host.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 50)
    const clock = new THREE.Clock()

    scene.add(new THREE.HemisphereLight(0x78e7ff, 0x07090e, 0.22))
    const keyLight = new THREE.DirectionalLight(0x78e7ff, 2.2)
    keyLight.position.set(3.2, 6.4, 3.6)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.set(1024, 1024)
    keyLight.shadow.radius = 4
    keyLight.shadow.bias = -0.00025
    keyLight.shadow.camera.near = 0.5
    keyLight.shadow.camera.far = 22
    keyLight.shadow.camera.left = -4
    keyLight.shadow.camera.right = 4
    keyLight.shadow.camera.top = 4
    keyLight.shadow.camera.bottom = -4
    scene.add(keyLight)

    const rimLight = new THREE.DirectionalLight(0xff8b5c, 0.55)
    rimLight.position.set(-4.2, 2.2, -3.4)
    scene.add(rimLight)

    const fillLight = new THREE.PointLight(0x78e7ff, 0.3, 12)
    fillLight.position.set(-1.4, 1.8, 3.2)
    scene.add(fillLight)

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(5, 48),
      new THREE.ShadowMaterial({ opacity: 0.32 }),
    )
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -0.02
    floor.receiveShadow = true
    scene.add(floor)

    const journeyGroup = new THREE.Group()
    scene.add(journeyGroup)
    const modelMount = new THREE.Group()
    journeyGroup.add(modelMount)

    const fit = () => {
      const width = Math.max(window.innerWidth, 1)
      const height = Math.max(window.innerHeight, 1)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
    }

    const updateScene = () => {
      if (segments.length === 0) segments = collectSegments(root)
      const scroll = readScroll(root, segments)
      const pose = interpolatePose(poses[scroll.key], poses[scroll.nextKey], scroll.blend)
      journeyGroup.position.set(pose.model.position.x, pose.model.position.y, pose.model.position.z)
      journeyGroup.rotation.set(pose.model.rotation.x, pose.model.rotation.y, pose.model.rotation.z)
      journeyGroup.scale.setScalar(pose.model.scale)
      camera.position.set(pose.camera.position.x, pose.camera.position.y, pose.camera.position.z)
      camera.lookAt(pose.camera.lookAt.x, pose.camera.lookAt.y, pose.camera.lookAt.z)
      keyLight.intensity = pose.lights.cyan
      fillLight.intensity = pose.lights.cyan * 0.14
      rimLight.intensity = pose.lights.amber

      if (!reducedMotion && mixer) {
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
          modelMount.rotation.y += (pointer.tx * 0.08 - modelMount.rotation.y) * 0.04
          modelMount.rotation.x += (pointer.ty * 0.04 - modelMount.rotation.x) * 0.04
        }
      }
    }

    const loop = () => {
      if (disposed) return
      frame = requestAnimationFrame(loop)
      if (document.hidden) return
      const dt = clock.getDelta()
      if (!reducedMotion) {
        mixer?.update(dt)
        updateScene()
      }
      renderer.render(scene, camera)
    }

    const onPointer = (event: PointerEvent) => {
      if (reducedMotion) return
      pointer.tx = (event.clientX / window.innerWidth - 0.5) * 2
      pointer.ty = -(event.clientY / window.innerHeight - 0.5) * 2
    }

    const onResize = () => {
      const nextTier = getViewportTier()
      if (nextTier !== tier) {
        tier = nextTier
        poses = getChapterPoses(tier)
      }
      segments = collectSegments(root)
      fit()
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
    window.addEventListener('scroll', updateScene, { passive: true })
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
        modelMount.add(gltf.scene)
        frameModelRoot(gltf.scene)
        mixer = new WeaverMixerController(gltf.scene, gltf.animations)
        if (reducedMotion) mixer.pauseIdle()
        updateScene()
        frame = requestAnimationFrame(loop)
      },
      undefined,
      () => host.classList.add(styles.fallbackActive),
    )

    if (reducedMotion) {
      updateScene()
      renderer.render(scene, camera)
    }

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', updateScene)
      document.removeEventListener('visibilitychange', onVisibility)
      mixer?.dispose()
      disposeObject(scene)
      floor.geometry.dispose()
      floor.material.dispose()
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
