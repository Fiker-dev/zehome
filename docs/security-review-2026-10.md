# Security review — 8 Oct 2026

Scope: API routes, payment flow, order logging, dependencies, secrets/git
history, browser headers, GitHub Actions. All fixes verified with tests
(attack replay, endpoint tests, full browser QA).

## Fixed

| # | Severity | Issue | Fix |
|---|---|---|---|
| 1 | **Critical** | Cart tampering: the order ID signed only the amount, and the supplier "BUY" list came from the editable `item_name`. Pay R329 for a vacuum, edit the field → sheet says buy 3 massage guns + 2 hair brushes (~R2,055). Reproduced. | Order ID now signs amount **and** cart (`item_description` = `id*qty,…`); BUY list built only from that signed cart. Secret is `ORDER_SIGNING_SECRET` or the PayFast passphrase — never the merchant key, which is public in the checkout form. |
| 2 | **Critical** | Next.js 16.2.6: published DoS and proxy-bypass advisories; sharp/postcss advisories. | Next.js 16.4.0, `npm audit fix`. Production dependencies: 0 known vulnerabilities. |
| 3 | High | Paid orders lost: ITN IP allow-list had 8 single IPs; PayFast sends from 197.97.145.144/28 and 41.74.179.192/27, so other PayFast servers were refused. | Full ranges (CIDR check); PayFast validate call still required. |
| 4 | High | Spreadsheet formula injection: customer text (name/address) written to Google Sheets, where `=IMPORTXML(…)` etc. would execute in the owner's sheet. | All sheet values prefixed with `'` when they start with `= + - @`. |
| 5 | Medium | `/api/payfast/debug` publicly revealed payment config (sandbox mode, which secrets exist). | Removed. |
| 6 | Medium | `/api/payfast/cancel` wrote any `orderId` to the sheet (spam/injection). | Only real order-ID format, rate-limited. |
| 7 | Medium | Checkout endpoint: no input limits, no rate limit → sheet flooding, oversized rows. | Types, lengths, email/phone/postcode/province checks, clear error messages, best-effort rate limit (10 per 10 min per IP per instance). |
| 8 | Low | No browser security headers (clickjacking of checkout). | CSP frame-ancestors/base-uri/object-src, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy, HSTS; `X-Powered-By` removed. |
| 9 | Low | Result pages echoed any text from the URL as an "order ref". | Only shown when it matches a real reference format. |
| 10 | Low | Image optimiser still allowed CJ hosts (unused). | Removed. |

## Checked, no issue

- No secrets in the repo or git history; `.env*` ignored.
- Prices always computed server-side from products.json.
- JSON-LD escapes `<`; React escapes all other output; no user HTML rendered.
- GitHub Actions: push/schedule triggers only, no PR triggers or untrusted
  input in commands.

## Accepted / owner actions

- 5 "high" advisories remain in the **lint toolchain only** (eslint-config-next
  → fast-glob/micromatch/braces). Dev-only, never deployed; npm's "fix" is a
  downgrade to v14. Re-check when Next ships an update.
- **Rotate** the PayFast passphrase, CJ API key and CJ MCP token (exposed in an
  earlier chat). Optional: set `ORDER_SIGNING_SECRET` (long random string) in
  Vercel so a future passphrase rotation doesn't affect order signing.
  Orders started before a secret change get flagged "check payment" — verify
  them in the PayFast dashboard.
- Orders started before this deploy carry the old ID format and will show
  "DO NOT DISPATCH — check payment" if paid afterwards: check them manually.
- For a hard rate limit, add a Vercel Firewall rule on `/api/payfast/params`.
- Turn on 2-factor auth for GitHub, Vercel, PayFast, Google and Perfect Dealz.
