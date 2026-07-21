// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/content'],
  devtools: { enabled: true },
  compatibilityDate: '2024-04-03',
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'hyogen-md',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Documentation for @b4moss/hyogen-md' },
      ],
      script: [
        {
          key: 'theme-init',
          type: 'text/javascript',
          innerHTML: `(function(){try{var p=localStorage.getItem('hyogen-md-theme')||'system';var d=p==='dark'||(p==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light';}catch(e){}})();`,
        },
      ],
    },
  },
  nitro: {
    preset: 'static',
  },
})
