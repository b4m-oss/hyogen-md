<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { locale } = useDocsLocale()
</script>

<template>
  <article class="docs-content">
    <h1>Playground</h1>
    <p v-if="locale === 'ja'">
      Playground は v0.10.0-docs.6 でこのサイトへ移植されます。
    </p>
    <p v-else>
      The Playground will be integrated into this site in v0.10.0-docs.6.
    </p>
  </article>
</template>
