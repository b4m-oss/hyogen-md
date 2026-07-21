---
title: build
description: Batch static site generation with glob input and dependency walking.
---

# build

Generates rendered Markdown files for many entries at once. Designed for SSG workflows.

```ts
import { build } from '@b4moss/hyogen-md'

function build(options: BuildOptions): Promise<BuildResult>
```

## Options

```ts
type BuildOptions = RenderOptions & {
  input: string | string[]   // file paths or globs
  outDir: string             // output directory
  includeUnderscoreEntries?: boolean
  context?: HyogenContext
  serverContext?: HyogenContext
}
```

| Option | Default | Description |
|--------|---------|-------------|
| `input` | — | One or more entry paths or globs (Vite-style, via picomatch / fast-glob) |
| `outDir` | — | Directory for rendered `.md` files |
| `context` | `{}` | Shared template context for all entries |
| `serverContext` | — | Server-only context merged per entry |
| `includeUnderscoreEntries` | `false` | Include `_` partial files as build entries |
| `loader` | `createNodeLoader()` | Custom loader |
| `root` | auto | Project root (`.doc_root` marker) |
| `preserveFrontMatter` | `false` | Keep YAML front matter in output |
| `preserveHgComments` | `false` | Keep `<!-- @hg -->` comments in output |

## Entry discovery

By default, `build`:

1. Matches `input` globs
2. Filters out `_` partials (files or paths under `_` directories) unless `includeUnderscoreEntries` is `true`
3. Walks `include` / `component` / `extend` dependencies from each entry

Explicitly listed paths in `input` override the `_` partial filter.

## Example

```ts
import { build } from '@b4moss/hyogen-md'

const { files, warnings } = await build({
  input: 'content/**/*.md',
  outDir: 'dist/content',
  context: { siteName: 'My Docs' },
  serverContext: { buildTime: Date.now() },
})

for (const file of files) {
  console.log(file.path, file.markdown.length)
}
```

## Return value

```ts
type BuildResult = {
  files: { path: string; markdown: string }[]
  warnings: HyogenWarning[]
}
```

Files are also written to `outDir`. The `files` array lets you consume output in-process without reading disk.

## Related

- [renderServer](/api/render-server)
- [Loader](/api/loader)
- [Paths and security](/syntax/paths-and-security) — `_` partials and `.doc_root`
