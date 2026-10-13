'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'
import { useCart } from '@/lib/cart'
import { products, type Product } from '@/lib/catalog'
import { RETURN_DAYS } from '@/lib/site'

// Free, rule-based helper (no AI): answers the common questions from the
// store's own policies, tracks orders through /api/order-status, and hands
// anything else to WhatsApp with a message that already says what it's about.

const WA_NUMBER = '27710278563'
const HIDDEN_ON = ['/cart', '/checkout']

type Topic = 'track' | 'delivery' | 'returns' | 'payment' | 'choose' | 'human'

interface Msg {
  id: number
  from: 'bot' | 'user'
  body: ReactNode
}

const STAGE_TEXT: Record<string, string> = {
  unpaid: 'We have not received payment for this order yet. If you still want it, you can place it again from the shop, or WhatsApp us and we will help you complete it.',
  preparing: 'Payment received. Your order is being packed for dispatch. Your tracking number comes on WhatsApp (and email, if you gave one) as soon as it ships, usually within 1–2 business days.',
  shipped: 'Your order is on its way!',
  cancelled: 'This order was cancelled before payment, so nothing was charged.',
  checking: 'We are double-checking the payment on this order and will contact you shortly. You do not need to do anything.',
}

const CHOOSE: { label: string; match: (p: Product) => boolean }[] = [
  { label: 'For my home', match: (p) => /home (fragrance|d[eé]cor)/i.test(p.category) },
  { label: 'Beauty & self-care', match: (p) => /beauty|wellness/i.test(p.category) },
  { label: 'For my pet', match: (p) => /pet/i.test(p.category) },
  { label: 'Cleaning', match: (p) => /clean/i.test(p.category) },
  { label: 'A gift', match: () => true },
]

const rand = (n: number) => `R${n.toLocaleString('en-ZA')}`

