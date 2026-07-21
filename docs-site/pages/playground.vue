<script setup lang="ts">
import PlaygroundApp from '~/components/playground/PlaygroundApp.vue'

definePageMeta({
  layout: 'playground',
})
</script>

<template>
  <ClientOnly>
    <PlaygroundApp />
    <template #fallback>
      <p class="playground-loading">Loading Playground…</p>
    </template>
  </ClientOnly>
</template>

<style scoped>
.playground-loading {
  padding: 2rem;
  color: var(--text-muted);
}
</style>
