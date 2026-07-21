<script setup lang="ts">
import { provide, ref } from "vue";
import type { TreeNode } from "../fs/virtualFs";
import FilerTree from "./FilerTree.vue";
import NodeActionMenu, { NODE_ACTION_MENU_OPEN_ID } from "./NodeActionMenu.vue";

defineProps<{
  srcTree: TreeNode[];
  outTree: TreeNode[];
  selectedPath: string | null;
}>();

defineEmits<{
  select: [path: string];
  createFile: [parentPath: string];
  createFolder: [parentPath: string];
  rename: [path: string];
  remove: [path: string];
}>();

/** Only one NodeActionMenu open under this pane (src-root + tree). */
provide(NODE_ACTION_MENU_OPEN_ID, ref<string | null>(null));
</script>

<template>
  <aside class="filer">
    <section class="filer__section">
      <div class="filer__heading">
        <h2>src</h2>
        <NodeActionMenu
          kind="src-root"
          path="/src"
          parent-path="/src"
          @create-file="$emit('createFile', $event)"
          @create-folder="$emit('createFolder', $event)"
        />
      </div>
      <FilerTree
        :nodes="srcTree"
        :selected-path="selectedPath"
        mutable
        @select="$emit('select', $event)"
        @create-file="$emit('createFile', $event)"
        @create-folder="$emit('createFolder', $event)"
        @rename="$emit('rename', $event)"
        @remove="$emit('remove', $event)"
      />
    </section>

    <section class="filer__section">
      <h2>out <span class="readonly">read-only</span></h2>
      <div class="filer__out">
        <FilerTree
          :nodes="outTree"
          :selected-path="selectedPath"
          @select="$emit('select', $event)"
        />
      </div>
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

.filer__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.35rem;
  margin-bottom: 0.35rem;
}

.filer__heading h2,
.filer__section > h2 {
  margin: 0;
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink-muted);
  font-weight: 600;
}

.filer__section > h2 {
  margin-bottom: 0.35rem;
}

.filer__out {
  overflow: auto;
  padding: 0.5rem 0.55rem;
  margin-inline: 0.2rem;
  background: #d8e0e6;
  color: color-mix(in srgb, var(--ink) 88%, var(--ink-muted));
  font-size: 0.95em;
}

.filer__out :deep(.tree__item) {
  font-size: 0.74rem;
  color: inherit;
}

.filer__out :deep(.tree__icon) {
  opacity: 0.85;
}

.readonly {
  text-transform: none;
  letter-spacing: 0;
  font-weight: 400;
  opacity: 0.8;
}
</style>
