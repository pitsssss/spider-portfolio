'use client'
import { useState, useEffect } from 'react'

const ITEMS = [
  { id: 'hero', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
]

export default function Navbar() {
  const [active, setActive] = useState('hero')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id) }),
      { threshold: 0.3 }
    )
    ITEMS.forEach(({ id }) => { const el = document.getElementById(id); if (el) obs.observe(el) })
    return () => obs.disconnect()
  }, [])

  return (
    <nav style={{ position:'fixed',top:0,left:0,right:0,zIndex:100,backdropFilter:'blur(24px)',WebkitBackdropFilter:'blur(24px)',background:'rgba(10,10,15,0.8)',borderBottom:'1px solid rgba(177,19,16,0.12)' }} role="navigation" aria-label="Main">
      <div style={{ maxWidth:1280,margin:'0 auto',padding:'14px 32px',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
        <a href="#hero" style={{ display:'flex',alignItems:'center',gap:10,textDecoration:'none',color:'#fff',fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.5rem',letterSpacing:3 }} aria-label="Home">
          <span style={{ fontSize:'1.8rem',filter:'drop-shadow(0 0 8px rgba(177,19,16,0.5))' }}>🕷️</span>PETER TOSS
        </a>
        <div style={{ display:'flex',gap:2 }} className="desktop-nav">
          {ITEMS.map(({ id, label }) => (
            <a key={id} href={`#${id}`} style={{
              padding:'8px 18px',borderRadius:10,textDecoration:'none',fontSize:'0.85rem',fontWeight:500,
              color: active === id ? '#fff' : '#808080',
              background: active === id ? 'rgba(177,19,16,0.12)' : 'transparent',
              position:'relative',transition:'all 0.3s',
            }}>
              {label}
              {active === id && <span style={{ position:'absolute',bottom:4,left:'50%',transform:'translateX(-50%)',width:16,height:2,background:'#B11310',borderRadius:2 }} />}
            </a>
          ))}
        </div>
        <button onClick={() => setOpen(!open)} style={{ display:'none',background:'none',border:'none',color:'#fff',cursor:'pointer',padding:8,borderRadius:8 }} className="mobile-btn" aria-label="Menu" aria-expanded={open}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
      </div>
      {open && (
        <div style={{ padding:'8px 32px 20px',display:'flex',flexDirection:'column',gap:2 }} role="menu">
          {ITEMS.map(({ id, label }) => (
            <a key={id} href={`#${id}`} onClick={() => setOpen(false)} style={{ padding:'14px 20px',textDecoration:'none',color:'#808080',borderRadius:10,fontWeight:500 }} role="menuitem">{label}</a>
          ))}
        </div>
      )}
      <style jsx>{`@media(max-width:768px){.desktop-nav{display:none!important}.mobile-btn{display:block!important}}`}</style>
    </nav>
  )
}
