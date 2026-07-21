# Documentation site (v0.10.0-docs.5+)

Nuxt Content site for **@b4moss/hyogen-md**. Spec: [`dev-docs/docs-site.md`](../dev-docs/docs-site.md).

## Commands

```bash
npm install
npm run dev      # http://localhost:3000
npm run generate # static output → .output/public
```

## Structure

- `content/` — English (`/`) and Japanese (`/ja`) markdown
- `pages/` — routing (content pages + `/playground` placeholder)
- `composables/useSiteTheme.ts` — light / dark / system theme
- `composables/useDocsLocale.ts` — EN / JA path helpers
