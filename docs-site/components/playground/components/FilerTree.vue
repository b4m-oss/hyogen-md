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
          <span class="tree__icon" aria-hidden="true">
            <svg
              v-if="node.type === 'directory'"
              class="tree__glyph"
              viewBox="0 0 16 16"
              width="14"
              height="14"
            >
              <path
                fill="currentColor"
                d="M1.75 3.75A1.25 1.25 0 0 1 3 2.5h3.1c.3 0 .59.11.81.31L8.1 4h4.9c.69 0 1.25.56 1.25 1.25v6.5c0 .69-.56 1.25-1.25 1.25H3c-.69 0-1.25-.56-1.25-1.25V3.75Z"
              />
            </svg>
            <svg
              v-else
              class="tree__glyph tree__glyph--file"
              viewBox="0 0 16 16"
              width="14"
              height="14"
              fill="none"
            >
              <path
                stroke="currentColor"
                stroke-width="1.25"
                stroke-linejoin="round"
                d="M4.25 2.25h4.44L12.75 6.3v7.45c0 .55-.45 1-1 1h-7.5c-.55 0-1-.45-1-1V3.25c0-.55.45-1 1-1Z"
              />
              <path
                stroke="currentColor"
                stroke-width="1.25"
                stroke-linejoin="round"
                d="M8.5 2.4v3.35c0 .41.34.75.75.75h3.25"
              />
            </svg>
          </span>
          <span class="tree__label"
            >{{ node.name }}{{ node.type === "directory" ? "/" : "" }}</span
          >
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
  display: flex;
  align-items: center;
  gap: 0.35rem;
  text-align: left;
  border: 0;
  background: transparent;
  padding: 0.2rem 0.35rem;
  font-family: var(--mono);
  font-size: 0.78rem;
  color: var(--ink);
  border-radius: 2px;
}

.tree__icon {
  flex: 0 0 auto;
  display: inline-flex;
  color: var(--ink-muted);
  line-height: 0;
}

.tree__glyph--file {
  color: color-mix(in srgb, var(--ink-muted) 55%, white);
}

.tree__item.is-selected .tree__icon {
  color: var(--accent);
}

.tree__item.is-selected .tree__glyph--file {
  color: color-mix(in srgb, var(--accent) 55%, white);
}

.tree__label {
  min-width: 0;
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
