---
title: build
description: 複数 Markdown ファイルの一括レンダリング（SSG）
---

# build

複数の Markdown ファイルを一括でレンダリングする SSG 向け API です。

```ts
import { build } from '@b4moss/hyogen-md'
```

## シグネチャ

```ts
function build(options: BuildOptions): Promise<BuildResult>
```

## オプション

```ts
type BuildOptions = RenderOptions & {
  input: string | string[]   // エントリパスまたは glob
  outDir: string             // 出力先（呼び出し側が書き込む）
  includeUnderscoreEntries?: boolean
  context?: HyogenContext
  serverContext?: HyogenContext
}
```

| オプション | 説明 |
|-----------|------|
| `input` | ビルド対象。単一パス、配列、または **glob パターン**（picomatch / fast-glob 互換） |
| `outDir` | 出力ディレクトリのパス（ライブラリはファイルを書き込まない。戻り値の `files` を利用） |
| `context` | 全エントリに渡すテンプレート変数 |
| `serverContext` | サーバー専用のテンプレート変数 |
| `loader` | 省略時は `createNodeLoader()` |
| `includeUnderscoreEntries` | `_` 始まりの partial をエントリに含めるか |
| `preserveFrontMatter` | 出力に front matter を残す |
| `preserveHgComments` | 出力に hyogen コメントを残す |

## 戻り値

```ts
type BuildResult = {
  files: { path: string; markdown: string }[]
  warnings: HyogenWarning[]
}
```

`files` 配列にレンダリング結果が入ります。ディスクへの書き込みは呼び出し側の責任です。

## 依存の走査

既定では、指定したエントリから **`include` / `component` / `extend` の依存を辿って**関連ファイルを処理します。

## `_` partial の扱い

`_` で始まるファイルや `_` ディレクトリ配下は、**エントリ対象外**です（Sass の partial と同様）。ただし glob で明示的に指定したパスは、除外を上書きしてエントリに含められます。

## 例

```ts
const { files, warnings } = await build({
  input: './src/**/*.md',
  outDir: './out',
  context: { siteName: 'My Site' },
  serverContext: { buildTime: Date.now() },
})

for (const file of files) {
  await writeFile(join('./out', file.path), file.markdown)
}
```

## 関連

- [renderServer](/ja/api/render-server)
- [パスとセキュリティ](/ja/syntax/paths-and-security) — `_` partial と `.doc_root`
