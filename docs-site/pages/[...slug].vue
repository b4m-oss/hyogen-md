<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()

const slugParts = computed(() => {
  const slug = route.params.slug
  return Array.isArray(slug) ? slug : slug ? [slug] : []
})

const contentPath = computed(() => slugToContentPath(slugParts.value, 'en'))

const { data: page } = await useAsyncData(
  () => (contentPath.value ? `docs-en-${contentPath.value}` : 'docs-en-skip'),
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
