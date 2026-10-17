'use client'

import { useSyncExternalStore } from 'react'
import Script from 'next/script'
import { GA_ID } from '@/lib/site'
import { CONSENT_KEY } from '@/lib/analytics'

type Consent = 'granted' | 'denied' | 'unset'
const EVENT = 'zh-consent-change'

function readConsent(): Consent {
  try {
    const v = localStorage.getItem(CONSENT_KEY)
    return v === 'granted' || v === 'denied' ? v : 'unset'
  } catch {
    return 'unset'
  }
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb)
  window.addEventListener('storage', cb)
  return () => {
    window.removeEventListener(EVENT, cb)
    window.removeEventListener('storage', cb)
  }
}

// Loads Google Analytics only after the shopper accepts analytics cookies,
// and shows a small POPIA notice until they choose. No GA_ID = renders nothing.
export default function Analytics() {
  const consent = useSyncExternalStore<Consent | null>(subscribe, readConsent, () => null)

  if (!GA_ID || consent === null) return null

  const choose = (value: 'granted' | 'denied') => {
    try {
      localStorage.setItem(CONSENT_KEY, value)
    } catch {}
    window.dispatchEvent(new Event(EVENT))
  }

  return (
    <>
      {consent === 'granted' && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true});`}
          </Script>
        </>
      )}
      {consent === 'unset' && (
        <div
          role="dialog"
          aria-label="Cookie notice"
          className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-4 sm:bottom-4 sm:max-w-sm z-[60] bg-white border border-border rounded-2xl shadow-lg p-3 flex flex-col gap-2"
        >
          <p className="font-body text-charcoal" style={{ fontSize: '13px', lineHeight: '1.5' }}>
            We use analytics cookies to improve the store. No ads, no selling your data.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => choose('granted')}
              className="flex-1 rounded-full bg-charcoal text-white font-body font-medium min-h-[36px]"
              style={{ fontSize: '13px' }}
            >
              Accept
            </button>
            <button
              onClick={() => choose('denied')}
              className="flex-1 rounded-full border border-charcoal text-charcoal font-body font-medium min-h-[36px]"
              style={{ fontSize: '13px' }}
            >
              No thanks
            </button>
          </div>
        </div>
      )}
    </>
  )
}
