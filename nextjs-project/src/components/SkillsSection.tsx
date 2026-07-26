const S = [
  {icon:'🧠',title:'AI & Machine Learning',tags:['LLMs (GPT, Claude)','PyTorch & TensorFlow','Computer Vision','NLP & Transformers','RAG Systems','Model Fine-tuning']},
  {icon:'⚡',title:'Backend Engineering',tags:['Python (FastAPI)','Node.js & TypeScript','Go & Rust','PostgreSQL','Redis & Queues','Microservices']},
  {icon:'🎨',title:'Frontend Development',tags:['React & Next.js','Three.js & WebGL','TypeScript','Tailwind CSS','State Management','Performance']},
  {icon:'☁️',title:'Cloud & DevOps',tags:['AWS & GCP','Docker & K8s','CI/CD','Terraform','Monitoring','Serverless']},
  {icon:'🕸️',title:'Data Engineering',tags:['Apache Spark','Kafka','Data Pipelines','Snowflake','dbt','Vector DBs']},
  {icon:'🔮',title:'Research & Innovation',tags:['Paper Implementation','Experimental Design','A/B Testing','System Architecture','Technical Writing','Open Source']},
]
export default function SkillsSection() {
  return (
    <section id="skills" className="section" style={{ background:'rgba(18,18,26,0.25)' }} aria-labelledby="skills-h">
      <div className="container-main">
        <div className="section-header reveal"><p className="section-label">What I Do</p><h2 id="skills-h" className="section-title">MY <span>POWERS</span></h2><div className="spider-divider"><div className="spider-dot" /></div></div>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(340px,1fr))',gap:22 }}>
          {S.map(c => (
            <div key={c.title} className="glass glass-hover reveal" style={{ padding:32,position:'relative',overflow:'hidden' }}>
              <span style={{ fontSize:'2.4rem',marginBottom:18,display:'block' }}>{c.icon}</span>
              <h3 style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.6rem',color:'#fff',marginBottom:18 }}>{c.title}</h3>
              <div style={{ display:'flex',flexWrap:'wrap',gap:8 }}>
                {c.tags.map(t => <span key={t} style={{ padding:'7px 15px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:10,fontSize:'0.78rem',color:'#808080' }}>{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
