<script setup lang="ts">
import type { TreeNode } from "../fs/virtualFs";

defineOptions({ name: "FilerTree" });

defineProps<{
  nodes: TreeNode[];
  selectedPath: string | null;
  depth?: number;
}>();

defineEmits<{
  select: [path: string];
}>();
</script>

<template>
  <ul class="tree">
    <li v-for="node in nodes" :key="node.path">
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
      <FilerTree
        v-if="node.type === 'directory' && node.children?.length"
        :nodes="node.children"
        :selected-path="selectedPath"
        :depth="(depth ?? 0) + 1"
        @select="$emit('select', $event)"
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

.tree__item {
  display: block;
  width: 100%;
  text-align: left;
  border: 0;
  background: transparent;
  padding: 0.2rem 0.35rem;
  font-family: var(--mono);
  font-size: 0.78rem;
  color: var(--ink);
  border-radius: 2px;
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
