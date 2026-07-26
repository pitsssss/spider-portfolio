'use client'

const P = [
  {tag:'AI/ML',title:'NeuroWeb AI Platform',desc:'End-to-end platform for deploying LLM-powered apps. FastAPI + React + K8s. 10M+ req/day.',tech:['Python','FastAPI','React','Kubernetes','PostgreSQL','Redis'],accent:'red'},
  {tag:'Computer Vision',title:'VisionQuest CV Pipeline',desc:'Real-time CV pipeline for industrial QC. Custom YOLO models, 99.7% accuracy.',tech:['PyTorch','ONNX','TensorRT','Go','gRPC','AWS'],accent:'blue'},
  {tag:'Full Stack',title:'SpiderSense Analytics',desc:'Real-time analytics with anomaly detection. 3D viz with Three.js + ML predictions.',tech:['Next.js','Three.js','D3.js','Python','MLflow','GCP'],accent:'red'},
  {tag:'LLM',title:'CodeWeaver AI Assistant',desc:'AI coding assistant for code review & refactoring. Fine-tuned LLMs + RAG.',tech:['LangChain','OpenAI','Pinecone','TypeScript','VSCode API','Docker'],accent:'blue'},
]
export default function ProjectsSection() {
  return (
    <section id="projects" className="section" aria-labelledby="projects-h">
      <div className="container-main">
        <div className="section-header reveal"><p className="section-label">What I&apos;ve Built</p><h2 id="projects-h" className="section-title">FEATURED <span>MISSIONS</span></h2><div className="spider-divider"><div className="spider-dot" /></div></div>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(480px,1fr))',gap:28 }} className="pg">
          {P.map(p => (
            <article key={p.title} className="glass glass-hover reveal" style={{ overflow:'hidden' }}>
              <div style={{ height:4,background: p.accent==='red' ? 'linear-gradient(90deg,#B11310,#ff6b6b,#B11310)' : 'linear-gradient(90deg,#2B3784,#6b8cff,#2B3784)',backgroundSize:'200% 100%',animation:'shimmer 3s ease-in-out infinite' }} />
              <div style={{ padding:36 }}>
                <span style={{ display:'inline-flex',alignItems:'center',gap:6,padding:'5px 14px',background:'rgba(177,19,16,0.15)',color:'#B11310',fontSize:'0.7rem',fontWeight:700,borderRadius:100,textTransform:'uppercase',letterSpacing:3,marginBottom:16,border:'1px solid rgba(177,19,16,0.2)' }}>{p.tag}</span>
                <h3 style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.8rem',color:'#fff',marginBottom:12 }}>{p.title}</h3>
                <p style={{ color:'#808080',lineHeight:1.7,marginBottom:22,fontSize:'0.95rem' }}>{p.desc}</p>
                <div style={{ display:'flex',flexWrap:'wrap',gap:8 }}>{p.tech.map(t => <span key={t} style={{ padding:'6px 14px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:8,fontSize:'0.75rem',color:'#808080' }}>{t}</span>)}</div>
              </div>
            </article>
          ))}
        </div>
      </div>
      <style jsx>{`@media(max-width:768px){.pg{grid-template-columns:1fr!important}}`}</style>
    </section>
  )
}
