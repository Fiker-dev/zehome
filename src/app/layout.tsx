import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import Navbar from '@/components/Navbar'
import AnnouncementBar from '@/components/AnnouncementBar'
import Footer from '@/components/Footer'
import ChatHelper from '@/components/ChatHelper'
import Analytics from '@/components/Analytics'
import { jsonLd, returnPolicy, shippingService } from '@/lib/schema'
import { CONTACT_EMAIL, ORG_ID, SITE_NAME, SITE_URL, WHATSAPP } from '@/lib/site'

// Fonts are bundled (src/fonts, SIL OFL) rather than fetched from Google
// Fonts at build time, so a Google Fonts hiccup can't fail a deployment.
const dmSans = localFont({
  src: '../fonts/dm-sans-latin-variable.woff2',
  weight: '100 1000',
  variable: '--font-dm-sans',
  display: 'swap',
})

const heading = localFont({
  src: '../fonts/inter-latin-variable.woff2',
  weight: '100 900',
  variable: '--font-heading',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Viral TikTok Products South Africa | Ze Home Finds',
    template: '%s',
  },
  description:
    'Shop the viral TikTok products everyone in South Africa is talking about: beauty gadgets, pet grooming, flame diffusers and more. Free delivery, 3-7 business days.',
  keywords: [
    'trending products south africa',
    'tiktok finds south africa',
    'viral products SA',
    'online store free delivery south africa',
    'home finds south africa',
    'gadgets and home finds SA',
  ],
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  formatDetection: { telephone: false },
  verification: {
    google: 'so4EC5gmUDYwm_Yu6_Ib5sbtrpYAHSkOZUAfKP9Llss',
  },
  openGraph: {
    siteName: 'Ze Home Finds',
    locale: 'en_ZA',
    type: 'website',
    images: [{ url: '/images/og-home.jpg', width: 1200, height: 630, alt: 'Ze Home Finds — the viral finds everyone is talking about' }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-ZA" className={`${dmSans.variable} ${heading.variable}`}>
      <body className="bg-background text-charcoal font-body min-h-screen flex flex-col text-[15px] leading-[1.6]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLd({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'OnlineStore',
                '@id': ORG_ID,
                name: SITE_NAME,
                alternateName: 'zehomefinds',
                url: SITE_URL,
                logo: { '@type': 'ImageObject', url: `${SITE_URL}/images/logo.png` },
                image: `${SITE_URL}/images/og-home.jpg`,
                description: 'South African online store for viral TikTok products: beauty, pet, home and wellness finds, with free tracked delivery and PayFast checkout',
                email: CONTACT_EMAIL,
                telephone: WHATSAPP,
                areaServed: { '@type': 'Country', name: 'South Africa' },
                currenciesAccepted: 'ZAR',
                paymentAccepted: 'Credit card, debit card, Instant EFT (PayFast)',
                hasMerchantReturnPolicy: returnPolicy,
                hasShippingService: shippingService,
                contactPoint: {
                  '@type': 'ContactPoint',
                  telephone: WHATSAPP,
                  email: CONTACT_EMAIL,
                  contactType: 'customer service',
                  areaServed: 'ZA',
                  availableLanguage: 'English',
                },
                sameAs: ['https://www.tiktok.com/@zehomefinds'],
              },
              {
                '@type': 'WebSite',
                '@id': `${SITE_URL}/#website`,
                name: SITE_NAME,
                url: SITE_URL,
                inLanguage: 'en-ZA',
                publisher: { '@id': ORG_ID },
              },
            ],
          })}
        />
        <AnnouncementBar />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <ChatHelper />
        <Analytics />
      </body>
    </html>
  )
}
