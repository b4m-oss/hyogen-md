<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()

const contentPath = computed(() => {
  const slug = route.params.slug
  const parts = Array.isArray(slug) ? slug : slug ? [slug] : []
  const joined = parts.join('/')
  if (joined === 'playground' || joined.startsWith('playground/')) {
    return null
  }
  const suffix = parts.length ? `/${parts.join('/')}` : ''
  return `/ja${suffix}`
})

const { data: page } = await useAsyncData(
  () => (contentPath.value ? `docs-ja-${contentPath.value}` : 'docs-ja-missing'),
  () => (contentPath.value ? queryContent(contentPath.value).findOne() : Promise.resolve(null)),
)

if (!contentPath.value || !page.value) {
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
