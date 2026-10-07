import type { Product } from '@/lib/catalog'
import { absoluteImageUrl } from '@/lib/images'
import { RETURN_DAYS, SITE_NAME, SITE_URL } from '@/lib/site'

// schema.org JSON-LD builders. Product markup includes shipping and returns so
// Google can show price, free delivery and returns in merchant listings.

const businessDays = (deliveryDays: string) => {
  const [min, max] = deliveryDays.match(/\d+/g)?.map(Number) ?? [3, 7]
  return { min, max }
}

// Real customer reviews only (collected after delivery, proof kept). Google
// treats invented reviews as spam and the Consumer Protection Act bans them.
export interface Review {
  author: string
  rating: number
  date: string
  body: string
  location?: string
}

export const reviewsOf = (product: Product) => ((product as { reviews?: Review[] }).reviews ?? []) as Review[]

export function productSchema(product: Product) {
  const url = `${SITE_URL}/product/${product.slug}`
  const { min, max } = businessDays(product.deliveryDays)
  const nextYear = `${new Date().getFullYear() + 1}-12-31`
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    name: product.name,
    description: product.description,
    sku: product.id,
    category: product.category,
    url,
    image: product.images.map((img) => absoluteImageUrl(img, SITE_URL)),
    ...reviewMarkup(product),
    offers: {
      '@type': 'Offer',
      url,
      price: product.price.toFixed(2),
      priceCurrency: 'ZAR',
      priceValidUntil: nextYear,
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: SITE_NAME },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', value: '0', currency: 'ZAR' },
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'ZA' },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 2, unitCode: 'DAY' },
          transitTime: { '@type': 'QuantitativeValue', minValue: Math.max(min - 1, 1), maxValue: max - 1, unitCode: 'DAY' },
        },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'ZA',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: RETURN_DAYS,
      },
    },
  }
}

function reviewMarkup(product: Product) {
  const reviews = reviewsOf(product)
  if (!reviews.length) return {}
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  return {
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: avg.toFixed(1),
      reviewCount: reviews.length,
      bestRating: 5,
      worstRating: 1,
    },
    review: reviews.slice(0, 10).map((r) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.author },
      datePublished: r.date,
      reviewBody: r.body,
      reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5, worstRating: 1 },
    })),
  }
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  }
}

export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }
}

export function itemListSchema(products: Product[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}/product/${p.slug}`,
      name: p.name,
    })),
  }
}

export const jsonLd = (data: object) => ({ __html: JSON.stringify(data).replace(/</g, '\\u003c') })
