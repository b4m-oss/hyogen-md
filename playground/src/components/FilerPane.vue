<script setup lang="ts">
import { computed } from "vue";
import type { TreeNode } from "../fs/virtualFs";
import FilerTree from "./FilerTree.vue";

const props = defineProps<{
  srcTree: TreeNode[];
  outTree: TreeNode[];
  selectedPath: string | null;
}>();

const emit = defineEmits<{
  select: [path: string];
  createFile: [];
  createFolder: [];
  rename: [];
  remove: [];
}>();

const selectedIsSrc = computed(
  () => props.selectedPath != null && props.selectedPath.startsWith("/src/"),
);
</script>

<template>
  <aside class="filer">
    <div class="filer__actions">
      <button type="button" title="New file" @click="emit('createFile')">+ file</button>
      <button type="button" title="New folder" @click="emit('createFolder')">+ folder</button>
      <button
        type="button"
        title="Rename"
        :disabled="!selectedIsSrc"
        @click="emit('rename')"
      >
        rename
      </button>
      <button
        type="button"
        title="Delete"
        :disabled="!selectedIsSrc"
        @click="emit('remove')"
      >
        delete
      </button>
    </div>

    <section class="filer__section">
      <h2>src</h2>
      <FilerTree
        :nodes="srcTree"
        :selected-path="selectedPath"
        @select="emit('select', $event)"
      />
    </section>

    <section class="filer__section">
      <h2>out <span class="readonly">read-only</span></h2>
      <FilerTree
        :nodes="outTree"
        :selected-path="selectedPath"
        @select="emit('select', $event)"
      />
    </section>
  </aside>
</template>

<style scoped>
.filer {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  height: 100%;
  padding: 0.75rem;
  overflow: auto;
  background: color-mix(in srgb, var(--bg-panel) 88%, white);
  border-right: 1px solid var(--line);
}

.filer__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.filer__actions button {
  border: 1px solid var(--line);
  background: var(--bg-deep);
  color: var(--ink);
  padding: 0.2rem 0.45rem;
  font-size: 0.75rem;
}

.filer__section h2 {
  margin: 0 0 0.35rem;
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink-muted);
  font-weight: 600;
}

.readonly {
  text-transform: none;
  letter-spacing: 0;
  font-weight: 400;
  opacity: 0.8;
}
</style>
