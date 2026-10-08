// Tells Bing (and other IndexNow search engines) about every URL in the live
// sitemap so new and changed pages are crawled within hours. Google doesn't
// use IndexNow — submit the sitemap in Search Console for Google.
//
//   node scripts/seo/indexnow.mjs
//
// Runs from GitHub Actions after a push to main (.github/workflows/indexnow.yml).
// The key is public by design: IndexNow proves site ownership by fetching
// https://www.zehomefinds.co.za/<key>.txt, which is in public/.

const SITE = 'https://www.zehomefinds.co.za'
const KEY = '0022ffb52020c10a6448647bbe67078e'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Wait (up to ~6 min) for the new deployment to serve the key file
for (let i = 0; ; i++) {
  const res = await fetch(`${SITE}/${KEY}.txt`).catch(() => null)
  if (res?.ok && (await res.text()).trim() === KEY) break
  if (i >= 24) throw new Error('Key file not live yet; re-run the workflow after the deployment finishes')
  await sleep(15000)
}

const xml = await (await fetch(`${SITE}/sitemap.xml`)).text()
const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((u) => u.startsWith(SITE))
if (!urlList.length) throw new Error('No URLs found in sitemap')

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: new URL(SITE).host, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList }),
})
console.log(`IndexNow: submitted ${urlList.length} URLs → HTTP ${res.status}`)
if (res.status >= 400) {
  console.error(await res.text())
  process.exit(1)
}
