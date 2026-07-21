---
title: Install
description: Install @b4moss/hyogen-md and render your first template.
---

# Install

```bash
npm install @b4moss/hyogen-md
```

The package ships two entry points:

| Entry | Use case |
|-------|----------|
| `@b4moss/hyogen-md` | Node — SSR, SSG, and server rendering (`renderServer`, `build`, loaders) |
| `@b4moss/hyogen-md/client` | Browser — client-side rendering (`renderClient`) |

## Quick start (server)

Use `renderServer` when you run on Node (SSR or SSG). A default file-system loader is used when you omit `options.loader`.

```ts
import { renderServer } from '@b4moss/hyogen-md'

const { markdown, warnings } = await renderServer(
  '# Hello {{ name }}',
  { name: 'world' },
)

console.log(markdown)
// # Hello world
```

Render a file by path:

```ts
const result = await renderServer({ path: './pages/index.md' }, {
  title: 'My site',
})
```

Pass secrets only through `serverContext` — they are merged into the render context on the server but must never be sent to the client bundle:

```ts
await renderServer('./page.md', { title: 'Public' }, {
  serverContext: { apiKey: process.env.API_KEY },
})
```

## Quick start (client)

Use `renderClient` in the browser. You **must** provide a `loader` that returns source text for each path. The library does not fetch files on its own in the browser.

```ts
import { renderClient } from '@b4moss/hyogen-md/client'

const files: Record<string, string> = {
  'index.md': '# Hello {{ name }}',
}

const loader = async (path: string) => {
  const source = files[path]
  if (!source) throw new Error(`missing: ${path}`)
  return source
}

const { markdown } = await renderClient(
  { path: 'index.md' },
  { name: 'world' },
  { loader },
)
```

## Next steps

- [API reference](/api) — `renderServer`, `renderClient`, `build`, loaders, diagnostics
- [Template syntax](/syntax) — `{{ }}`, `@hg` blocks, includes, components
- [Playground](/playground) — try templates in the browser
