'use client'
import dynamic from 'next/dynamic'
import { profile } from '@/content/profile'

const SpiderScene = dynamic(() => import('./SpiderScene'), {
  ssr: false,
  loading: () => <div className="hero-fallback" aria-hidden="true" />,
})

export default function HeroSection() {
  return (
    <section id="hero" className="hero-section" aria-labelledby="hero-heading">
      <SpiderScene />
      <div className="hero-copy">
        <p className="hero-kicker">{profile.positioning}</p>
        <p className="hero-title-label">{profile.name}</p>
        <h1 id="hero-heading" className="hero-heading">
          {profile.heroMessage}
        </h1>
        <p className="hero-support">{profile.heroSupporting}</p>
        <div className="hero-actions">
          <a href={profile.primaryCta.href} className="btn-primary">{profile.primaryCta.label}</a>
          <a href={profile.secondaryCta.href} className="btn-secondary">{profile.secondaryCta.label}</a>
        </div>
      </div>
    </section>
  )
}
