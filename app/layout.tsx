import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: 'NeuroTrack - Epilepsy Symptom Tracker',
  description: 'Track seizures, symptoms, and lifestyle factors to identify patterns and manage epilepsy proactively.',
  generator: 'v0.app',
  authors: [{ name: 'NeuroTrack' }],
  openGraph: {
    title: 'NeuroTrack - Epilepsy Symptom Tracker',
    description: 'Track seizures, symptoms, and lifestyle factors to identify patterns and manage epilepsy proactively.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'NeuroTrack - Epilepsy Symptom Tracker',
    description: 'Track seizures, symptoms, and lifestyle factors to identify patterns and manage epilepsy proactively.',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#14B8A6',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
        <Toaster />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
