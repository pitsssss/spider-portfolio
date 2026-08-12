'use client'

import { useEffect } from 'react'

const MAX_WHEEL_DELTA = 44
const SCROLL_LERP = 0.072
const STOP_THRESHOLD = 0.35

type SmoothScrollOptions = {
  enabled: boolean
}

export function useJourneySmoothScroll({ enabled }: SmoothScrollOptions) {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    let target = window.scrollY
    let current = window.scrollY
    let frame = 0
    let wheelLocked = false

    const maxScroll = () =>
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight)

    const clamp = (value: number) => Math.max(0, Math.min(maxScroll(), value))

    const syncFromNative = () => {
      if (wheelLocked) return
      target = window.scrollY
      current = window.scrollY
    }

    const scrollToTarget = (next: number) => {
      target = clamp(next)
    }

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return
      event.preventDefault()
      wheelLocked = true
      const raw = event.deltaY
      const capped = Math.sign(raw) * Math.min(Math.abs(raw), MAX_WHEEL_DELTA)
      scrollToTarget(target + capped)
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const step = window.innerHeight * 0.58
      if (event.key === 'PageDown') {
        event.preventDefault()
        scrollToTarget(target + step)
      } else if (event.key === 'PageUp') {
        event.preventDefault()
        scrollToTarget(target - step)
      } else if (event.key === 'Home') {
        event.preventDefault()
        scrollToTarget(0)
      } else if (event.key === 'End') {
        event.preventDefault()
        scrollToTarget(maxScroll())
      } else if (event.key === ' ' && !event.shiftKey) {
        event.preventDefault()
        scrollToTarget(target + step)
      } else if (event.key === ' ' && event.shiftKey) {
        event.preventDefault()
        scrollToTarget(target - step)
      }
    }

    const onAnchorClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement | null)?.closest('a[href^="#"]') as
        | HTMLAnchorElement
        | null
      if (!anchor) return
      const href = anchor.getAttribute('href')
      if (!href || href === '#') return
      const id = href.slice(1)
      if (!id) return
      const el = document.getElementById(id)
      if (!el) return
      event.preventDefault()
      scrollToTarget(el.getBoundingClientRect().top + window.scrollY - 12)
    }

    const tick = () => {
      const diff = target - current
      if (Math.abs(diff) > STOP_THRESHOLD) {
        current += diff * SCROLL_LERP
        window.scrollTo(0, current)
      } else {
        current = target
        wheelLocked = false
      }
      frame = requestAnimationFrame(tick)
    }

    syncFromNative()
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('scroll', syncFromNative, { passive: true })
    document.addEventListener('click', onAnchorClick)
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('scroll', syncFromNative)
      document.removeEventListener('click', onAnchorClick)
    }
  }, [enabled])
}
