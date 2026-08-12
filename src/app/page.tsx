import Navbar from '@/components/Navbar'
import StoryExperience from '@/components/story/StoryExperience'
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
      <Navbar />
      <main id="main-content">
        <StoryExperience />
      </main>
    </>
  )
}
