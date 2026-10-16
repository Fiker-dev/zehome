import type { Product } from '@/lib/catalog'
import { absoluteImageUrl } from '@/lib/images'
import { ORG_ID, RETURN_DAYS, SITE_NAME, SITE_URL } from '@/lib/site'

// schema.org JSON-LD builders. Product markup includes shipping and returns so
// Google can show price, free delivery and returns in merchant listings.

const businessDays = (deliveryDays: string) => {
  const [min, max] = deliveryDays.match(/\d+/g)?.map(Number) ?? [3, 7]
  return { min, max }
}

// Store-wide promise; products.json deliveryDays should match it.
const STORE_DELIVERY_DAYS = '3-7 business days'

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((d) => `https://schema.org/${d}`)

const minMax = ({ min, max }: { min: number; max: number }) => ({ minValue: min, maxValue: max })

// Order-to-door time split into handling (we buy and hand over to the courier)
// and courier transit, in business days, so handling + transit adds up to the
// "3-7 business days" promised on the page and in the Merchant Center feed.
export const HANDLING_DAYS = { min: 1, max: 2 }
export const transitDays = (deliveryDays: string) => {
  const { min, max } = businessDays(deliveryDays)
  return { min: Math.max(min - HANDLING_DAYS.min, 1), max: Math.max(max - HANDLING_DAYS.max, 1) }
}

// One return policy for the whole store (matches /returns). Used at
// Organization level and repeated on every Offer for merchant listings.
// returnFees is left out on purpose until the owner confirms who pays for
// return courier costs on change-of-mind returns.
export const returnPolicy = {
  '@type': 'MerchantReturnPolicy',
  '@id': `${SITE_URL}/returns#policy`,
  applicableCountry: 'ZA',
  returnPolicyCountry: 'ZA',
  returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
  merchantReturnDays: RETURN_DAYS,
  returnMethod: 'https://schema.org/ReturnByMail',
  refundType: 'https://schema.org/FullRefund',
  merchantReturnLink: `${SITE_URL}/returns`,
}

// Store-wide shipping policy (Organization > hasShippingService).
export const shippingService = {
  '@type': 'ShippingService',
  '@id': `${SITE_URL}/delivery#shipping`,
  name: 'Free tracked delivery',
  description: 'Free, tracked door-to-door delivery anywhere in South Africa in 3-7 business days. No minimum spend.',
  fulfillmentType: 'https://schema.org/FulfillmentTypeDelivery',
  handlingTime: {
    '@type': 'ServicePeriod',
    businessDays: WEEKDAYS,
    duration: { '@type': 'QuantitativeValue', minValue: HANDLING_DAYS.min, maxValue: HANDLING_DAYS.max, unitCode: 'DAY' },
  },
  shippingConditions: {
    '@type': 'ShippingConditions',
    shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'ZA' },
    shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'ZAR' },
    transitTime: {
      '@type': 'ServicePeriod',
      businessDays: WEEKDAYS,
      duration: { '@type': 'QuantitativeValue', ...minMax(transitDays(STORE_DELIVERY_DAYS)), unitCode: 'DAY' },
    },
  },
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
  const transit = transitDays(product.deliveryDays)
  const nextYear = `${new Date().getFullYear() + 1}-12-31`
  const thisYear = `${new Date().getFullYear()}-01-01`
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
      validFrom: thisYear,
      priceValidUntil: nextYear,
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: { '@type': 'OnlineStore', '@id': ORG_ID, name: SITE_NAME },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'ZAR' },
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'ZA' },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          businessDays: { '@type': 'OpeningHoursSpecification', dayOfWeek: WEEKDAYS },
          handlingTime: { '@type': 'QuantitativeValue', minValue: HANDLING_DAYS.min, maxValue: HANDLING_DAYS.max, unitCode: 'DAY' },
          transitTime: { '@type': 'QuantitativeValue', ...minMax(transit), unitCode: 'DAY' },
        },
      },
      hasMerchantReturnPolicy: returnPolicy,
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
