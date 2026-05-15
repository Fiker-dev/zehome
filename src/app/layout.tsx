import type { Metadata } from 'next'
import { DM_Sans, Playfair_Display } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm-sans',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
})

export const metadata: Metadata = {
  title: {
    default: 'Ze Home Finds | Mood Lighting | Free Delivery SA',
    template: '%s',
  },
  description:
    'Premium mood lighting delivered to your door. Projection lamps, moon lights, neon strips and more. Free delivery across South Africa in 3-5 days.',
  keywords: [
    'mood lighting south africa',
    'projection lamp SA',
    'aesthetic room lighting johannesburg',
    'sunset lamp south africa',
    'free delivery homeware SA',
  ],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_STORE_URL ?? 'https://zehomefinds.co.za'
  ),
  openGraph: {
    siteName: 'Ze Home Finds',
    locale: 'en_ZA',
    type: 'website',
    images: [{ url: '/images/og-lamp.jpg', width: 1200, height: 630, alt: 'Ze Home Finds — Mood Lighting SA' }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-ZA" className={`${dmSans.variable} ${playfair.variable}`}>
      <body className="bg-background text-charcoal font-body min-h-screen flex flex-col text-[15px] leading-[1.6]">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
