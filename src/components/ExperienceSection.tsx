import { experience } from '@/content/experience'

export default function ExperienceSection() {
  return (
    <section id="experience" className="section" aria-labelledby="experience-h">
      <div className="container-main">
        <div className="section-header reveal">
          <p className="section-label">Career</p>
          <h2 id="experience-h" className="section-title">EXPERIENCE</h2>
          <div className="section-divider"><div className="section-dot" /></div>
        </div>
        <ol className="experience-list">
          {experience.map((item) => (
            <li key={`${item.organization}-${item.title}`} className="glass reveal experience-card">
              <div className="experience-meta">
                <h3>{item.title}</h3>
                <p className="experience-org">{item.organization}</p>
                <p className="experience-period">
                  {item.period}
                  {item.employmentType && ` • ${item.employmentType}`}
                  {item.locationType && ` • ${item.locationType}`}
                </p>
              </div>
              <p className="experience-summary">{item.summary}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
