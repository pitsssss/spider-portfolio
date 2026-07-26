'use client'

export default function ContactSection() {
  return (
    <section id="contact" className="section" style={{ background:'rgba(18,18,26,0.25)' }} aria-labelledby="contact-h">
      <div className="container-main"><div style={{ maxWidth:640,margin:'0 auto',textAlign:'center' }}>
        <div className="section-header reveal"><p className="section-label">Let&apos;s Talk</p><h2 id="contact-h" className="section-title">GET IN <span>TOUCH</span></h2><div className="spider-divider"><div className="spider-dot" /></div></div>
        <p className="reveal" style={{ color:'#808080',fontSize:'1.1rem',lineHeight:1.7,marginBottom:44 }}>Got a project that needs a hero? I&apos;m always up for a challenge.</p>
        <div className="glass reveal" style={{ padding:44,textAlign:'left' }}>
          <form onSubmit={e => { e.preventDefault(); alert('Thanks! 🕸️') }}>
            <div style={{ marginBottom:22 }}><label htmlFor="name" style={{ display:'block',fontSize:'0.8rem',fontWeight:600,color:'#E0E0E0',marginBottom:8,textTransform:'uppercase',letterSpacing:1 }}>Name</label><input id="name" type="text" placeholder="Peter Toss" autoComplete="name" style={{ width:'100%',padding:'15px 18px',background:'rgba(255,255,255,0.03)',border:'1.5px solid rgba(255,255,255,0.08)',borderRadius:14,color:'#fff',fontFamily:'inherit',fontSize:'0.95rem',outline:'none' }} /></div>
            <div style={{ marginBottom:22 }}><label htmlFor="email" style={{ display:'block',fontSize:'0.8rem',fontWeight:600,color:'#E0E0E0',marginBottom:8,textTransform:'uppercase',letterSpacing:1 }}>Email</label><input id="email" type="email" placeholder="peter@dailybugle.com" autoComplete="email" style={{ width:'100%',padding:'15px 18px',background:'rgba(255,255,255,0.03)',border:'1.5px solid rgba(255,255,255,0.08)',borderRadius:14,color:'#fff',fontFamily:'inherit',fontSize:'0.95rem',outline:'none' }} /></div>
            <div style={{ marginBottom:22 }}><label htmlFor="message" style={{ display:'block',fontSize:'0.8rem',fontWeight:600,color:'#E0E0E0',marginBottom:8,textTransform:'uppercase',letterSpacing:1 }}>Message</label><textarea id="message" placeholder="I need a hero..." style={{ width:'100%',padding:'15px 18px',background:'rgba(255,255,255,0.03)',border:'1.5px solid rgba(255,255,255,0.08)',borderRadius:14,color:'#fff',fontFamily:'inherit',fontSize:'0.95rem',outline:'none',resize:'none',minHeight:120 }} /></div>
            <button type="submit" style={{ width:'100%',padding:16,background:'linear-gradient(135deg,#B11310,#8B0F0D)',color:'#fff',fontWeight:700,border:'none',borderRadius:14,fontSize:'0.95rem',cursor:'pointer',boxShadow:'0 4px 20px rgba(177,19,16,0.25)' }}>Send Message 🕸️</button>
          </form>
        </div>
        <div className="reveal" style={{ display:'flex',justifyContent:'center',gap:18,marginTop:44 }}>
          {['GH','LI','TW','@'].map(p => <a key={p} href="#" className="glass" aria-label={p} style={{ width:50,height:50,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',color:'#808080',textDecoration:'none',fontWeight:700 }}>{p}</a>)}
        </div>
      </div></div>
    </section>
  )
}
