---
title: Types and Options
description: HyogenContext, RenderOptions, BuildOptions, and result types.
---

# Types and Options

## HyogenContext

```ts
type HyogenContext = Record<string, unknown>
```

Plain object of template variables. Passed as the second argument to `renderServer` / `renderClient`, or via `build({ context })`.

Bindings follow last-write-wins scoping: front matter, `@hg` declarations, and component props can override earlier values. See [Front matter](/syntax/front-matter).

## RenderOptions

Shared by `renderServer`, `renderClient`, and `build`.

```ts
type RenderOptions = {
  preserveFrontMatter?: boolean   // default: false
  preserveHgComments?: boolean    // default: false
  loader?: Loader
  root?: string
  path?: string
  constrainToRoot?: boolean
}
```

| Option | Default | Description |
|--------|---------|-------------|
| `preserveFrontMatter` | `false` | Keep YAML front matter in output Markdown |
| `preserveHgComments` | `false` | Keep `<!-- @hg -->` blocks in output (debugging) |
| `loader` | Node default | Custom path resolver |
| `root` | from `.doc_root` | Project root directory |
| `path` | entry path | Source file path for diagnostics |
| `constrainToRoot` | from `.doc_root` | Restrict file access to root |

## ServerRenderOptions

```ts
type ServerRenderOptions = RenderOptions & {
  serverContext?: HyogenContext
}
```

Only for `renderServer`. Merged into the render context on the server. Not available on `renderClient`.

## BuildOptions

```ts
type BuildOptions = RenderOptions & {
  input: string | string[]
  outDir: string
  includeUnderscoreEntries?: boolean
  context?: HyogenContext
  serverContext?: HyogenContext
}
```

See [build](/api/build).

## RenderResult

```ts
type RenderResult = {
  markdown: string
  warnings: HyogenWarning[]
}
```

## BuildResult

```ts
type BuildResult = {
  files: { path: string; markdown: string }[]
  warnings: HyogenWarning[]
}
```

## Loader

```ts
type Loader = (path: string) => Promise<string>
```

See [Loader](/api/loader).

## Input shapes

Both render functions accept:

```ts
// inline source
renderServer('# {{ title }}', { title: 'Hi' })

// file path (loaded via loader)
renderServer({ path: './pages/index.md' }, { title: 'Hi' })
```
