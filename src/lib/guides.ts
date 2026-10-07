import guides from '@/data/guides.json'

export type Guide = {
  slug: string
  title: string
  h1: string
  description: string
  intro: string
  published: string
  sections: { h2: string; body: string[]; products?: string[] }[]
  faqs: { q: string; a: string }[]
}

export const allGuides = guides as Guide[]
