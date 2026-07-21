---
title: renderServer
description: SSR / SSG 向けの Markdown レンダリング API
---

# renderServer

SSR や Node 上でのレンダリングに使う API です。`serverContext` でサーバー専用のデータを渡せます。

```ts
import { renderServer } from '@b4moss/hyogen-md'
```

## シグネチャ

```ts
function renderServer(
  source: string | { path: string },
  context?: HyogenContext,
  options?: ServerRenderOptions,
): Promise<RenderResult>
```

## 引数

### `source`

レンダリング対象です。

- **文字列** — Markdown ソースを直接渡す
- **`{ path: string }`** — ファイルパスを指定（`loader` で読み込む）

### `context`

テンプレート変数として使うオブジェクトです。`{{ name }}` などが参照します。front matter や component の props と合成され、**後から来た値が同名を上書き**します。

### `options`

| オプション | 型 | デフォルト | 説明 |
|-----------|-----|----------|------|
| `serverContext` | `HyogenContext` | — | サーバー専用の変数。テンプレートから参照可能 |
| `loader` | `Loader` | `createNodeLoader()` | ファイル読み込み関数 |
| `root` | `string` | — | ドキュメントルートの上書き |
| `preserveFrontMatter` | `boolean` | `false` | 出力に front matter を残す |
| `preserveHgComments` | `boolean` | `false` | 出力に hyogen コメントを残す |

## 戻り値

```ts
type RenderResult = {
  markdown: string    // レンダリング後の Markdown
  warnings: HyogenWarning[]
}
```

エラーが発生した場合は **例外を投げ**、レンダリングを中断します。警告のみの場合は `warnings` に入り、処理は続行します。

## 例

### インラインソース

```ts
const result = await renderServer(
  '# {{ title }}',
  { title: 'Hello' },
)
```

### ファイル + serverContext

```ts
const result = await renderServer(
  { path: './pages/index.md' },
  { title: '公開データ' },
  {
    serverContext: { apiKey: 'secret' },
    loader: createNodeLoader(),
  },
)
```

`serverContext` の値もテンプレート変数として参照できます。クライアントに漏らしたくない秘密情報は、こちらに入れて `renderClient` では渡さない運用を推奨します。

## 関連

- [renderClient](/ja/api/render-client) — ブラウザ向け（`serverContext` 不可）
- [loader](/ja/api/loader) — カスタム loader の書き方
- [型とオプション](/ja/api/types-and-options)
