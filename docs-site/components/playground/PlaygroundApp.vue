<script setup lang="ts">
import { computed, onBeforeUnmount, ref, shallowRef } from 'vue'
import FilerPane from './components/FilerPane.vue'
import CodeEditor from './components/CodeEditor.vue'
import PreviewPane from './components/PreviewPane.vue'
import DiagnosticsPanel from './components/DiagnosticsPanel.vue'
import { loadOrSeed, resetToDemo, save } from './fs/persist'
import { isOutPath, isSrcPath, parentPath, srcToOut } from './fs/paths'
import { syncOutAfterSrcRename } from './fs/syncOutAfterSrcRename'
import type { VirtualFs } from './fs/virtualFs'
import { DEMO_ENTRY, FIXED_CONTEXT } from './seed/demoSeed'
import { renderOpenFile } from './render/renderOpenFile'
import { renderSrcTreeToOut } from './render/renderSrcTreeToOut'
import {
  toDiagnosticsView,
  type DiagnosticsView,
} from './render/toDiagnosticsView'
import { RENDER_DEBOUNCE_MS } from './render/debounceMs'
import { isUnderscoreEntry } from './fs/isUnderscoreEntry'
import { usePaneWidths } from './composables/usePaneWidths'

const bodyRef = ref<HTMLElement | null>(null)
const { gridTemplateColumns, startResize } = usePaneWidths(bodyRef)

const fs = shallowRef<VirtualFs>(loadOrSeed(localStorage))
const selectedPath = ref<string | null>(DEMO_ENTRY)
const editorText = ref('')
const previewMarkdown = ref('')
const treeTick = ref(0)
const diagnostics = ref<DiagnosticsView>({
  ok: true,
  markdown: null,
  warnings: [],
  error: null,
  note: null,
})

let debounceTimer: ReturnType<typeof setTimeout> | null = null
let renderSeq = 0

const srcTree = computed(() => {
  treeTick.value
  return fs.value.listTree('/src')
})

const outTree = computed(() => {
  treeTick.value
  return fs.value.listTree('/out')
})

const editorReadOnly = computed(() => {
  if (!selectedPath.value) return true
  return !isSrcPath(selectedPath.value) || fs.value.statKind(selectedPath.value) !== 'file'
})

function bumpTree() {
  treeTick.value += 1
}

function persist() {
  save(fs.value, localStorage)
  bumpTree()
}

function loadSelectedIntoEditor() {
  const path = selectedPath.value
  if (!path || fs.value.statKind(path) !== 'file') {
    editorText.value = ''
    return
  }
  editorText.value = fs.value.read(path)
}

async function runRender(srcPath: string) {
  const seq = ++renderSeq
  const sourceMarkdown =
    fs.value.statKind(srcPath) === 'file' ? fs.value.read(srcPath) : ''
  const result = await renderOpenFile({
    fs: fs.value,
    srcPath,
    context: FIXED_CONTEXT,
  })
  if (seq !== renderSeq) return

  const view = toDiagnosticsView(result, { sourceMarkdown })
  diagnostics.value = view

  if (view.ok && view.markdown != null) {
    previewMarkdown.value = view.markdown
  } else {
    try {
      const outPath = srcToOut(srcPath)
      if (fs.value.exists(outPath)) {
        previewMarkdown.value = fs.value.read(outPath)
      }
    } catch {
      /* keep previous preview */
    }
  }

  persist()
}

function scheduleRender() {
  const path = selectedPath.value
  if (!path || !isSrcPath(path) || fs.value.statKind(path) !== 'file') {
    return
  }
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    void runRender(path)
  }, RENDER_DEBOUNCE_MS)
}

function onSelect(path: string) {
  selectedPath.value = path
  loadSelectedIntoEditor()
  if (isSrcPath(path) && fs.value.statKind(path) === 'file') {
    scheduleRender()
  } else if (isOutPath(path) && fs.value.statKind(path) === 'file') {
    renderSeq += 1
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
    previewMarkdown.value = fs.value.read(path)
    diagnostics.value = {
      ok: true,
      markdown: previewMarkdown.value,
      warnings: [],
      error: null,
      note: null,
    }
  }
}

function onEditorUpdate(value: string) {
  editorText.value = value
  const path = selectedPath.value
  if (!path || !isSrcPath(path) || fs.value.statKind(path) !== 'file') return
  fs.value.writeSrc(path, value)
  persist()
  scheduleRender()
}

