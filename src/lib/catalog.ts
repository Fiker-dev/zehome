import allProducts from '@/data/products.json'

export type Product = (typeof allProducts)[number]

// Hidden products (e.g. the R10 payment test) can be bought by direct link
// but never appear in listings, collections, the sitemap or the Shopping feed.
const products = allProducts.filter((p) => !(p as { hidden?: boolean }).hidden)
export const isHidden = (p: Product) => Boolean((p as { hidden?: boolean }).hidden)

export const categorySlug = (category: string) =>
  category.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

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
