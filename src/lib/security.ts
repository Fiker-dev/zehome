import type { NextRequest } from 'next/server'

// Client IP as set by Vercel's edge (it overwrites x-forwarded-for, so the
// first entry can't be spoofed by the client).
export function clientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
}

// Best-effort rate limit per server instance. Serverless instances don't share
// memory, so this slows abuse rather than stopping it; add a Vercel Firewall
// rate-limit rule for a hard limit.
const hits = new Map<string, number[]>()
export function rateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
  recent.push(now)
  hits.set(key, recent)
  if (hits.size > 5000) hits.clear()
  return recent.length > limit
}

// Trimmed single-line text with control characters removed, or null when the
// value isn't a non-empty string within the length limit.
export function cleanText(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null
  const text = value.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim()
  return text && text.length <= maxLength ? text : null
}

// Google Sheets runs cells starting with = + - @ as formulas, so a customer
// could type "=IMPORTXML(...)" as their name and have it execute in the order
// sheet. A leading apostrophe makes Sheets store it as plain text.
export function sheetSafe(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
}
