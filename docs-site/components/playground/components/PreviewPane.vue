<script setup lang="ts">
import { computed, ref } from "vue";
import { marked } from "marked";
import { highlightMarkdown } from "../preview/highlightMarkdown";

const props = defineProps<{
  markdown: string;
}>();

const tab = ref<"markdown" | "preview">("preview");

const html = computed(() => {
  try {
    return marked.parse(props.markdown || "", { async: false }) as string;
  } catch {
    return "<p><em>Failed to render HTML preview</em></p>";
  }
});

const highlightedMarkdown = computed(() => highlightMarkdown(props.markdown || ""));
</script>

<template>
  <section class="preview">
    <div class="preview__tabs" role="tablist">
      <button
        type="button"
        role="tab"
        :aria-selected="tab === 'markdown'"
        :class="{ active: tab === 'markdown' }"
        @click="tab = 'markdown'"
      >
        Markdown
      </button>
      <button
        type="button"
        role="tab"
        :aria-selected="tab === 'preview'"
        :class="{ active: tab === 'preview' }"
        @click="tab = 'preview'"
      >
        Preview
      </button>
    </div>
    <pre
      v-if="tab === 'markdown'"
      class="preview__md hljs"
      v-html="highlightedMarkdown"
    />
    <div v-else class="preview__html" v-html="html" />
  </section>
</template>

<style scoped>
.preview {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-panel);
  border-left: 1px solid var(--line);
}

.preview__tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--line);
  background: color-mix(in srgb, var(--bg-deep) 70%, white);
}

.preview__tabs button {
  border: 0;
  background: transparent;
  padding: 0.55rem 0.9rem;
  color: var(--ink-muted);
  font-size: 0.82rem;
  border-bottom: 2px solid transparent;
}

.preview__tabs button.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
  font-weight: 600;
}

.preview__md {
  margin: 0;
  padding: 1rem;
  overflow: auto;
  flex: 1;
  font-family: var(--mono);
  font-size: 0.78rem;
  white-space: pre-wrap;
  word-break: break-word;
  background: transparent;
  color: var(--ink);
}

/* highlight.js markdown tokens — aligned with playground palette */
.preview__md :deep(.hljs-section) {
  color: var(--accent);
  font-weight: 600;
}

.preview__md :deep(.hljs-strong) {
  color: var(--ink);
  font-weight: 700;
}

.preview__md :deep(.hljs-emphasis) {
  color: var(--ink);
  font-style: italic;
}

.preview__md :deep(.hljs-bullet),
.preview__md :deep(.hljs-symbol) {
  color: var(--ink-muted);
}

.preview__md :deep(.hljs-link),
.preview__md :deep(.hljs-string) {
  color: #0a5f8c;
}

.preview__md :deep(.hljs-quote) {
  color: var(--ink-muted);
  font-style: italic;
}

.preview__md :deep(.hljs-code),
.preview__md :deep(.hljs-literal) {
  color: #6b3d7a;
}

.preview__md :deep(.hljs-comment) {
  color: var(--ink-muted);
}

.preview__html {
  padding: 1rem 1.1rem;
  overflow: auto;
  flex: 1;
  line-height: 1.55;
}

.preview__html :deep(h1),
.preview__html :deep(h2),
.preview__html :deep(h3) {
  margin: 0.6em 0 0.35em;
  line-height: 1.25;
}

.preview__html :deep(p),
.preview__html :deep(ul) {
  margin: 0.4em 0;
}

.preview__html :deep(code) {
  font-family: var(--mono);
  font-size: 0.9em;
  background: var(--accent-soft);
  padding: 0.05em 0.3em;
}
</style>
