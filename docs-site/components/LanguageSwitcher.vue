<script setup lang="ts">
import type { DocsLocale } from '../composables/useDocsLocale'

const { locale, switchLocalePath } = useDocsLocale()

const options: { value: DocsLocale; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'ja', label: 'JA' },
]
</script>

<template>
  <div
    class="lang-switcher"
    role="group"
    aria-label="Language"
  >
    <NuxtLink
      v-for="option in options"
      :key="option.value"
      :to="switchLocalePath(option.value)"
      :class="{ 'is-active': locale === option.value }"
    >
      {{ option.label }}
    </NuxtLink>
  </div>
</template>
