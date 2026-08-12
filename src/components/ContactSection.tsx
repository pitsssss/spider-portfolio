import { profile } from '@/content/profile'
import { social, socialLinks } from '@/content/social'

const linkProps = { target: '_blank', rel: 'noopener noreferrer' } as const

export default function ContactSection() {
  return (
    <section id="contact" className="section" aria-labelledby="contact-h">
      <div className="container-main">
        <div className="contact-panel glass reveal">
          <div className="section-header">
            <p className="section-label">Contact</p>
            <h2 id="contact-h" className="section-title">GET IN <span>TOUCH</span></h2>
            <div className="section-divider"><div className="section-dot" /></div>
          </div>
          <p className="contact-lead">{profile.contactLead}</p>
          <p className="contact-support">{profile.contactSupport}</p>
          <a href={social.email.href} className="btn-primary contact-email">
            Email {profile.email}
          </a>
          <div className="social-row">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="social-link"
                {...(link.external ? linkProps : {})}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
