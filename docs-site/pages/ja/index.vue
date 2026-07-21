<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { data: page } = await useAsyncData('docs-ja-index', () =>
  queryContent('/ja').findOne(),
)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}
</script>

<template>
  <article
    v-if="page"
    class="docs-content"
  >
    <ContentRenderer :value="page" />
  </article>
</template>
