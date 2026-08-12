import type { Metadata, Viewport } from 'next'
import { SITE_URL, site } from '@/content/site'
import { profile } from '@/content/profile'
import './globals.css'

export const viewport: Viewport = {
  themeColor: '#0A0A0F',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${profile.name} | ${profile.title}`,
    template: `%s | ${profile.name}`,
  },
  description: site.description,
  keywords: [
    'full-stack software engineer',
    'software architecture',
    'product engineering',
    'applied AI',
    'Next.js',
    'React',
    'Laravel',
    'TypeScript',
  ],
  authors: [{ name: profile.name }],
  openGraph: {
    type: 'website',
    locale: site.locale,
    url: SITE_URL,
    siteName: `${profile.name} Portfolio`,
    title: `${profile.name} | ${profile.title}`,
    description: site.description,
  },
  twitter: {
    card: 'summary',
    title: `${profile.name} | ${profile.title}`,
    description: site.description,
  },
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <a href="#main-content" className="skip-link">Skip to content</a>
        {children}
      </body>
    </html>
  )
}
