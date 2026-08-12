import type { Metadata, Viewport } from 'next'
import { Instrument_Sans, Instrument_Serif } from 'next/font/google'
import { SITE_URL, site } from '@/content/site'
import { profile } from '@/content/profile'
import './globals.css'

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-serif',
})

export const viewport: Viewport = {
  themeColor: '#EEE9DF',
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
    <html lang="en" className={`${instrumentSans.variable} ${instrumentSerif.variable}`}>
      <body className={instrumentSans.className}>
        <a href="#main-content" className="skip-link">Skip to content</a>
        {children}
      </body>
    </html>
  )
}
