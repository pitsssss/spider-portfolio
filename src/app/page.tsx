import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import ProjectsSection from '@/components/ProjectsSection'
import SkillsSection from '@/components/SkillsSection'
import ExperienceSection from '@/components/ExperienceSection'
import AboutSection from '@/components/AboutSection'
import ContactSection from '@/components/ContactSection'
import Footer from '@/components/Footer'
import RevealOnScroll from '@/components/RevealOnScroll'
import { SITE_URL } from '@/content/site'
import { profile } from '@/content/profile'
import { socialLinks } from '@/content/social'
import { skillGroups } from '@/content/skills'

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: profile.name,
  givenName: profile.givenName,
  familyName: profile.familyName,
  url: SITE_URL,
  jobTitle: profile.title,
  email: profile.email,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Damascus',
    addressCountry: 'SY',
  },
  knowsAbout: skillGroups.map((group) => group.title),
  sameAs: socialLinks.map((link) => link.href),
}

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <RevealOnScroll />
      <Navbar />
      <main id="main-content">
        <HeroSection />
        <ProjectsSection />
        <SkillsSection />
        <ExperienceSection />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  )
}
