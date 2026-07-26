'use client'

export default function AboutSection() {
  return (
    <section id="about" className="section" aria-labelledby="about-h">
      <div className="container-main">
        <div className="section-header reveal"><p className="section-label">Who I Am</p><h2 id="about-h" className="section-title">ABOUT <span>ME</span></h2><div className="spider-divider"><div className="spider-dot" /></div></div>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:56,alignItems:'center' }} className="about-grid">
          <div className="reveal">
            <p style={{ color:'#E0E0E0',lineHeight:1.75,marginBottom:20,fontSize:'1.15rem',fontWeight:500 }}>
              Software engineering is more than writing code—it&apos;s about designing systems that remain reliable, maintainable, and valuable long after they&apos;re deployed.
            </p>
            <p style={{ color:'#808080',lineHeight:1.75,marginBottom:16 }}>
              My work combines <strong style={{ color:'#B11310' }}>Full Stack Engineering</strong>, <strong style={{ color:'#B11310' }}>AI Engineering</strong>, and <strong style={{ color:'#B11310' }}>Workflow Automation</strong> to build production-ready software for organizations that need scalable and dependable solutions. I enjoy turning complex business requirements into clean architectures, intuitive user experiences, and backend systems that are built to evolve.
            </p>
            <p style={{ color:'#808080',lineHeight:1.75,marginBottom:16 }}>
              Alongside full-stack development, I specialize in building <strong style={{ color:'#B11310' }}>AI Agents</strong>, <strong style={{ color:'#B11310' }}>RAG systems</strong>, <strong style={{ color:'#B11310' }}>LLM-powered applications</strong>, and intelligent automation workflows that integrate naturally into real products rather than existing as isolated prototypes.
            </p>
            <p style={{ color:'#808080',lineHeight:1.75,marginBottom:16 }}>
              My experience includes enterprise platforms, government digital transformation projects, AI-powered web applications, and technical training in AI Engineering and Automation. Across every project, I focus on clean architecture, API-first development, performance, security, and engineering practices that support long-term scalability.
            </p>
            <p style={{ color:'#808080',lineHeight:1.75,marginBottom:28,fontStyle:'italic' }}>
              I believe great software isn&apos;t measured by the technologies it uses, but by how effectively it solves real problems, adapts to change, and creates lasting value.
            </p>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14,marginTop:28 }}>
              {[{v:'+3',l:'Years Experience'},{v:'+21',l:'Projects'},{v:'1',l:'Paper Published'}].map(s=>(
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
