import { Truck, ShieldCheck, RotateCcw } from 'lucide-react'

const ITEMS = [
  { icon: Truck, text: 'Free delivery across South Africa' },
  { icon: ShieldCheck, text: 'Secure checkout with PayFast' },
  { icon: RotateCcw, text: '14-day returns' },
]

export default function AnnouncementBar() {
  return (
    <div className="bg-charcoal text-white">
      <ul className="max-w-6xl mx-auto px-4 h-9 flex items-center justify-center gap-8 font-body tracking-[0.06em]" style={{ fontSize: '11px' }}>
        {ITEMS.map(({ icon: Icon, text }, i) => (
          <li key={text} className={`items-center gap-2 whitespace-nowrap ${i === 0 ? 'flex' : 'hidden md:flex'}`}>
            <Icon size={13} strokeWidth={1.75} className="text-terracotta" aria-hidden="true" />
            {text}
          </li>
        ))}
      </ul>
    </div>
  )
}
