import { profile } from './profile'
import type { SocialLink } from './types'

export const social = {
  email: {
    label: 'Email',
    href: `mailto:${profile.email}`,
    external: false,
  } satisfies SocialLink,
  github: {
    label: 'GitHub',
    href: 'https://github.com/pitsssss',
    external: true,
  } satisfies SocialLink,
  linkedin: {
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/peter-toss',
    external: true,
  } satisfies SocialLink,
}

export const socialLinks: SocialLink[] = [social.github, social.linkedin]
