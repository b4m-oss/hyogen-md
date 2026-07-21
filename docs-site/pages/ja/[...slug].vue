<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()

const slugParts = computed(() => {
  const slug = route.params.slug
  return Array.isArray(slug) ? slug : slug ? [slug] : []
})

const contentPath = computed(() => slugToContentPath(slugParts.value, 'ja'))

const { data: page } = await useAsyncData(
  () => (contentPath.value ? `docs-ja-${contentPath.value}` : 'docs-ja-skip'),
  () => (contentPath.value ? queryContent(contentPath.value).findOne() : Promise.resolve(null)),
)

if (contentPath.value && !page.value) {
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
