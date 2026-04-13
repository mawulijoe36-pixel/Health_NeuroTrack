import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import { PWARegister } from '@/components/pwa-register'
import './globals.css'

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: 'NeuroTrack - Epilepsy Symptom Tracker',
  description: 'Track seizures, symptoms, and lifestyle factors to identify patterns and manage epilepsy proactively.',
  generator: 'v0.app',
  manifest: '/manifest.json',
  authors: [{ name: 'NeuroTrack' }],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'NeuroTrack',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: 'NeuroTrack - Epilepsy Symptom Tracker',
    description: 'Track seizures, symptoms, and lifestyle factors to identify patterns and manage epilepsy proactively.',
    type: 'website',
    siteName: 'NeuroTrack',
  },
  twitter: {
    card: 'summary',
    title: 'NeuroTrack - Epilepsy Symptom Tracker',
    description: 'Track seizures, symptoms, and lifestyle factors to identify patterns and manage epilepsy proactively.',
  },
  icons: {
    icon: [
      { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
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
        <PWARegister />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
