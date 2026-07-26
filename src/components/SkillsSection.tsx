'use client'
import { useState } from 'react'

const S = [
  {
    icon:'🧠',
    title:'AI Engineering',
    desc:'Designing and integrating AI solutions that move beyond experimentation into production. My work includes building AI Agents, Retrieval-Augmented Generation (RAG) systems, LLM-powered applications, intelligent document processing, prompt engineering, AI workflow orchestration, and business automation. I focus on creating AI systems that integrate seamlessly with existing software architectures while maintaining reliability, security, and scalability.',
    tags:['AI Agents','RAG Systems','LLM Integration','Prompt Engineering','AI Workflows','n8n Automation','Knowledge Retrieval','AI APIs','Document Intelligence','Business Process Automation'],
    color:'177,19,16'
  },
  {
    icon:'⚡',
    title:'Backend Engineering',
    desc:'Building scalable backend systems that serve as the foundation of reliable digital products. I design RESTful APIs, authentication systems, business logic, database architectures, background processing, caching strategies, and secure integrations for enterprise and government platforms. My approach emphasizes clean architecture, maintainability, performance, and long-term scalability.',
    tags:['Laravel','NestJS','PHP','Node.js','REST APIs','MySQL','PostgreSQL','Redis','Authentication','Queue Systems','Caching','System Architecture','API Design'],
    color:'226,54,54'
  },
  {
    icon:'🎨',
    title:'Frontend Engineering',
    desc:'Developing modern user interfaces that balance usability, accessibility, and performance. I build responsive web applications using modern frontend frameworks while ensuring clean component architecture, efficient state management, and smooth user experiences across desktop and mobile devices.',
    tags:['Next.js','React','TypeScript','JavaScript','Tailwind CSS','Responsive Design','UI Architecture','State Management','Accessibility','Performance Optimization','Technical SEO'],
    color:'177,19,16'
  },
  {
    icon:'☁️',
    title:'Cloud & DevOps',
    desc:'Creating development environments and deployment workflows that improve software reliability and team productivity. My experience includes containerized development, version control workflows, CI/CD fundamentals, deployment automation, environment management, and production-ready application delivery.',
    tags:['Docker','Git','GitHub','CI/CD','Linux','Environment Management','Deployment','Containerization','Production Hosting','Developer Workflows'],
    color:'226,54,54'
  },
  {
    icon:'🎓',
    title:'Technical Training',
    desc:'Helping developers and teams adopt modern software engineering and AI technologies through structured technical training. I design practical learning experiences focused on Full Stack Development, AI Engineering, workflow automation, software architecture, and engineering best practices, with an emphasis on real-world implementation rather than theoretical concepts.',
    tags:['AI Engineering','Workflow Automation','Full Stack Development','Software Architecture','Backend Development','Modern Web Technologies','Developer Best Practices','Technical Mentoring'],
    color:'177,19,16'
  },
]

