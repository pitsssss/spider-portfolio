export type Project = {
  slug: string
  title: string
  shortTitle?: string
  category: string
  summary: string
  description: string
  role: string
  featured: boolean
  nda: boolean
  status?: string
  stack: string[]
  highlights: string[]
  image?: string
  liveUrl?: string
  repositoryUrl?: string
  caseStudyAvailable: boolean
}

export type SkillGroup = {
  title: string
  items: string[]
}

export type Experience = {
  title: string
  organization: string
  period: string
  employmentType?: string
  locationType?: string
  summary: string
}

export type SocialLink = {
  label: string
  href: string
  external?: boolean
}

export type NavItem = {
  id: string
  label: string
}
