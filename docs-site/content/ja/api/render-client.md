---
title: renderClient
description: CSR 向けの Markdown レンダリング API
---

# renderClient

ブラウザ（CSR）向けのレンダリング API です。**`@b4moss/hyogen-md/client`** から import します。

```ts
import { renderClient } from '@b4moss/hyogen-md/client'
```

## シグネチャ

```ts
function renderClient(
  source: string | { path: string },
  context?: HyogenContext,
  options?: RenderOptions,
): Promise<RenderResult>
```

`renderServer` と同型ですが、**`serverContext` は使えません**。

## 引数

### `source`

- 文字列、または `{ path: string }`

### `context`

テンプレート変数のオブジェクトです。

### `options`

| オプション | 型 | デフォルト | 説明 |
|-----------|-----|----------|------|
| `loader` | `Loader` | **必須** | ファイル読み込み関数 |
| `root` | `string` | — | ドキュメントルートの上書き |
| `preserveFrontMatter` | `boolean` | `false` | 出力に front matter を残す |
| `preserveHgComments` | `boolean` | `false` | 出力に hyogen コメントを残す |

## loader は必須

ブラウザではライブラリがファイルシステムやネットワークに直接アクセスしません。`include` / `component` / `extend` を使う場合は、呼び出し側が **loader を必ず渡す**必要があります。

```ts
const result = await renderClient(
  { path: '/src/index.md' },
  { siteName: 'Demo' },
  {
    loader: async (path) => {
      const res = await fetch(`/virtual-fs${path}`)
      return res.text()
    },
  },
)
```

## serverContext は不可

`options` に `serverContext` 相当の値を渡すと **`server_context_on_client`** エラーで中断します。サーバー専用データは `renderServer` でのみ渡してください。

## バンドルに含まれるもの

`@b4moss/hyogen-md/client` には Node 専用の API（`build`、`createNodeLoader`、`createFsLoader` など）は **含まれません**。

## 関連

- [renderServer](/ja/api/render-server)
- [loader](/ja/api/loader)
