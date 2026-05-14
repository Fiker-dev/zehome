import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
})

export const metadata: Metadata = {
  title: {
    default: 'Ze Home Finds | Premium Homeware | Free Delivery SA',
    template: '%s',
  },
  description:
    'Transform your space with Ze Home Finds. Shop the RGB Sunset Projection Lamp and more. Free delivery across South Africa in 3-5 days.',
  keywords: [
    'sunset projection lamp South Africa',
    'RGB sunset lamp SA',
    'bedroom atmosphere light',
    'aesthetic room light south africa',
    'homeware free delivery SA',
  ],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_STORE_URL ?? 'https://zehomefinds.co.za'
  ),
  openGraph: {
    siteName: 'Ze Home Finds',
    locale: 'en_ZA',
    type: 'website',
    images: [{ url: '/images/og-lamp.jpg', width: 1200, height: 630, alt: 'Ze Home Finds' }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-ZA" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-cream text-charcoal font-body min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
