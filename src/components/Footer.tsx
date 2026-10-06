import Link from 'next/link'
import { categories } from '@/lib/catalog'

const heading = 'font-body font-semibold text-charcoal mb-4'
const link = 'font-body text-charcoal-light hover:text-charcoal hover:underline underline-offset-4'

export default function Footer() {
  return (
    <footer className="bg-cream border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-10" style={{ fontSize: '14px' }}>
        <div className="col-span-2 md:col-span-1 flex flex-col gap-3">
          <p className="font-display font-semibold text-charcoal tracking-tight lowercase" style={{ fontSize: '22px' }}>
            ze home finds
          </p>
          <p className="font-body text-charcoal-light leading-relaxed max-w-xs">
            The finds you keep seeing on TikTok, in one place. Free, tracked delivery anywhere in South Africa.
          </p>
        </div>

        <div>
          <p className={heading}>Shop</p>
          <ul className="flex flex-col gap-2.5">
            <li><Link href="/shop" className={link}>Shop all</Link></li>
            {categories.map((c) => (
              <li key={c.slug}><Link href={`/shop?category=${c.slug}`} className={link}>{c.name}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <p className={heading}>Help</p>
          <ul className="flex flex-col gap-2.5">
            <li><Link href="/delivery" className={link}>Delivery</Link></li>
            <li><Link href="/returns" className={link}>Returns &amp; refunds</Link></li>
            <li><a href="https://wa.me/27710278563" className={link}>WhatsApp support</a></li>
          </ul>
        </div>

        <div className="col-span-2 md:col-span-1">
          <p className={heading}>Contact</p>
          <p className="font-body text-charcoal-light leading-relaxed">
            WhatsApp <a href="https://wa.me/27710278563" className="text-charcoal underline underline-offset-4">+27 71 027 8563</a>
            <br />We reply as soon as we can.
          </p>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 font-body text-warm-gray" style={{ fontSize: '12px' }}>
          <p>© {new Date().getFullYear()} Ze Home Finds</p>
          <ul className="flex items-center gap-2" aria-label="Payment methods">
            {['PayFast', 'Visa', 'Mastercard', 'Instant EFT'].map((m) => (
              <li key={m} className="border border-border rounded px-2 py-1 text-charcoal-light">{m}</li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
