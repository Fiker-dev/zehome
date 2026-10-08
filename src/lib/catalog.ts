import products from '@/data/products.json'

export type Product = (typeof products)[number]

export const categorySlug = (category: string) =>
  category.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

// Categories in the order they first appear in products.json
export const categories = [...new Set(products.map((p) => p.category))].map((name) => ({
  name,
  slug: categorySlug(name),
  image: products.find((p) => p.category === name)!.images[0],
}))

export { products }

// Second real product photo (skips the branded benefit/how-it-works/compare cards),
// used as the hover image on product cards.
const CARD_IMAGES = ['/benefits.', '/how-it-works.', '/compare.', '/cover.']
export const hoverPhoto = (p: Product) =>
  p.images.slice(1).find((img) => !CARD_IMAGES.some((c) => img.includes(c)))
