---
title: renderClient
description: Client-side rendering entry for CSR with a custom loader.
---

# renderClient

Renders hyogen.md in the browser. Import from `@b4moss/hyogen-md/client` — this entry excludes Node file-system code.

```ts
import { renderClient } from '@b4moss/hyogen-md/client'

function renderClient(
  input: string | { path: string },
  context?: HyogenContext,
  options?: RenderOptions,
): Promise<RenderResult>
```

## Loader required

The library does not read the file system or fetch URLs in the browser. You **must** pass `options.loader`.

```ts
const loader = async (path: string) => {
  const res = await fetch(`/templates/${path}`)
  if (!res.ok) throw new Error(`not found: ${path}`)
  return res.text()
}

const { markdown } = await renderClient(
  { path: 'page.md' },
  { title: 'Home' },
  { loader },
)
```

Cross-origin fetches are not supported by the library itself — your loader must serve same-origin paths.

## Inline source

Pass a string directly when you already have the source:

```ts
const { markdown } = await renderClient(
  '# {{ title }}',
  { title: 'Preview' },
  { loader: async () => '' }, // still required, unused for string input
)
```

## serverContext is rejected

```ts
// throws HyogenError { code: 'server_context_on_client' }
await renderClient(source, {}, { serverContext: { secret: 'x' } })
```

Use `renderServer` or `build` for server-only context.

## Example (virtual file map)

```ts
import { renderClient } from '@b4moss/hyogen-md/client'

const vfs: Record<string, string> = {
  'index.md': '# {{ greeting }}',
  '_partials/header.md': '## Site header',
}

const loader = async (path: string) => {
  const text = vfs[path]
  if (text === undefined) throw new Error(path)
  return text
}

const result = await renderClient('index.md', { greeting: 'Hi' }, { loader })
```

## Related

- [renderServer](/api/render-server)
- [Loader](/api/loader)
- [Paths and security](/syntax/paths-and-security)
