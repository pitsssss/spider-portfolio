'use client'
import dynamic from 'next/dynamic'

const SpiderScene = dynamic(() => import('./SpiderScene'), {
  ssr: false,
  loading: () => <div style={{ position:'absolute',inset:0,background:'#0A0A0F',display:'flex',alignItems:'center',justifyContent:'center' }}><div style={{ color:'#B11310',fontSize:'3rem' }}>🕷️</div></div>
})

export default function HeroSection() {
  return (
    <section id="hero" style={{ position:'relative',minHeight:'100vh',display:'flex',alignItems:'center',overflow:'hidden' }} aria-label="Hero">
      <SpiderScene />
      <div style={{ position:'relative',zIndex:10,maxWidth:1280,margin:'0 auto',padding:'140px 32px 100px',width:'100%' }}>
        <div style={{ display:'inline-flex',alignItems:'center',gap:10,color:'#B11310',fontWeight:600,textTransform:'uppercase',letterSpacing:4,fontSize:'0.8rem',marginBottom:20,padding:'6px 16px',border:'1px solid rgba(177,19,16,0.25)',borderRadius:100,background:'rgba(177,19,16,0.06)',animation:'fadeUp 0.7s ease-out both' }}>
          <span style={{ width:6,height:6,background:'#E23636',borderRadius:'50%',animation:'pulse 2s ease-in-out infinite' }} />
          Software Engineer & AI Engineer
        </div>
        <h1 style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'clamp(4.5rem,11vw,9rem)',color:'#fff',lineHeight:0.88,marginBottom:28,letterSpacing:-1,animation:'fadeUp 0.7s 0.15s ease-out both' }}>
          PETER<br/><span style={{ color:'#B11310',textShadow:'0 0 60px rgba(177,19,16,0.6),0 0 120px rgba(177,19,16,0.25)' }}>TOSS</span>
        </h1>
        <p style={{ color:'#808080',fontSize:'clamp(1rem,2vw,1.25rem)',maxWidth:520,lineHeight:1.7,marginBottom:36,animation:'fadeUp 0.7s 0.3s ease-out both' }}>
          Building intelligent systems and beautiful software. With great power comes great responsibility — and great code.
        </p>
        <div style={{ display:'flex',flexWrap:'wrap',gap:14,animation:'fadeUp 0.7s 0.45s ease-out both' }}>
          <a href="#projects" style={{ padding:'15px 34px',background:'linear-gradient(135deg,#B11310,#8B0F0D)',color:'#fff',fontWeight:700,borderRadius:14,textDecoration:'none',fontSize:'0.95rem',boxShadow:'0 4px 24px rgba(177,19,16,0.3)' }}>View My Work</a>
          <a href="#contact" style={{ padding:'15px 34px',border:'1.5px solid rgba(177,19,16,0.3)',color:'#fff',fontWeight:600,borderRadius:14,textDecoration:'none',fontSize:'0.95rem',backdropFilter:'blur(12px)',background:'rgba(177,19,16,0.04)' }}>Get In Touch</a>
        </div>
      </div>
    </section>
  )
}
