export default function Footer() {
  return (
    <footer className="border-t border-border bg-warm-white mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-charcoal-muted">
        <p className="font-display text-charcoal font-medium tracking-wide">
          Ze Home Finds
        </p>

        <ul className="flex items-center gap-6">
          <li>Free delivery across South Africa</li>
          <li>·</li>
          <li>3-5 day shipping</li>
          <li>·</li>
          <li>No hassle returns</li>
        </ul>

        <p>© {new Date().getFullYear()} Ze Home Finds</p>
      </div>
    </footer>
  )
}
