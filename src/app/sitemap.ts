import type { MetadataRoute } from 'next'
import products from '@/data/products.json'

const baseUrl = process.env.NEXT_PUBLIC_STORE_URL ?? 'https://zehomefinds.co.za'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  const pages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/delivery`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/returns`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: 0.9,
    images: product.images.map((image) => `${baseUrl}${image}`),
  }))

  return [...pages, ...productPages]
}
