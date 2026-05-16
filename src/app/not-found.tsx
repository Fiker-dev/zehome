import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-32 min-h-[60vh]">
      <p className="font-body text-terracotta uppercase font-medium tracking-[0.2em] mb-4" style={{ fontSize: '11px' }}>
        404
      </p>
      <h1 className="font-display text-charcoal mb-4" style={{ fontSize: '40px' }}>
        Page not found
      </h1>
      <p className="font-body text-warm-gray max-w-sm mb-10" style={{ fontSize: '15px', lineHeight: '1.6' }}>
        The page you&apos;re looking for doesn&apos;t exist. Let&apos;s get you back to the good stuff.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center bg-terracotta hover:bg-terracotta-dark text-white font-body font-medium uppercase tracking-[0.1em] transition-colors px-10 min-h-[48px]"
        style={{ fontSize: '13px' }}
      >
        Back to home
      </Link>
    </div>
  )
}
