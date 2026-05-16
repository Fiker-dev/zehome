import type { Metadata } from 'next'
import { DM_Sans, Playfair_Display } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Ze Home Finds | Mood Lighting | Free Delivery SA',
    template: '%s',
  },
  description:
    "SA's mood lighting store. Projection lamps, sunset lamps, moon lamps, neon strips and more. Set the mood in any room. Free delivery across South Africa in 3-7 business days.",
  keywords: [
    'mood lighting south africa',
    'atmosphere lamp SA',
    'projection lamp south africa',
    'aesthetic room lighting johannesburg',
    'neon strip lights SA',
    'moon lamp south africa',
    'sunset lamp SA',
    'ambient lighting south africa',
  ],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_STORE_URL ?? 'https://zehomefinds.co.za'
  ),
  verification: {
    google: 'so4EC5gmUDYwm_Yu6_Ib5sbtrpYAHSkOZUAfKP9Llss',
  },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Ze Home Finds',
              url: 'https://zehomefinds.co.za',
              logo: 'https://zehomefinds.co.za/images/logo.png',
              description: 'SA mood and atmosphere lighting store',
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+27710278563',
                contactType: 'customer service',
                availableLanguage: 'English',
              },
              sameAs: ['https://www.tiktok.com/@zehomefinds'],
            }),
          }}
        />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  )
}
