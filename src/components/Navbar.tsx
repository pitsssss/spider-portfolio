'use client'
import { useState, useEffect } from 'react'
import { navItems } from '@/content/site'
import { profile } from '@/content/profile'

export default function Navbar() {
  const [active, setActive] = useState('hero')
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
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

  return (
    <nav className={scrolled ? 'site-nav is-scrolled' : 'site-nav'} role="navigation" aria-label="Primary">
      <div className="site-nav-inner">
        <a href="#hero" className="wordmark" aria-label={`${profile.name}, home`}>
          PT
        </a>
        <div className="desktop-nav">
          {navItems.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className={active === id ? 'nav-link is-active' : 'nav-link'}
              aria-current={active === id ? 'true' : undefined}
            >
              {label}
            </a>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="mobile-btn"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>
      {open && (
        <div id="mobile-nav" className="mobile-nav" role="menu">
          {navItems.map(({ id, label }) => (
            <a key={id} href={`#${id}`} onClick={() => setOpen(false)} className="nav-link" role="menuitem">
              {label}
            </a>
          ))}
        </div>
      )}
    </nav>
  )
}
