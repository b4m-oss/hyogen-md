---
title: 型とオプション
description: 公開型・オプションの要約
---

# 型とオプション

公開されている主要な型の要約です。TypeScript 利用時はパッケージから型を import できます。

```ts
import type {
  HyogenContext,
  HyogenDiagnostic,
  HyogenError,
  HyogenWarning,
  Loader,
  RenderOptions,
  RenderResult,
  ServerRenderOptions,
  BuildOptions,
  BuildResult,
} from '@b4moss/hyogen-md'
```

## HyogenContext

```ts
type HyogenContext = Record<string, unknown>
```

テンプレート変数のマップです。`context`、`serverContext`、front matter、component の props がすべてこの形で束縛されます。

## RenderOptions

```ts
type RenderOptions = {
  preserveFrontMatter?: boolean   // デフォルト: false
  preserveHgComments?: boolean    // デフォルト: false
  loader?: Loader
  root?: string
}
```

| オプション | 説明 |
|-----------|------|
| `preserveFrontMatter` | レンダリング後の Markdown に YAML front matter を残す |
| `preserveHgComments` | `@hg` ブロックの HTML コメントを出力に残す（デバッグ用） |
| `loader` | ファイル読み込み関数 |
| `root` | `.doc_root` の代わりにドキュメントルートを指定 |

## ServerRenderOptions

```ts
type ServerRenderOptions = RenderOptions & {
  serverContext?: HyogenContext
}
```

`renderServer` と `build` のみ `serverContext` を受け取れます。

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

## RenderResult / BuildResult

```ts
type RenderResult = {
  markdown: string
  warnings: HyogenWarning[]
}

type BuildResult = {
  files: { path: string; markdown: string }[]
  warnings: HyogenWarning[]
}
```

## Loader

```ts
type Loader = (path: string) => Promise<string>
```

## 診断型

```ts
type HyogenDiagnostic = {
  code: string
  message: string
  path?: string
  details?: Record<string, unknown>
}

type HyogenWarning = HyogenDiagnostic
type HyogenError = Error & HyogenDiagnostic
```

## デフォルト値まとめ

| 項目 | デフォルト |
|------|----------|
| front matter を出力に残す | OFF |
| hyogen コメントを出力に残す | OFF |
| Node でのリモート include / component | 許可 |
| front matter ソースの上限 | 64 KB |

## 関連

- [renderServer](/ja/api/render-server)
- [build](/ja/api/build)
- [エラーコード](/ja/api/error-codes)
