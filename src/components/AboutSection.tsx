import { profile } from '@/content/profile'

export default function AboutSection() {
  return (
    <section id="about" className="section section-alt" aria-labelledby="about-h">
      <div className="container-main">
        <div className="section-header reveal">
          <p className="section-label">Profile</p>
          <h2 id="about-h" className="section-title">ABOUT</h2>
          <div className="section-divider"><div className="section-dot" /></div>
        </div>
        <div className="about-copy reveal">
          {profile.about.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  )
}
