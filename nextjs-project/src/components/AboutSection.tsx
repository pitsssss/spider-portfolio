'use client'

export default function AboutSection() {
  return (
    <section id="about" className="section" aria-labelledby="about-h">
      <div className="container-main">
        <div className="section-header reveal"><p className="section-label">Who I Am</p><h2 id="about-h" className="section-title">ABOUT <span>ME</span></h2><div className="spider-divider"><div className="spider-dot" /></div></div>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:56,alignItems:'center' }} className="about-grid">
          <div className="reveal">
            <p style={{ color:'#E0E0E0',lineHeight:1.75,marginBottom:20,fontSize:'1.15rem',fontWeight:500 }}>I&apos;m a full-stack software engineer and AI engineer passionate about building products that make a difference.</p>
            <p style={{ color:'#808080',lineHeight:1.75,marginBottom:16 }}>With expertise spanning from deep learning to production-grade web apps, I bridge AI research and real-world engineering.</p>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginTop:28 }}>
              {[{v:'5+',l:'Years Experience'},{v:'30+',l:'Projects Shipped'},{v:'3',l:'Papers Published'},{v:'∞',l:'Coffee Consumed'}].map(s=>(
                <div key={s.l} className="glass" style={{ textAlign:'center',padding:'24px 16px' }}>
                  <div style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'2.4rem',color:'#B11310' }}>{s.v}</div>
                  <div style={{ color:'#808080',fontSize:'0.8rem',marginTop:6,textTransform:'uppercase',letterSpacing:1 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="glass reveal" style={{ position:'relative',aspectRatio:'1',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden' }}>
            <div style={{ position:'absolute',inset:0,background:'linear-gradient(160deg,rgba(177,19,16,0.08),transparent 40%,rgba(27,20,100,0.12) 80%)' }} />
            <div style={{ position:'relative',zIndex:1,textAlign:'center',padding:40 }}>
              <div style={{ fontSize:'5rem',animation:'float 5s ease-in-out infinite',marginBottom:20,filter:'drop-shadow(0 0 30px rgba(177,19,16,0.3))' }}>🕷️</div>
              <blockquote style={{ color:'#808080',fontStyle:'italic',lineHeight:1.7 }}>&ldquo;With great power comes great responsibility.&rdquo;</blockquote>
              <p style={{ color:'#B11310',fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.1rem',marginTop:18 }}>— Uncle Ben</p>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`@media(max-width:768px){.about-grid{grid-template-columns:1fr!important}}`}</style>
    </section>
  )
}
