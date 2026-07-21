import { computed, onMounted, ref } from 'vue'

const STORAGE_KEY = 'hyogen-md-pg-pane-widths'
const MIN_SIDEBAR = 160
const MIN_EDITOR = 220
const MIN_PREVIEW = 220
const DEFAULT_SIDEBAR = 220
const DEFAULT_EDITOR = 480

type PaneWidths = {
  sidebar: number
  editor: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function readStored(): PaneWidths | null {
  if (!import.meta.client) return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<PaneWidths>
    if (typeof parsed.sidebar !== 'number' || typeof parsed.editor !== 'number') {
      return null
    }
    return { sidebar: parsed.sidebar, editor: parsed.editor }
  } catch {
    return null
  }
}

function writeStored(widths: PaneWidths) {
  if (!import.meta.client) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(widths))
}

export function usePaneWidths(containerRef: { value: HTMLElement | null }) {
  const sidebarWidth = ref(DEFAULT_SIDEBAR)
  const editorWidth = ref(DEFAULT_EDITOR)

  const gridTemplateColumns = computed(
    () => `${sidebarWidth.value}px 4px ${editorWidth.value}px 4px minmax(${MIN_PREVIEW}px, 1fr)`,
  )

  onMounted(() => {
    const stored = readStored()
    if (stored) {
      sidebarWidth.value = stored.sidebar
      editorWidth.value = stored.editor
    }
  })

  function persist() {
    writeStored({ sidebar: sidebarWidth.value, editor: editorWidth.value })
  }

  function startResize(
    which: 'sidebar' | 'editor',
    event: PointerEvent,
  ) {
    const container = containerRef.value
    if (!container) return

    const startX = event.clientX
    const startSidebar = sidebarWidth.value
    const startEditor = editorWidth.value
    const rect = container.getBoundingClientRect()
    const separators = 8
    const maxTotal = rect.width - separators - MIN_PREVIEW

    function onMove(moveEvent: PointerEvent) {
      const delta = moveEvent.clientX - startX
      if (which === 'sidebar') {
        const nextSidebar = clamp(
          startSidebar + delta,
          MIN_SIDEBAR,
          maxTotal - MIN_EDITOR - editorWidth.value,
        )
        sidebarWidth.value = nextSidebar
      } else {
        const nextEditor = clamp(
          startEditor + delta,
          MIN_EDITOR,
          maxTotal - sidebarWidth.value - MIN_PREVIEW,
        )
        editorWidth.value = nextEditor
      }
    }

    function onUp() {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      persist()
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  return {
    sidebarWidth,
    editorWidth,
    gridTemplateColumns,
    startResize,
  }
}
