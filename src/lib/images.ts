// Product images are either site-relative (/images/...) or full supplier URLs.
export function absoluteImageUrl(image: string, baseUrl: string): string {
  return /^https?:\/\//.test(image) ? image : `${baseUrl}${image}`
}
