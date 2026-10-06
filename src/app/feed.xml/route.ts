import { products } from '@/lib/catalog'
import { absoluteImageUrl } from '@/lib/images'
import { SITE_NAME, SITE_URL } from '@/lib/site'

// Google Merchant Center product feed (RSS 2.0 + g: namespace) for free
// listings on Google Shopping. Add https://www.zehomefinds.co.za/feed.xml as a
// scheduled-fetch data source in Merchant Center.

export const dynamic = 'force-static'

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export function GET() {
  const items = products
    .map((p) => {
      const [image, ...extra] = p.images.map((img) => absoluteImageUrl(img, SITE_URL))
      const [, max] = p.deliveryDays.match(/\d+/g)?.map(Number) ?? [3, 7]
      return `
    <item>
      <g:id>${esc(p.id)}</g:id>
      <g:title>${esc(p.seo.title.replace(/ \| Ze Home Finds$/, ''))}</g:title>
      <g:description>${esc(p.description)}</g:description>
      <g:link>${SITE_URL}/product/${p.slug}</g:link>
      <g:image_link>${esc(image)}</g:image_link>
${extra.slice(0, 10).map((img) => `      <g:additional_image_link>${esc(img)}</g:additional_image_link>`).join('\n')}
      <g:availability>${p.inStock ? 'in_stock' : 'out_of_stock'}</g:availability>
      <g:price>${p.price.toFixed(2)} ZAR</g:price>
      <g:condition>new</g:condition>
      <g:identifier_exists>no</g:identifier_exists>
      <g:product_type>${esc(p.category)}</g:product_type>
      <g:is_bundle>${/kit/i.test(p.name) ? 'yes' : 'no'}</g:is_bundle>
      <g:shipping>
        <g:country>ZA</g:country>
        <g:service>Free tracked delivery</g:service>
        <g:price>0.00 ZAR</g:price>
        <g:max_transit_time>${max}</g:max_transit_time>
      </g:shipping>
    </item>`
    })
    .join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${SITE_NAME}</title>
    <link>${SITE_URL}</link>
    <description>Viral TikTok products with free delivery across South Africa</description>${items}
  </channel>
</rss>
`
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } })
}
