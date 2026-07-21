export type ThemePreference = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'hyogen-md-theme'

function resolveTheme(preference: ThemePreference): 'light' | 'dark' {
  if (preference === 'system' && import.meta.client) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  if (preference === 'dark') return 'dark'
  return 'light'
}

export function useSiteTheme() {
  const preference = useState<ThemePreference>('theme-preference', () => 'system')
  const resolved = computed(() => resolveTheme(preference.value))

  function applyTheme() {
    if (!import.meta.client) return
    document.documentElement.dataset.theme = resolved.value
  }

  function setPreference(next: ThemePreference) {
    preference.value = next
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, next)
      applyTheme()
    }
  }

  if (import.meta.client) {
    onMounted(() => {
      const stored = localStorage.getItem(STORAGE_KEY) as ThemePreference | null
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        preference.value = stored
      }
      applyTheme()

      const media = window.matchMedia('(prefers-color-scheme: dark)')
      media.addEventListener('change', () => {
        if (preference.value === 'system') applyTheme()
      })
    })

    watch(resolved, applyTheme)
  }

  useHead({
    htmlAttrs: {
      'data-theme': resolved,
    },
  })

  return { preference, resolved, setPreference }
}
