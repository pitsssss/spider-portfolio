import type { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  themeColor: '#0A0A0F',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL('https://peterparker.dev'),
  title: {
    default: 'Peter Toss | Software Engineer & AI Engineer',
    template: '%s | Peter Toss',
  },
  description: 'Full-stack software engineer & AI engineer specializing in LLMs, computer vision, and building scalable systems.',
  keywords: ['software engineer', 'AI engineer', 'full-stack developer', 'machine learning', 'LLMs', 'computer vision', 'React', 'Next.js', 'Three.js', 'Python'],
  authors: [{ name: 'Peter Toss' }],
  openGraph: {
    type: 'website', locale: 'en_US', url: 'https://peterparker.dev',
    siteName: 'Peter Toss Portfolio',
    title: 'Peter Toss | Software Engineer & AI Engineer',
    description: 'Full-stack software engineer & AI engineer specializing in LLMs, computer vision, and scalable systems.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Peter Toss' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Peter Toss | Software Engineer & AI Engineer',
    description: 'Full-stack software engineer & AI engineer.',
    images: ['/og-image.png'],
    creator: '@peterparker',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://peterparker.dev' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  )
}
