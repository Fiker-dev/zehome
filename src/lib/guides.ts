import guides from '@/data/guides.json'

export type Guide = {
  slug: string
  title: string
  h1: string
  description: string
  intro: string
  published: string
  // Set when a guide is meaningfully revised (prices, products, new answers);
  // drives dateModified, the "Updated" line and the sitemap lastmod.
  updated?: string
  sections: { h2: string; body: string[]; products?: string[] }[]
  faqs: { q: string; a: string }[]
}

export const allGuides = guides as Guide[]

export const lastUpdated = (g: Guide) => g.updated ?? g.published

// Guides that feature a product, for "read before you buy" links on product pages.
export const guidesFor = (productId: string) =>
  allGuides.filter((g) => g.sections.some((s) => s.products?.includes(productId)))