function promptName(message: string, initial = ''): string | null {
  const value = window.prompt(message, initial)
  if (value == null) return null
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

function onCreateFile(parent: string) {
  const name = promptName('New file name (e.g. page.md)', 'untitled.md')
  if (!name) return
  const path = `${parent}/${name}`.replace(/\/+/g, '/')
  try {
    fs.value.writeSrc(path, '# New file\n')
    selectedPath.value = path
    loadSelectedIntoEditor()
    persist()
    scheduleRender()
  } catch (e) {
    window.alert(String(e))
  }
}

function onCreateFolder(parent: string) {
  const name = promptName('New folder name', 'folder')
  if (!name) return
  const path = `${parent}/${name}`.replace(/\/+/g, '/')
  try {
    fs.value.mkdir(path)
    selectedPath.value = path
    persist()
  } catch (e) {
    window.alert(String(e))
  }
}

function onRename(path: string) {
  if (!path || !isSrcPath(path) || path === '/src') return
  const base = path.slice(path.lastIndexOf('/') + 1)
  const name = promptName('Rename to', base)
  if (!name || name === base) return
  const dest = `${parentPath(path)}/${name}`.replace(/\/+/g, '/')
  const fromWasUnderscore = isUnderscoreEntry(path)
  try {
    fs.value.rename(path, dest)
    syncOutAfterSrcRename(fs.value, path, dest)
    selectedPath.value = dest
    loadSelectedIntoEditor()
    persist()
    const destKind = fs.value.statKind(dest)
    const destIsLive = !isUnderscoreEntry(dest)
    if (destKind === 'file' && destIsLive) {
      scheduleRender()
    } else if (
      fromWasUnderscore &&
      destIsLive &&
      destKind === 'directory'
    ) {
      void populateOutAfterUnderscoreDirUnhide(dest)
    }
  } catch (e) {
    window.alert(String(e))
  }
}

async function populateOutAfterUnderscoreDirUnhide(rootSrcPath: string) {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
  const seq = ++renderSeq
  await renderSrcTreeToOut(fs.value, rootSrcPath, FIXED_CONTEXT)
  if (seq !== renderSeq) return
  persist()
}

function onRemove(path: string) {
  if (!path || !isSrcPath(path) || path === '/src') return
  if (!window.confirm(`Delete ${path}?`)) return
  try {
    fs.value.remove(path)
    selectedPath.value = DEMO_ENTRY
    loadSelectedIntoEditor()
    persist()
    scheduleRender()
  } catch (e) {
    window.alert(String(e))
  }
}

function onReset() {
  if (!window.confirm('Reset to demo? This overwrites localStorage.')) return
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
  fs.value = resetToDemo(localStorage)
  selectedPath.value = DEMO_ENTRY
  loadSelectedIntoEditor()
  bumpTree()
  void (async () => {
    const seq = ++renderSeq
    await renderSrcTreeToOut(fs.value, '/src', FIXED_CONTEXT)
    if (seq !== renderSeq) return
    persist()
    await runRender(DEMO_ENTRY)
  })()
}

if (import.meta.client) {
  loadSelectedIntoEditor()
  scheduleRender()
}

onBeforeUnmount(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
})
</script>

<template>
  <div class="playground-root shell">
    <div class="shell__toolbar">
      <p class="shell__hint">Virtual FS · auto-render (300ms)</p>
      <button type="button" class="reset" @click="onReset">
        Reset to demo
      </button>
    </div>

    <div
      ref="bodyRef"
      class="shell__body"
      :style="{ gridTemplateColumns }"
    >
      <FilerPane
        class="pane-filer"
        :src-tree="srcTree"
        :out-tree="outTree"
        :selected-path="selectedPath"
        @select="onSelect"
        @create-file="onCreateFile"
        @create-folder="onCreateFolder"
        @rename="onRename"
        @remove="onRemove"
      />

      <div
        class="playground-separator"
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize sidebar"
        @pointerdown.prevent="startResize('sidebar', $event)"
      />

      <main class="pane-editor">
        <div class="pane-editor__path">
          {{ selectedPath ?? '(none)' }}
          <span v-if="editorReadOnly" class="muted">read-only</span>
        </div>
        <CodeEditor
          :model-value="editorText"
          :read-only="editorReadOnly"
          @update:model-value="onEditorUpdate"
        />
      </main>

      <div
        class="playground-separator"
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize editor"
        @pointerdown.prevent="startResize('editor', $event)"
      />

      <div class="pane-right">
        <PreviewPane :markdown="previewMarkdown" />
        <DiagnosticsPanel :diagnostics="diagnostics" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.shell {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.shell__toolbar {
  height: var(--header-h);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0 1rem;
  border-bottom: 1px solid var(--line);
  background: color-mix(in srgb, var(--bg-panel) 75%, transparent);
  backdrop-filter: blur(6px);
  flex-shrink: 0;
}

.shell__hint {
  margin: 0;
  font-size: 0.78rem;
  color: var(--ink-muted);
}

.reset {
  border: 1px solid var(--line);
  background: var(--accent);
  color: #f4fbfb;
  padding: 0.35rem 0.75rem;
  font-size: 0.8rem;
  font-weight: 500;
}

.reset:hover {
  filter: brightness(1.05);
}

.shell__body {
  flex: 1;
  display: grid;
  min-height: 0;
}

.pane-editor {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

.pane-editor__path {
  padding: 0.4rem 0.75rem;
  font-family: var(--mono);
  font-size: 0.72rem;
  color: var(--ink-muted);
  border-bottom: 1px solid var(--line);
  background: color-mix(in srgb, var(--bg-deep) 55%, white);
  display: flex;
  gap: 0.5rem;
}

html[data-theme='dark'] .pane-editor__path {
  background: color-mix(in srgb, var(--bg-deep) 55%, black);
}

.muted {
  color: var(--warn);
}

.pane-editor :deep(.editor) {
  flex: 1;
  min-height: 0;
}

.pane-right {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

.pane-right :deep(.preview) {
  flex: 1;
  min-height: 0;
  border-left: 0;
}

@media (max-width: 900px) {
  .shell__body {
    grid-template-columns: 1fr !important;
    grid-template-rows: 180px minmax(220px, 1fr) minmax(220px, 1fr);
  }

  .playground-separator {
    display: none;
  }

  .pane-filer {
    border-right: 0;
    border-bottom: 1px solid var(--line);
  }
}
</style>
