'use client'

import { useEffect, useRef, type RefObject } from 'react'
import styles from './StoryThread.module.css'

type StoryThreadProps = {
  rootRef: RefObject<HTMLElement | null>
  reducedMotion: boolean
}

type Point = { x: number; y: number }

function readPoint(el: HTMLElement | null): Point | null {
  if (!el) return null
  const rect = el.getBoundingClientRect()
  return { x: rect.left + rect.width * 0.5, y: rect.top + rect.height * 0.5 }
}

export default function StoryThread({ rootRef, reducedMotion }: StoryThreadProps) {
  const pathRef = useRef<SVGPathElement>(null)
  const glowRef = useRef<SVGPathElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const path = pathRef.current
    const glow = glowRef.current
    if (!root || !path || !glow) return

    const draw = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      const anchors = [
        readPoint(root.querySelector('[data-thread-anchor="hero"]')),
        readPoint(root.querySelector('[data-thread-anchor="process"]')),
        ...Array.from(root.querySelectorAll('[data-thread-anchor^="project-"]')).map((node) =>
          readPoint(node as HTMLElement),
        ),
        readPoint(root.querySelector('[data-thread-anchor="skills"]')),
        readPoint(root.querySelector('[data-thread-anchor="contact"]')),
      ].filter((p): p is Point => !!p)

      if (anchors.length < 2) return

      const start = anchors[0]
      const end = anchors[anchors.length - 1]
      const mid = anchors[Math.floor(anchors.length / 2)] ?? start
      const c1x = start.x + (mid.x - start.x) * 0.45
      const c1y = start.y + h * 0.08
      const c2x = end.x - (end.x - mid.x) * 0.35
      const c2y = end.y - h * 0.06
      const d = `M ${start.x} ${start.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${end.x} ${end.y}`
      path.setAttribute('d', d)
      glow.setAttribute('d', d)
      path.setAttribute('viewBox', `0 0 ${w} ${h}`)
    }

    draw()
    window.addEventListener('scroll', draw, { passive: true })
    window.addEventListener('resize', draw)
    return () => {
      window.removeEventListener('scroll', draw)
      window.removeEventListener('resize', draw)
    }
  }, [rootRef, reducedMotion])

  return (
    <svg className={styles.thread} aria-hidden="true">
      <path ref={glowRef} className={styles.glow} />
      <path ref={pathRef} className={styles.line} />
    </svg>
  )
}
