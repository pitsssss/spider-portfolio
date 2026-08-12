'use client'

import { useEffect, useRef, useState } from 'react'
import { navItems } from '@/content/site'
import { profile } from '@/content/profile'
import styles from './NavRail.module.css'

export default function NavRail() {
  const [active, setActive] = useState('hero')
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [progress, setProgress] = useState(0)
  const [chapterLabel, setChapterLabel] = useState('00 Introduction')
  const menuRef = useRef<HTMLDivElement>(null)
  const firstLinkRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8)
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? window.scrollY / max : 0)
      const root = document.querySelector('[data-active-chapter]')
      const label = root?.getAttribute('data-chapter-label')
      if (label) setChapterLabel(label)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]?.target.id) setActive(visible[0].target.id)
      },
      { threshold: [0, 0.08, 0.2], rootMargin: '-28% 0px -48% 0px' },
    )
    navItems.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!open) return
    firstLinkRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <nav className={scrolled ? `${styles.rail} ${styles.scrolled}` : styles.rail} role="navigation" aria-label="Primary">
        <div className={styles.bar}>
          <a href="#hero" className={styles.monogram} aria-label={`${profile.name}, home`}>PT</a>
          <div className={styles.signal} aria-hidden="true">
            <span className={styles.chapter}>{chapterLabel}</span>
            <span className={styles.track}>
              <span className={styles.fill} style={{ transform: `scaleX(${progress})` }} />
            </span>
          </div>
          <div className={styles.links}>
            {navItems.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                className={active === id ? `${styles.link} ${styles.active}` : styles.link}
                aria-current={active === id ? 'true' : undefined}
              >
                {label}
              </a>
            ))}
          </div>
          <a href="#contact" className={styles.contact}>Contact</a>
          <button
            type="button"
            className={styles.menuBtn}
            aria-label={open ? 'Close chapter menu' : 'Open chapter menu'}
            aria-expanded={open}
            aria-controls="chapter-menu"
            onClick={() => setOpen(!open)}
          >
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
      </nav>

      {open && (
        <div id="chapter-menu" ref={menuRef} className={styles.overlay} role="dialog" aria-modal="true" aria-label="Chapters">
          <div className={styles.overlayInner}>
            {navItems.map(({ id, label }, i) => (
              <a
                key={id}
                ref={i === 0 ? firstLinkRef : undefined}
                href={`#${id}`}
                className={styles.overlayLink}
                onClick={() => setOpen(false)}
              >
                <span>{String(i).padStart(2, '0')}</span>
                {label}
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
