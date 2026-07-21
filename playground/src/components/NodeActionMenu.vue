<script lang="ts">
/** Shared among all menus under FilerPane — only one path may be open. */
export const NODE_ACTION_MENU_OPEN_ID = "nodeActionMenuOpenId";
</script>

<script setup lang="ts">
import {
  computed,
  inject,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type Ref,
} from "vue";
import type { MenuItemId } from "../editor/menuItemsForNode";
import { menuItemsForNode, type MenuNodeKind } from "../editor/menuItemsForNode";

const props = defineProps<{
  kind: MenuNodeKind;
  path: string;
  /** Parent directory for new-file / new-folder (defaults to path for dirs / src-root). */
  parentPath?: string;
}>();

const emit = defineEmits<{
  createFile: [parentPath: string];
  createFolder: [parentPath: string];
  rename: [path: string];
  remove: [path: string];
}>();

const sharedOpenId = inject<Ref<string | null> | null>(NODE_ACTION_MENU_OPEN_ID, null);
const localOpen = ref(false);
const rootEl = ref<HTMLElement | null>(null);

const open = computed({
  get() {
    if (sharedOpenId) return sharedOpenId.value === props.path;
    return localOpen.value;
  },
  set(value: boolean) {
    if (sharedOpenId) {
      if (value) sharedOpenId.value = props.path;
      else if (sharedOpenId.value === props.path) sharedOpenId.value = null;
    } else {
      localOpen.value = value;
    }
  },
});

const items = computed(() => menuItemsForNode(props.kind, props.path));

const labels: Record<MenuItemId, string> = {
  "new-file": "New file",
  "new-folder": "New folder",
  rename: "Rename",
  delete: "Delete",
};

function createParent(): string {
  if (props.parentPath) return props.parentPath;
  if (props.kind === "file") {
    const i = props.path.lastIndexOf("/");
    return i > 0 ? props.path.slice(0, i) : "/src";
  }
  return props.path;
}

function onItem(id: MenuItemId) {
  open.value = false;
  if (id === "new-file") emit("createFile", createParent());
  else if (id === "new-folder") emit("createFolder", createParent());
  else if (id === "rename") emit("rename", props.path);
  else if (id === "delete") emit("remove", props.path);
}

function onDocClick(e: MouseEvent) {
  if (!open.value || !rootEl.value) return;
  if (!rootEl.value.contains(e.target as Node)) open.value = false;
}

function onDocKeydown(e: KeyboardEvent) {
  if (e.key === "Escape" && open.value) open.value = false;
}

onMounted(() => {
  document.addEventListener("click", onDocClick);
  document.addEventListener("keydown", onDocKeydown);
});
onBeforeUnmount(() => {
  document.removeEventListener("click", onDocClick);
  document.removeEventListener("keydown", onDocKeydown);
});

watch(
  () => props.path,
  () => {
    open.value = false;
  },
);
</script>

<template>
  <div v-if="items.length" ref="rootEl" class="node-menu">
    <button
      type="button"
      class="node-menu__trigger"
      title="Actions"
      aria-haspopup="menu"
      :aria-expanded="open"
      @click.stop="open = !open"
    >
      ⋮
    </button>
    <ul v-if="open" class="node-menu__list" role="menu">
      <li v-for="id in items" :key="id" role="none">
        <button
          type="button"
          class="node-menu__item"
          role="menuitem"
          @click.stop="onItem(id)"
        >
          {{ labels[id] }}
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.node-menu {
  position: relative;
  flex-shrink: 0;
}

.node-menu__trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 1.5rem;
  height: 1.5rem;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--ink-muted);
  font-size: 1rem;
  line-height: 1;
  border-radius: 2px;
  cursor: pointer;
}

.node-menu__trigger:hover {
  background: var(--accent-soft);
  color: var(--accent);
}

.node-menu__list {
  position: absolute;
  right: 0;
  top: 100%;
  z-index: 20;
  margin: 0.15rem 0 0;
  padding: 0.25rem 0;
  list-style: none;
  min-width: 8.5rem;
  background: var(--bg-panel);
  border: 1px solid var(--line);
  box-shadow: 0 4px 14px color-mix(in srgb, var(--ink) 12%, transparent);
}

.node-menu__item {
  display: block;
  width: 100%;
  text-align: left;
  border: 0;
  background: transparent;
  padding: 0.3rem 0.65rem;
  font-size: 0.78rem;
  color: var(--ink);
  cursor: pointer;
}

.node-menu__item:hover {
  background: var(--accent-soft);
  color: var(--accent);
}
</style>