function SkillCard({ skill, index }: { skill: typeof S[0], index: number }) {
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0, scale: 1 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = (y - centerY) / 10
    const rotateY = (centerX - x) / 10

    setTransform({ rotateX, rotateY, scale: 1.02 })
  }

  const handleMouseLeave = () => {
    setTransform({ rotateX: 0, rotateY: 0, scale: 1 })
  }

  return (
    <div
      className="glass reveal skill-card-3d"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        padding: 32,
        position: 'relative',
        overflow: 'hidden',
        transform: `perspective(1000px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg) scale(${transform.scale})`,
        transition: 'transform 0.1s ease-out, box-shadow 0.3s ease',
        transformStyle: 'preserve-3d',
        boxShadow: transform.scale > 1 
          ? `0 20px 60px rgba(${skill.color},0.4), 0 0 0 1px rgba(${skill.color},0.2)` 
          : undefined,
      }}
    >
      {/* Animated gradient overlay */}
      <div 
        className="card-gradient-overlay"
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at ${transform.rotateY * 5 + 50}% ${-transform.rotateX * 5 + 50}%, rgba(${skill.color},0.15), transparent 60%)`,
          opacity: transform.scale > 1 ? 1 : 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none',
        }}
      />
      
      {/* Glowing border effect */}
      <div 
        style={{
          position: 'absolute',
          inset: -1,
          background: `linear-gradient(135deg, rgba(${skill.color},${transform.scale > 1 ? 0.5 : 0}), transparent 50%, rgba(${skill.color},${transform.scale > 1 ? 0.3 : 0}))`,
          borderRadius: 'inherit',
          opacity: transform.scale > 1 ? 1 : 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      />

      <span 
        style={{ 
          fontSize: '2.4rem', 
          marginBottom: 18, 
          display: 'block',
          transform: `translateZ(${transform.scale > 1 ? '40px' : '0px'}) scale(${transform.scale > 1 ? 1.15 : 1})`,
          transition: 'transform 0.3s ease',
          filter: transform.scale > 1 ? `drop-shadow(0 0 20px rgba(${skill.color},0.6))` : 'none',
        }}
      >
        {skill.icon}
      </span>
      
      <h3 
        style={{ 
          fontFamily: "'Bebas Neue',sans-serif", 
          fontSize: '1.6rem', 
          color: '#fff', 
          marginBottom: 12,
          transform: `translateZ(${transform.scale > 1 ? '30px' : '0px'})`,
          transition: 'transform 0.3s ease, color 0.3s ease',
          color: transform.scale > 1 ? `rgb(${skill.color})` : '#fff',
        }}
      >
        {skill.title}
      </h3>
      
      <p 
        style={{ 
          color: '#808080', 
          fontSize: '0.9rem', 
          lineHeight: 1.6, 
          marginBottom: 18,
          transform: `translateZ(${transform.scale > 1 ? '20px' : '0px'})`,
          transition: 'transform 0.3s ease',
        }}
      >
        {skill.desc}
      </p>
      
      <div 
        style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 8,
          transform: `translateZ(${transform.scale > 1 ? '15px' : '0px'})`,
          transition: 'transform 0.3s ease',
        }}
      >
        {skill.tags.map(t => (
          <span 
            key={t} 
            style={{ 
              padding: '7px 15px', 
              background: transform.scale > 1 ? `rgba(${skill.color},0.1)` : 'rgba(255,255,255,0.03)', 
              border: `1px solid ${transform.scale > 1 ? `rgba(${skill.color},0.3)` : 'rgba(255,255,255,0.08)'}`, 
              borderRadius: 10, 
              fontSize: '0.78rem', 
              color: transform.scale > 1 ? `rgba(${skill.color.split(',').map(n => Math.min(255, parseInt(n) + 80)).join(',')})` : '#808080',
              transition: 'all 0.2s ease',
            }}
          >
            {t}
          </span>
        ))}
      </div>

      {/* Shine effect */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)`,
          transform: `translateX(${transform.rotateY * 2}%) translateY(${-transform.rotateX * 2}%)`,
          opacity: transform.scale > 1 ? 0.5 : 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}

export default function SkillsSection() {
  return (
    <section id="skills" className="section" style={{ background:'rgba(18,18,26,0.25)' }} aria-labelledby="skills-h">
      <div className="container-main">
        <div className="section-header reveal">
          <p className="section-label">What I Do</p>
          <h2 id="skills-h" className="section-title">ENGINEERING <span>EXPERTISE</span></h2>
          <p style={{ color:'#808080',fontSize:'1.05rem',maxWidth:720,margin:'20px auto 0',lineHeight:1.7 }}>
            From production software to AI-powered systems, I focus on building technology that is scalable, maintainable, and designed for real-world use.
          </p>
          <div className="spider-divider"><div className="spider-dot" /></div>
        </div>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(340px,1fr))',gap:22 }}>
          {S.map((skill, index) => (
            <SkillCard key={skill.title} skill={skill} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
