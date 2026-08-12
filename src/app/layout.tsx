import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { SITE_URL, site } from '@/content/site'
import { profile } from '@/content/profile'
import './globals.css'

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const viewport: Viewport = {
  themeColor: '#07090e',
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
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className={geistSans.className}>
        <a href="#main-content" className="skip-link">Skip to content</a>
        {children}
      </body>
    </html>
  )
}
