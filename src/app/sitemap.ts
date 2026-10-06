import type { MetadataRoute } from 'next'
import { categories, products } from '@/lib/catalog'
import { absoluteImageUrl } from '@/lib/images'
import { SITE_URL } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  const page = (path: string, priority: number, changeFrequency: 'weekly' | 'monthly') => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  })

  return [
    page('', 1, 'weekly'),
    page('/shop', 0.9, 'weekly'),
    ...categories.map((c) => page(`/collections/${c.slug}`, 0.8, 'weekly')),
    ...products.map((p) => ({
      ...page(`/product/${p.slug}`, 0.9, 'weekly'),
      images: p.images.map((image) => absoluteImageUrl(image, SITE_URL)),
    })),
    page('/delivery', 0.4, 'monthly'),
    page('/returns', 0.4, 'monthly'),
  ]
}
