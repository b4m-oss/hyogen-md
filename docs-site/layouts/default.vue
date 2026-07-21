<template>
  <div class="site-shell">
    <SiteHeader />
    <main class="site-main">
      <slot />
    </main>
    <footer class="site-footer">
      <div class="site-footer__inner">
        <span>@b4moss/hyogen-md</span>
        <span>
          <a
            href="https://www.npmjs.com/package/@b4moss/hyogen-md"
            target="_blank"
            rel="noopener noreferrer"
          >npm</a>
          ·
          <a
            href="https://github.com/b4m-oss/hyogen-md"
            target="_blank"
            rel="noopener noreferrer"
          >GitHub</a>
        </span>
      </div>
    </footer>
  </div>
</template>
