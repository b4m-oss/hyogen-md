---
title: Loader
description: Resolve include, component, and extend paths to source text.
---

# Loader

A loader resolves paths referenced by `include`, `component`, and `extend` directives to source strings.

```ts
type Loader = (path: string) => Promise<string>
```

## When you need one

| Environment | Default | Requirement |
|-------------|---------|-------------|
| Node (`renderServer`, `build`) | `createNodeLoader()` | Optional — used automatically |
| Browser (`renderClient`) | none | **Required** — you provide the loader |

Load failures throw `HyogenError` with code `file_not_found` or `load_failed`.

## createNodeLoader

Full Node loader — local file system plus remote `https://` fetch.

```ts
import { createNodeLoader } from '@b4moss/hyogen-md'

const loader = createNodeLoader({
  from: './page.md',       // parent path for error messages
  via: 'include',          // 'include' | 'component' | 'extend'
})
```

`renderServer` and `build` use this by default when you omit `options.loader`.

## createFsLoader

File-system only — no remote fetch. Useful when you want to restrict loading to local paths.

```ts
import { createFsLoader } from '@b4moss/hyogen-md'

const loader = createFsLoader({ from: './page.md', via: 'component' })
```

## Custom loader

Any async function that returns source text works:

```ts
const loader: Loader = async (path) => {
  if (path.startsWith('https://')) {
    const res = await fetch(path)
    return res.text()
  }
  return await readFile(path, 'utf8')
}
```

In the browser, map virtual paths to bundled or fetched content:

```ts
const loader = async (path: string) => {
  const mod = await import(`./templates/${path}?raw`)
  return mod.default
}
```

## isRemotePath

```ts
import { isRemotePath } from '@b4moss/hyogen-md'

isRemotePath('https://example.com/partial.md') // true
isRemotePath('./partials/header.md')           // false
```

## Related

- [renderClient](/api/render-client) — loader is mandatory
- [Includes and components](/syntax/includes)
- [Paths and security](/syntax/paths-and-security)
