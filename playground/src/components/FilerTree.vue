<script setup lang="ts">
import type { TreeNode } from "../fs/virtualFs";
import NodeActionMenu from "./NodeActionMenu.vue";

defineOptions({ name: "FilerTree" });

defineProps<{
  nodes: TreeNode[];
  selectedPath: string | null;
  /** When true, show mutate ⋯ menus (SRC only). */
  mutable?: boolean;
  depth?: number;
}>();

defineEmits<{
  select: [path: string];
  createFile: [parentPath: string];
  createFolder: [parentPath: string];
  rename: [path: string];
  remove: [path: string];
}>();
</script>

<template>
  <ul class="tree">
    <li v-for="node in nodes" :key="node.path" class="tree__row-wrap">
      <div class="tree__row">
        <button
          type="button"
          class="tree__item"
          :class="{
            'is-dir': node.type === 'directory',
            'is-file': node.type === 'file',
            'is-selected': selectedPath === node.path,
          }"
          @click="$emit('select', node.path)"
        >
          {{ node.name }}
        </button>
        <NodeActionMenu
          v-if="mutable"
          :kind="node.type === 'directory' ? 'directory' : 'file'"
          :path="node.path"
          @create-file="$emit('createFile', $event)"
          @create-folder="$emit('createFolder', $event)"
          @rename="$emit('rename', $event)"
          @remove="$emit('remove', $event)"
        />
      </div>
      <FilerTree
        v-if="node.type === 'directory' && node.children?.length"
        :nodes="node.children"
        :selected-path="selectedPath"
        :mutable="mutable"
        :depth="(depth ?? 0) + 1"
        @select="$emit('select', $event)"
        @create-file="$emit('createFile', $event)"
        @create-folder="$emit('createFolder', $event)"
        @rename="$emit('rename', $event)"
        @remove="$emit('remove', $event)"
      />
    </li>
  </ul>
</template>

<style scoped>
.tree {
  list-style: none;
  margin: 0;
  padding: 0;
}

.tree .tree {
  padding-left: 0.85rem;
}

.tree__row {
  display: flex;
  align-items: center;
  gap: 0.15rem;
  min-width: 0;
}

.tree__item {
  flex: 1;
  min-width: 0;
  display: block;
  text-align: left;
  border: 0;
  background: transparent;
  padding: 0.2rem 0.35rem;
  font-family: var(--mono);
  font-size: 0.78rem;
  color: var(--ink);
  border-radius: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tree__item.is-dir {
  font-weight: 500;
}

.tree__item.is-selected {
  background: var(--accent-soft);
  color: var(--accent);
}

.tree__item:hover {
  background: color-mix(in srgb, var(--accent-soft) 55%, transparent);
}
</style>
