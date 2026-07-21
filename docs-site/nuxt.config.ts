import path from 'node:path'
import { fileURLToPath } from 'node:url'
import inject from '@rollup/plugin-inject'

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const appSrc = path.resolve(rootDir, '../app/src')

export default defineNuxtConfig({
  modules: ['@nuxt/content'],
  content: {
    markdown: {
      mdc: false,
    },
  },
  devtools: { enabled: true },
  compatibilityDate: '2024-04-03',
  css: ['~/assets/css/main.css', '~/assets/css/playground.css'],
  routeRules: {
    '/playground': { ssr: false },
  },
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
  vite: {
    plugins: [
      inject({
        Buffer: ['buffer', 'Buffer'],
      }),
    ],
    resolve: {
      alias: {
        '@b4moss/hyogen-md/client': path.join(appSrc, 'client.ts'),
        '@b4moss/hyogen-md': path.join(appSrc, 'index.ts'),
        'node:path': 'path-browserify',
        'node:fs': path.join(appSrc, 'shims/fs-browser.ts'),
        'node:fs/promises': path.join(appSrc, 'shims/fs-promises-browser.ts'),
        buffer: path.resolve(rootDir, 'node_modules/buffer/index.js'),
      },
    },
    define: {
      global: 'globalThis',
    },
    optimizeDeps: {
      include: ['buffer', 'yaml', 'path-browserify'],
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
      },
    },
    server: {
      fs: {
        allow: [rootDir, appSrc],
      },
    },
  },
})
