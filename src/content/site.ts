import type { NavItem } from './types'

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  'https://spider-portfolio-29u1.vercel.app'

export const site = {
  url: SITE_URL,
  name: 'Peter Toss',
  title: 'Full-Stack Software Engineer',
  description:
    'Full-Stack Software Engineer working across software architecture, product engineering, and applied AI.',
  locale: 'en_US',
}

export const navItems: NavItem[] = [
  { id: 'hero', label: 'Home' },
  { id: 'projects', label: 'Work' },
  { id: 'skills', label: 'Expertise' },
  { id: 'experience', label: 'Experience' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
]
