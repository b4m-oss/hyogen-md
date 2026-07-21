<script setup lang="ts">
import type { DiagnosticsView } from "../render/toDiagnosticsView";

defineProps<{
  diagnostics: DiagnosticsView;
}>();
</script>

<template>
  <section
    class="diag"
    :class="{
      'is-error': !diagnostics.ok,
      'is-warn': diagnostics.ok && !diagnostics.note && diagnostics.warnings.length,
      'is-note': diagnostics.ok && !!diagnostics.note,
    }"
  >
    <header>
      <strong>Diagnostics</strong>
      <span
        v-if="diagnostics.ok && !diagnostics.note && !diagnostics.warnings.length"
        class="ok"
      >ok</span>
      <span v-else-if="!diagnostics.ok" class="err">error</span>
      <span v-else-if="diagnostics.note" class="note">note</span>
      <span v-else class="warn">{{ diagnostics.warnings.length }} warning(s)</span>
    </header>

    <div v-if="diagnostics.error" class="diag__error">
      <code>{{ diagnostics.error.code }}</code>
      <p>{{ diagnostics.error.message }}</p>
      <p v-if="diagnostics.error.path" class="path">{{ diagnostics.error.path }}</p>
    </div>

    <div v-else-if="diagnostics.note" class="diag__note">
      <code>{{ diagnostics.note.code }}</code>
      <p>{{ diagnostics.note.message }}</p>
      <p v-if="diagnostics.note.path" class="path">{{ diagnostics.note.path }}</p>
    </div>

    <ul v-if="diagnostics.warnings.length" class="diag__warns">
      <li v-for="(w, i) in diagnostics.warnings" :key="i">
        <code>{{ w.code }}</code> {{ w.message }}
      </li>
    </ul>
  </section>
</template>

<style scoped>
.diag {
  border-top: 1px solid var(--line);
  background: color-mix(in srgb, var(--bg-panel) 90%, white);
  padding: 0.55rem 0.85rem;
  height: var(--diag-h);
  overflow: auto;
}

.diag.is-error {
  background: var(--danger-soft);
  border-top-color: color-mix(in srgb, var(--danger) 45%, var(--line));
}

.diag.is-warn {
  background: var(--warn-soft);
}

.diag.is-note {
  background: color-mix(in srgb, var(--bg-deep) 35%, var(--bg-panel));
  border-top-color: color-mix(in srgb, var(--ink-muted) 35%, var(--line));
}

header {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  margin-bottom: 0.35rem;
  font-size: 0.78rem;
}

.ok {
  color: var(--accent);
}

.err {
  color: var(--danger);
  font-weight: 600;
}

.warn {
  color: var(--warn);
  font-weight: 600;
}

.note {
  color: var(--ink-muted);
  font-weight: 600;
}

.diag__error p,
.diag__note p {
  margin: 0.25rem 0 0;
  font-size: 0.85rem;
}

.diag__note {
  color: var(--ink-muted);
}

.diag__error .path,
.diag__error code,
.diag__note .path,
.diag__note code,
.diag__warns code {
  font-family: var(--mono);
  font-size: 0.78rem;
}

.diag__warns {
  margin: 0;
  padding-left: 1.1rem;
  font-size: 0.82rem;
}
</style>
