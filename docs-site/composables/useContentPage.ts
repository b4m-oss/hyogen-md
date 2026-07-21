const RESERVED_SEGMENTS = new Set(['playground'])

const SKIP_EXTENSIONS = /\.(?:webmanifest|js|map|ico|png|svg|json|txt|xml)$/i

export function isDocsContentSlug(slugParts: string[]): boolean {
  if (!slugParts.length) return false
  const joined = slugParts.join('/')
  if (RESERVED_SEGMENTS.has(slugParts[0]!)) return false
  if (SKIP_EXTENSIONS.test(joined)) return false
  if (slugParts.some((part) => part.includes('.'))) return false
  return true
}

export function slugToContentPath(slugParts: string[], locale: 'en' | 'ja'): string | null {
  if (!isDocsContentSlug(slugParts)) return null
  const suffix = `/${slugParts.join('/')}`
  return locale === 'ja' ? `/ja${suffix}` : suffix
}
