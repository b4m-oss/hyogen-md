<template>
  <div class="playground-layout">
    <SiteHeader />
    <div class="playground-layout__body">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.playground-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.playground-layout__body {
  flex: 1;
  min-height: 0;
}
</style>
