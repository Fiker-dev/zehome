import Link from 'next/link'
import type { Metadata } from 'next'
import { allGuides } from '@/lib/guides'
import { breadcrumbSchema, jsonLd } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Guides & Gift Ideas | Ze Home Finds',
  description: 'Honest buying guides, gift ideas and how-tos for the viral finds South Africans are buying — from gifts under R500 to getting pet hair off the couch.',
  alternates: { canonical: '/guides' },
}

export default function GuidesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Guides', path: '/guides' }]))}
      />
      <h1 className="font-display font-semibold text-charcoal tracking-tight lowercase" style={{ fontSize: 'clamp(28px, 5vw, 40px)' }}>
        guides &amp; gift ideas
      </h1>
      <p className="mt-3 font-body text-charcoal-light" style={{ fontSize: '15px' }}>
        Straight answers about the finds everyone&apos;s talking about — what they do, who they&apos;re for, and how to get the most out of them.
      </p>
      <ul className="mt-8 border-t border-border">
        {allGuides.map((g) => (
          <li key={g.slug} className="border-b border-border">
            <Link href={`/guides/${g.slug}`} className="group block py-5">
              <p className="font-display font-semibold text-charcoal group-hover:underline underline-offset-4" style={{ fontSize: '19px' }}>
                {g.h1}
              </p>
              <p className="mt-1 font-body text-charcoal-light" style={{ fontSize: '14px' }}>{g.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
