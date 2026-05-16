import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-charcoal border-t border-[#2E2A26]">
      {/* Main columns */}
      <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">

        {/* Left — brand */}
        <div className="flex flex-col gap-3">
          <p
            className="font-display font-medium text-white leading-none"
            style={{ fontSize: '22px', letterSpacing: '0.02em' }}
          >
            Ze Home Finds
          </p>
          <p
            className="font-body text-warm-gray uppercase tracking-[0.12em]"
            style={{ fontSize: '11px' }}
          >
            Mood lighting, delivered.
          </p>
          <p className="font-body text-warm-gray mt-2" style={{ fontSize: '13px', lineHeight: '1.6' }}>
            SA&apos;s home for atmosphere and mood lighting.<br />
            Free delivery. 3-7 business days nationwide.
          </p>
        </div>

        {/* Center — nav */}
        <div className="flex flex-col gap-4">
          <p
            className="font-body text-warm-gray uppercase tracking-[0.12em]"
            style={{ fontSize: '11px' }}
          >
            Navigate
          </p>
          <nav className="flex flex-col gap-3">
            {[
              { label: 'Home', href: '/' },
              { label: 'Products', href: '/#products' },
              { label: 'Delivery Info', href: '/delivery' },
              { label: 'Returns', href: '/returns' },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="font-body text-[#B5AFA8] hover:text-white transition-colors"
                style={{ fontSize: '14px' }}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right — contact */}
        <div className="flex flex-col gap-4">
          <p
            className="font-body text-warm-gray uppercase tracking-[0.12em]"
            style={{ fontSize: '11px' }}
          >
            Questions?
          </p>
          <p className="font-body text-[#B5AFA8]" style={{ fontSize: '14px' }}>
            WhatsApp us and we&apos;ll get back to you as soon as we can.
          </p>
          <a
            href="https://wa.me/27710278563"
            className="inline-flex items-center gap-2 font-body font-medium text-white hover:text-terracotta transition-colors"
            style={{ fontSize: '14px' }}
          >
            +27 71 027 8563
          </a>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#2E2A26]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <p className="font-body text-warm-gray" style={{ fontSize: '11px' }}>
            © {new Date().getFullYear()} Ze Home Finds. All rights reserved.
          </p>
          <p className="font-body text-warm-gray" style={{ fontSize: '11px' }}>
            Secure checkout via PayFast
          </p>
        </div>
      </div>
    </footer>
  )
}
