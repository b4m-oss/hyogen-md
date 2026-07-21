---
title: renderServer
description: Server-side rendering entry for SSR and SSG.
---

# renderServer

Renders a hyogen.md source string or file on the server. Use this for SSR, one-off server renders, and as the engine behind `build`.

```ts
import { renderServer } from '@b4moss/hyogen-md'

function renderServer(
  input: string | { path: string },
  context?: HyogenContext,
  options?: ServerRenderOptions,
): Promise<RenderResult>
```

## Arguments

| Argument | Description |
|----------|-------------|
| `input` | Source string, or `{ path }` to load via the loader |
| `context` | Template variables available in `{{ }}` and `@hg` blocks |
| `options` | Loader, root, output preservation, and `serverContext` |

## serverContext

Pass server-only data through `options.serverContext`. It is merged into the render context but is kept separate at the API level so you do not accidentally expose secrets to client bundles.

```ts
await renderServer('./page.md', { title: 'Docs' }, {
  serverContext: { secretToken: process.env.TOKEN },
})
```

`renderClient` rejects `serverContext` with error `server_context_on_client`.

## Default loader

When `options.loader` is omitted, `createNodeLoader()` is used — local file reads plus remote `https://` URLs on Node.

## Example

```ts
const source = `
---
title: Hello
---

# {{ title }} {{ name }}
`

const { markdown, warnings } = await renderServer(source, { name: 'world' })

// warnings is an array of non-fatal HyogenWarning objects
console.log(markdown)
```

## Return value

```ts
type RenderResult = {
  markdown: string   // rendered Markdown
  warnings: HyogenWarning[]
}
```

Fatal problems throw a `HyogenError` instead of returning. See [Diagnostics](/api/diagnostics) and [Error codes](/api/error-codes).

## Related

- [renderClient](/api/render-client) — browser entry
- [Types and options](/api/types-and-options)
- [Loader](/api/loader)
