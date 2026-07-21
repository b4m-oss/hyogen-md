<script setup lang="ts">
const { locale, navPath } = useDocsLocale()

const links = computed(() =>
  locale.value === 'ja'
    ? [
        { to: navPath('/'), label: 'ホーム' },
        { to: navPath('/install'), label: 'インストール' },
        { to: '/playground', label: 'Playground' },
      ]
    : [
        { to: navPath('/'), label: 'Home' },
        { to: navPath('/install'), label: 'Install' },
        { to: '/playground', label: 'Playground' },
      ],
)
</script>

<template>
  <header class="site-header">
    <div class="site-header__inner">
      <NuxtLink
        class="site-brand"
        :to="navPath('/')"
      >
        hyogen-md
      </NuxtLink>

      <div class="site-controls">
        <nav
          class="site-nav"
          aria-label="Main"
        >
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </div>
  </header>
</template>
