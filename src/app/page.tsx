import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import AboutSection from '@/components/AboutSection'
import SkillsSection from '@/components/SkillsSection'
import ProjectsSection from '@/components/ProjectsSection'
import ContactSection from '@/components/ContactSection'
import Footer from '@/components/Footer'
import RevealOnScroll from '@/components/RevealOnScroll'

export const metadata: Metadata = {
  title: 'Peter Toss | Software Engineer & AI Engineer',
  description: 'Full-stack software engineer & AI engineer specializing in LLMs, computer vision, and building scalable systems.',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Peter Toss',
  givenName: 'Peter',
  familyName: 'Toss',
  url: 'https://peterparker.dev',
  jobTitle: 'Software Engineer & AI Engineer',
  knowsAbout: ['Artificial Intelligence', 'Machine Learning', 'LLMs', ' ', 'Full-Stack Development', 'Cloud Architecture'],
  sameAs: ['https://github.com/peterparker', 'https://linkedin.com/in/peterparker', 'https://twitter.com/peterparker'],
}

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <RevealOnScroll />
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <SkillsSection />
        <ProjectsSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  )
}
