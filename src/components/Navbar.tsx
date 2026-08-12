'use client'
import { useState, useEffect } from 'react'
import { navItems } from '@/content/site'
import { profile } from '@/content/profile'

export default function Navbar() {
  const [active, setActive] = useState('hero')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id) }),
      { threshold: 0.3 },
    )
    navItems.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [])

  return (
    <nav className="site-nav" role="navigation" aria-label="Primary">
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
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
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
