'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { navItems } from '@/content/site'
import { profile } from '@/content/profile'
import { social, socialLinks } from '@/content/social'
import styles from './NavRail.module.css'

const CHAPTER_NAMES: Record<string, string> = {
  hero: '01 — INTRODUCTION',
  process: '02 — PROCESS',
  projects: '03 — SELECTED WORK',
  skills: '04 — EXPERTISE',
  experience: '05 — EXPERIENCE',
  about: '06 — ABOUT',
  contact: '07 — CONTACT',
}

export default function NavRail() {
  const [active, setActive] = useState('hero')
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [progress, setProgress] = useState(0)
  const [chapterLabel, setChapterLabel] = useState(CHAPTER_NAMES.hero)
  const menuId = useId()
  const menuBtnRef = useRef<HTMLButtonElement>(null)
  const firstLinkRef = useRef<HTMLAnchorElement>(null)
  const lastFocusableRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8)
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? window.scrollY / max : 0)
      const root = document.querySelector('[data-active-chapter]')
      const key = root?.getAttribute('data-active-chapter') ?? 'hero'
      const mapped =
        key.startsWith('project-') ? 'projects'
          : key.startsWith('experience-') ? 'experience'
            : key
      setChapterLabel(CHAPTER_NAMES[mapped] ?? CHAPTER_NAMES.hero)
      if (['hero', 'process', 'projects', 'skills', 'experience', 'about', 'contact'].includes(mapped)) {
        setActive(mapped === 'projects' ? 'projects' : mapped)
      }
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
    const previous = document.activeElement as HTMLElement | null
    firstLinkRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        return
      }
      if (event.key !== 'Tab') return
      const focusables = [
        firstLinkRef.current,
        ...Array.from(document.querySelectorAll<HTMLElement>(`#${CSS.escape(menuId)} a, #${CSS.escape(menuId)} button`)),
      ].filter(Boolean) as HTMLElement[]
      const unique = [...new Set(focusables)]
      if (unique.length === 0) return
      const first = unique[0]
      const last = unique[unique.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      previous?.focus?.()
      menuBtnRef.current?.focus()
    }
  }, [open, menuId])

  const close = () => setOpen(false)

  return (
    <>
      <header className={scrolled ? `${styles.rail} ${styles.scrolled}` : styles.rail}>
        <nav className={styles.bar} role="navigation" aria-label="Primary">
          <a href="#hero" className={styles.wordmark} aria-label={`${profile.name}, home`}>
            PETER TOSS
          </a>
          <div className={styles.signal} aria-hidden="true">
            <span className={styles.chapter}>{chapterLabel}</span>
            <span className={styles.track}>
              <span className={styles.fill} style={{ transform: `scaleX(${progress})` }} />
            </span>
          </div>
          <button
            ref={menuBtnRef}
            type="button"
            className={styles.menuBtn}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen(!open)}
          >
            <span>MENU</span>
            <span className={styles.menuIcon} aria-hidden="true">
              <i />
              <i />
            </span>
          </button>
        </nav>
      </header>

      {open && (
        <div
          id={menuId}
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          aria-label="Site chapters"
        >
          <div className={styles.overlayTop}>
            <p className={styles.overlayStatus}>{chapterLabel}</p>
            <button ref={lastFocusableRef} type="button" className={styles.closeBtn} onClick={close}>
              Close
            </button>
          </div>
          <div className={styles.overlayInner}>
            {navItems.map(({ id, label }, i) => (
              <a
                key={id}
                ref={i === 0 ? firstLinkRef : undefined}
                href={`#${id}`}
                className={active === id ? `${styles.overlayLink} ${styles.overlayActive}` : styles.overlayLink}
                onClick={close}
              >
                <span>{String(i + 1).padStart(2, '0')}</span>
                {label}
              </a>
            ))}
          </div>
          <div className={styles.overlayFooter}>
            <a href={social.email.href} onClick={close}>{profile.email}</a>
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={close}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
