export type DocsLocale = 'en' | 'ja'

export function useDocsLocale() {
  const route = useRoute()

  const locale = computed<DocsLocale>(() =>
    route.path === '/ja' || route.path.startsWith('/ja/') ? 'ja' : 'en',
  )

  const collection = computed(() => (locale.value === 'ja' ? 'ja' : 'en'))

  function isLocaleIndependentPath(path: string): boolean {
    return path === '/playground' || path.startsWith('/playground/')
  }

  function contentPath(): string {
    if (locale.value === 'ja') {
      const sub = route.path.replace(/^\/ja\/?/, '')
      return sub ? `/${sub}` : '/'
    }
    return route.path === '' ? '/' : route.path
  }

  function switchLocalePath(target: DocsLocale): string {
    const current = contentPath()
    if (isLocaleIndependentPath(current)) {
      return current
    }
    if (target === 'ja') {
      return current === '/' ? '/ja' : `/ja${current}`
    }
    return current === '/' ? '/' : current
  }

  function navPath(segment: string): string {
    const path = segment.startsWith('/') ? segment : `/${segment}`
    if (isLocaleIndependentPath(path)) {
      return path
    }
    if (locale.value === 'ja') {
      return path === '/' ? '/ja' : `/ja${path}`
    }
    return path
  }

  return { locale, collection, contentPath, switchLocalePath, navPath }
}