function waLink(text: string) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`
}

// Plain keyword matching for typed questions
function intentOf(text: string): Topic | null {
  const t = text.toLowerCase()
  if (/track|where.*(order|parcel)|status|ship(ped)?|dispatch|courier|order number|ord-/.test(t)) return 'track'
  if (/deliver|how long|arriv|when.*(get|come)|days|shipping|cost.*deliver|free/.test(t)) return 'delivery'
  if (/return|refund|exchange|broken|damag|faulty|wrong item|money back/.test(t)) return 'returns'
  if (/pay|eft|card|payfast|ozow|cash|secure|safe|charged|declin/.test(t)) return 'payment'
  if (/recommend|suggest|gift|choose|best|which|what.*(buy|sell)|product|price|cost/.test(t)) return 'choose'
  if (/human|person|agent|someone|call|talk|whatsapp/.test(t)) return 'human'
  return null
}

export default function ChatHelper() {
  const pathname = usePathname()
  const cartOpen = useCart((s) => s.isOpen)
  const cartItems = useCart((s) => s.items)
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [mode, setMode] = useState<'menu' | 'track'>('menu')
  const [choosing, setChoosing] = useState(false)
  const [input, setInput] = useState('')
  const [ref, setRef] = useState('')
  const [phone, setPhone] = useState('')
  const [busy, setBusy] = useState(false)
  const nextId = useRef(1)
  const endRef = useRef<HTMLDivElement>(null)

  const product = pathname.startsWith('/product/')
    ? products.find((p) => p.slug === pathname.split('/')[2])
    : undefined

  // What the WhatsApp message says about where the customer is
  const context = useCallback(() => {
    const bits: string[] = []
    if (product) bits.push(`I'm looking at the ${product.name} (${rand(product.price)}).`)
    if (cartItems.length) bits.push(`In my cart: ${cartItems.map((i) => `${i.name} x${i.quantity}`).join(', ')}.`)
    return bits.join(' ')
  }, [product, cartItems])

  const say = useCallback((from: Msg['from'], body: ReactNode) => {
    setMsgs((m) => [...m, { id: nextId.current++, from, body }])
  }, [])

  const handoff = useCallback(
    (about: string) => {
      const text = ['Hi Ze Home Finds,', about, context()].filter(Boolean).join(' ')
      return (
        <a
          href={waLink(text)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-2 rounded-full px-4 py-2 text-white font-medium"
          style={{ backgroundColor: '#25D366', fontSize: '13px' }}
        >
          Chat with us on WhatsApp
        </a>
      )
    },
    [context]
  )

  const answer = useCallback(
    (topic: Topic, typed?: string) => {
      setChoosing(topic === 'choose')
      if (topic === 'track') {
        setMode('track')
        say('bot', 'Enter your order number (it starts with ORD- and is on your receipt; the last 6 characters are enough) and the phone number you used at checkout.')
        return
      }
      setMode('menu')
      if (topic === 'delivery') {
        say(
          'bot',
          <>
            Delivery is <b>free</b> on every order, anywhere in South Africa (no PO boxes). Orders ship from local stock in
            Johannesburg and arrive in <b>3–7 business days</b>; each product page shows an estimated arrival date. You get a
            tracking number on WhatsApp (and email, if you gave one) when it ships.{' '}
            <Link href="/delivery" className="underline">Delivery info</Link>
          </>
        )
      } else if (topic === 'returns') {
        say(
          'bot',
          <>
            You can return any unused item in its original packaging within <b>{RETURN_DAYS} days</b>. Refunds are processed
            within 7 business days of us receiving it. If something arrived damaged or faulty, WhatsApp us a photo and we will
            sort it out.{' '}
            <Link href="/returns" className="underline">Returns policy</Link>
            <br />
            {handoff('I would like help with a return.')}
          </>
        )
      } else if (topic === 'payment') {
        say(
          'bot',
          <>
            Checkout runs through <b>PayFast</b>, South Africa&apos;s trusted payment gateway: card, Instant EFT and other
            PayFast methods. We never see your card details. If a payment failed, you can simply try again from your cart.
          </>
        )
      } else if (topic === 'choose') {
        say('bot', 'Happy to help! Who or what is it for?')
      } else {
        say(
          'bot',
          <>
            {typed ? 'I could not answer that one myself, but we can. ' : ''}Tap below to message us on WhatsApp. Your
            message is already written; just press send. We usually reply within a few hours (Mon–Sat).
            <br />
            {handoff(typed ? `My question: ${typed}` : 'I have a question.')}
          </>
        )
      }
    },
    [say, handoff]
  )

  const pick = (topic: Topic, label: string) => {
    say('user', label)
    answer(topic)
  }

  const choose = (label: string, match: (p: Product) => boolean) => {
    say('user', label)
    setChoosing(false)
    const list = products.filter(match).slice(0, label === 'A gift' ? 4 : 3)
    say(
      'bot',
      <>
        {label === 'A gift' ? 'Our most-gifted finds:' : 'These might be just right:'}
        <ul className="mt-2 flex flex-col gap-1.5">
          {list.map((p) => (
            <li key={p.slug}>
              <Link href={`/product/${p.slug}`} onClick={() => setOpen(false)} className="underline">
                {p.name}
              </Link>{' '}
              <span className="text-warm-gray">{rand(p.price)}</span>
            </li>
          ))}
        </ul>
        <span className="block mt-2">All with free delivery.</span>
      </>
    )
  }

  const submitTyped = (e: FormEvent) => {
    e.preventDefault()
    const text = input.trim().slice(0, 300)
    if (!text) return
    setInput('')
    say('user', text)
    answer(intentOf(text) ?? 'human', text)
  }

  const submitTrack = async (e: FormEvent) => {
    e.preventDefault()
    if (busy) return
    say('user', `Order ${ref.trim()} · ${phone.trim()}`)
    setBusy(true)
    try {
      const res = await fetch('/api/order-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ref: ref.trim(), phone: phone.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        say('bot', <>{data.error ?? 'Something went wrong.'}<br />{handoff(`Please check my order ${ref.trim()}.`)}</>)
      } else if (!data.found) {
        say(
          'bot',
          <>
            I could not find an order with that number and phone. Check the number on your receipt (it starts with ORD-) and use
            the phone number you entered at checkout. Or ask us directly:
            <br />
            {handoff(`Please check my order ${ref.trim()}.`)}
          </>
        )
      } else {
        const o = data.order
        say(
          'bot',
          <>
            <b>{o.product}</b>
            <span className="block text-warm-gray" style={{ fontSize: '12px' }}>
              Ordered {o.date} · {o.ref}
            </span>
            <span className="block mt-2">{STAGE_TEXT[o.stage] ?? STAGE_TEXT.checking}</span>
            {o.tracking && (
              <span className="block mt-2">
                Tracking number: <b className="select-all">{o.tracking}</b>
              </span>
            )}
            {handoff(`About my order ${o.ref}:`)}
          </>
        )
        setRef('')
        setPhone('')
        setMode('menu')
      }
    } catch {
      say('bot', <>We could not check your order just now.<br />{handoff(`Please check my order ${ref.trim()}.`)}</>)
    } finally {
      setBusy(false)
    }
  }

  // Opening the helper the first time starts with a greeting
  const openHelper = useCallback(() => {
    setOpen(true)
    setMsgs((m) =>
      m.length
        ? m
        : [{
            id: nextId.current++,
            from: 'bot',
            body: product
              ? `Hi! Questions about the ${product.name}, or anything else? Pick a topic or type your question.`
              : 'Hi! I’m the Ze Home Finds helper. Pick a topic or type your question.',
          }]
    )
  }, [product])

  // Links like zehomefinds.co.za/?help=track (used in our emails) open the helper
  useEffect(() => {
    const help = new URLSearchParams(window.location.search).get('help')
    if (!help) return
    const t = setTimeout(() => {
      openHelper()
      if (help === 'track') {
        say('user', 'Track my order')
        answer('track')
      }
    }, 0)
    return () => clearTimeout(t)
    // run once on first load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [msgs, mode])

  if (cartOpen || HIDDEN_ON.includes(pathname)) return null

  // Product pages have a sticky add-to-cart bar along the bottom on mobile
  const offset = pathname.startsWith('/product/') ? 'bottom-24 md:bottom-6' : 'bottom-6'

  const chip = 'rounded-full border border-border bg-warm-white px-3 py-1.5 text-charcoal hover:border-charcoal transition-colors'

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label="Ze Home Finds help"
          className={`fixed z-50 ${offset} right-4 left-4 sm:left-auto sm:right-6 sm:w-[370px] mb-16 flex flex-col bg-background border border-border shadow-2xl rounded-2xl overflow-hidden`}
          style={{ maxHeight: `min(560px, calc(100dvh - ${pathname.startsWith('/product/') ? 190 : 110}px))` }}
        >
          <div className="flex items-center justify-between px-4 py-3 bg-charcoal text-warm-white">
            <div>
              <p className="font-display" style={{ fontSize: '16px' }}>Ze Home Finds help</p>
              <p style={{ fontSize: '11px', opacity: 0.75 }}>Instant answers · a real person on WhatsApp</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close help" className="p-1">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2 font-body" style={{ fontSize: '14px', lineHeight: 1.5 }}>
            {msgs.map((m) => (
              <div
                key={m.id}
                className={
                  m.from === 'bot'
                    ? 'self-start max-w-[90%] rounded-2xl rounded-tl-sm bg-cream text-charcoal px-3 py-2'
                    : 'self-end max-w-[85%] rounded-2xl rounded-tr-sm bg-charcoal text-warm-white px-3 py-2'
                }
              >
                {m.body}
              </div>
            ))}

            {mode === 'track' ? (
              <form onSubmit={submitTrack} className="flex flex-col gap-2 mt-1">
                <input
                  value={ref}
                  onChange={(e) => setRef(e.target.value)}
                  placeholder="Order number, e.g. ORD-… or last 6 characters"
                  aria-label="Order number"
                  autoComplete="off"
                  required
                  className="border border-border rounded-lg px-3 py-2 bg-warm-white"
                  style={{ fontSize: '16px' }}
                />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number used at checkout"
                  aria-label="Phone number used at checkout"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  className="border border-border rounded-lg px-3 py-2 bg-warm-white"
                  style={{ fontSize: '16px' }}
                />
                <div className="flex gap-2">
                  <button type="submit" disabled={busy} className="flex-1 rounded-full bg-charcoal text-warm-white py-2 font-medium disabled:opacity-60">
                    {busy ? 'Checking…' : 'Check my order'}
                  </button>
                  <button type="button" onClick={() => setMode('menu')} className={chip}>
                    Back
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-wrap gap-2 mt-1" style={{ fontSize: '13px' }}>
                {choosing
                  ? CHOOSE.map((c) => (
                      <button key={c.label} type="button" className={chip} onClick={() => choose(c.label, c.match)}>
                        {c.label}
                      </button>
                    ))
                  : (
                    <>
                      <button type="button" className={chip} onClick={() => pick('track', 'Track my order')}>Track my order</button>
                      <button type="button" className={chip} onClick={() => pick('delivery', 'Delivery')}>Delivery</button>
                      <button type="button" className={chip} onClick={() => pick('returns', 'Returns & refunds')}>Returns &amp; refunds</button>
                      <button type="button" className={chip} onClick={() => pick('payment', 'Payment')}>Payment</button>
                      <button type="button" className={chip} onClick={() => pick('choose', 'Help me choose')}>Help me choose</button>
                      <button type="button" className={chip} onClick={() => pick('human', 'Talk to a person')}>Talk to a person</button>
                    </>
                  )}
              </div>
            )}
            <div ref={endRef} />
          </div>

          {mode === 'menu' && (
            <form onSubmit={submitTyped} className="flex items-center gap-2 border-t border-border px-3 py-2 bg-warm-white">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question…"
                aria-label="Type your question"
                maxLength={300}
                className="flex-1 bg-transparent outline-none py-1.5"
                style={{ fontSize: '16px' }}
              />
              <button type="submit" aria-label="Send" className="p-2 rounded-full bg-charcoal text-warm-white">
                <Send size={15} />
              </button>
            </form>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openHelper())}
        aria-label={open ? 'Close help' : 'Questions? Chat with us'}
        aria-expanded={open}
        className={`fixed ${offset} right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg hover:scale-105 transition-transform bg-charcoal text-warm-white`}
      >
        {open ? <X size={24} /> : <MessageCircle size={26} />}
      </button>
    </>
  )
}
