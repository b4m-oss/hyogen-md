<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap, lineNumbers, placeholder } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { markdown } from "@codemirror/lang-markdown";

const props = defineProps<{
  modelValue: string;
  readOnly?: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const host = ref<HTMLDivElement | null>(null);
let view: EditorView | null = null;
let applyingExternal = false;

function createState(doc: string) {
  return EditorState.create({
    doc,
    extensions: [
      lineNumbers(),
      history(),
      markdown(),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      placeholder(props.readOnly ? "Select a file" : "Edit markdown…"),
      EditorView.editable.of(!props.readOnly),
      EditorState.readOnly.of(!!props.readOnly),
      EditorView.updateListener.of((update) => {
        if (!update.docChanged || applyingExternal) return;
        emit("update:modelValue", update.state.doc.toString());
      }),
      EditorView.theme({
        "&": {
          height: "100%",
          fontSize: "13px",
          backgroundColor: "transparent",
        },
        ".cm-scroller": {
          fontFamily: "var(--mono)",
          lineHeight: "1.5",
        },
        ".cm-content": {
          caretColor: "var(--accent)",
        },
        "&.cm-focused": {
          outline: "none",
        },
      }),
    ],
  });
}

onMounted(() => {
  if (!host.value) return;
  view = new EditorView({
    state: createState(props.modelValue),
    parent: host.value,
  });
});

watch(
  () => props.modelValue,
  (next) => {
    if (!view) return;
    const current = view.state.doc.toString();
    if (current === next) return;
    applyingExternal = true;
    view.dispatch({
      changes: { from: 0, to: current.length, insert: next },
    });
    applyingExternal = false;
  },
);

watch(
  () => props.readOnly,
  () => {
    if (!view || !host.value) return;
    const doc = view.state.doc.toString();
    view.setState(createState(doc));
  },
);

onBeforeUnmount(() => {
  view?.destroy();
  view = null;
});
</script>

<template>
  <div ref="host" class="editor" />
</template>

<style scoped>
.editor {
  height: 100%;
  overflow: hidden;
  background: var(--bg-panel);
}
</style>
