<script setup lang="ts">
import type { ThemePreference } from '../composables/useSiteTheme'

const { preference, setPreference } = useSiteTheme()

const options: { value: ThemePreference; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]
</script>

<template>
  <div
    class="theme-toggle"
    role="group"
    aria-label="Theme"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      :class="{ 'is-active': preference === option.value }"
      :aria-pressed="preference === option.value"
      @click="setPreference(option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>
