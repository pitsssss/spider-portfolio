import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export type StoryState = {
  assemble: number
  open: number
  portal: number
  layers: number
  path: number
  converge: number
  signal: number
  camX: number
  camY: number
  camZ: number
  camLookY: number
  rotX: number
  rotY: number
  coreScale: number
  cyan: number
  amber: number
}

export function createStoryState(): StoryState {
  return {
    assemble: 0,
    open: 0,
    portal: 0,
    layers: 0,
    path: 0,
    converge: 0,
    signal: 0,
    camX: -0.42,
    camY: 0.32,
    camZ: 3.55,
    camLookY: 0.05,
    rotX: 0.22,
    rotY: 0.18,
    coreScale: 0.72,
    cyan: 10,
    amber: 4,
  }
}

export function createStoryTimeline(
  root: HTMLElement,
  state: StoryState,
  reducedMotion: boolean,
): () => void {
  if (reducedMotion) {
    Object.assign(state, {
      assemble: 1,
      open: 0.28,
      portal: 0,
      layers: 0.18,
      path: 0,
      converge: 0,
      signal: 0,
      camX: 0.15,
      camY: 0.08,
      camZ: 5.5,
      camLookY: 0,
      rotX: 0.12,
      rotY: 0.4,
      coreScale: 1,
      cyan: 16,
      amber: 7,
    })
    return () => undefined
  }

  const ctx = gsap.context(() => {
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: root,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.2,
      },
    })

    tl.to(state, {
      assemble: 1,
      coreScale: 1,
      camX: 0.08,
      camY: 0.1,
      camZ: 5.35,
      rotY: 0.55,
      rotX: 0.1,
      cyan: 16,
      duration: 0.14,
    })
    tl.to(state, {
      open: 1,
      camX: 1.15,
      camY: 0.18,
      camZ: 6.15,
      camLookY: 0.08,
      rotY: 0.9,
      cyan: 18,
      amber: 8,
      duration: 0.13,
    })
    tl.to(state, {
      portal: 1,
      camX: -0.85,
      camZ: 5.7,
      rotY: 1.15,
      duration: 0.0875,
    })
    tl.to(state, {
      portal: 2,
      camX: 0.95,
      camY: 0.22,
      camZ: 5.85,
      rotY: 1.45,
      duration: 0.0875,
    })
    tl.to(state, {
      portal: 3,
      camX: -0.7,
      camY: -0.05,
      camZ: 5.6,
      rotY: 1.75,
      duration: 0.0875,
    })
    tl.to(state, {
      portal: 4,
      camX: 0.55,
      camY: 0.12,
      camZ: 5.9,
      rotY: 2.05,
      duration: 0.0875,
    })
    tl.to(state, {
      layers: 1,
      open: 0.55,
      camX: 0.2,
      camY: 0.35,
      camZ: 7.1,
      rotX: 0.28,
      rotY: 2.2,
      duration: 0.13,
    })
    tl.to(state, {
      path: 1,
      layers: 0.35,
      camX: 1.35,
      camY: 0,
      camZ: 6.4,
      rotX: 0.05,
      rotY: 2.45,
      duration: 0.1,
    })
    tl.to(state, {
      converge: 1,
      path: 0.15,
      layers: 0.08,
      open: 0.2,
      camX: 0,
      camY: 0.06,
      camZ: 5.2,
      rotX: 0.08,
      rotY: 2.7,
      coreScale: 1.05,
      duration: 0.08,
    })
    tl.to(state, {
      signal: 1,
      open: 0.85,
      converge: 0.7,
      camZ: 4.35,
      camY: 0.02,
      coreScale: 1.22,
      cyan: 26,
      amber: 12,
      rotY: 2.95,
      duration: 0.07,
    })

    root.querySelectorAll<HTMLElement>('[data-chapter]').forEach((chapter, index, list) => {
      const copy = chapter.querySelector('.chapter-copy')
      if (!copy) return
      gsap.fromTo(
        copy,
        { opacity: 0.12, y: 40 },
        {
          opacity: 1,
          y: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: chapter,
            start: 'top 78%',
            end: 'top 36%',
            scrub: 0.85,
          },
        },
      )
      if (index === list.length - 1) return
      gsap.to(copy, {
        opacity: 0.08,
        y: -32,
        ease: 'none',
        scrollTrigger: {
          trigger: chapter,
          start: 'bottom 62%',
          end: 'bottom top',
          scrub: 0.85,
        },
      })
    })
  }, root)

  return () => ctx.revert()
}
