---
title: loader
description: include / component / extend のファイル読み込み
---

# loader

`include`、`component`、`extend` で参照されるパスを解決し、ソース文字列を返す関数です。

```ts
type Loader = (path: string) => Promise<string>
```

## デフォルトの挙動

| 環境 | 省略時 |
|------|--------|
| Node（`renderServer` / `build`） | `createNodeLoader()` — ローカル FS + リモート URL |
| ブラウザ（`renderClient`） | **必須**（ライブラリは fetch しない） |

## 公開ヘルパー

### createNodeLoader

Node 向けのデフォルト loader です。ローカルファイルと `https://` などのリモート URL を読み込めます。

```ts
import { createNodeLoader } from '@b4moss/hyogen-md'

const loader = createNodeLoader()
// オプション: { from: './parent.md', via: 'include' }
```

### createFsLoader

ローカルファイルシステムのみを読み込む loader です。リモート URL は扱いません。

```ts
import { createFsLoader } from '@b4moss/hyogen-md'

const loader = createFsLoader()
```

### isRemotePath

パスがリモート URL かどうかを判定するユーティリティです。

```ts
import { isRemotePath } from '@b4moss/hyogen-md'

isRemotePath('https://example.com/page.md') // true
```

## カスタム loader

仮想ファイルシステムや CDN、インメモリのマップなど、任意のソースから読み込めます。

```ts
const virtualFs: Record<string, string> = {
  '/src/index.md': '# Hello',
  '/src/_partial.md': 'Partial content',
}

const loader: Loader = async (path) => {
  const content = virtualFs[path]
  if (content === undefined) {
    throw createHyogenError({
      code: 'file_not_found',
      details: { path, from: path, via: 'include' },
    })
  }
  return content
}
```

失敗時は **`file_not_found`** または **`load_failed`** で中断してください。`ENOENT` などの生エラーは hyogen エラーに包むことを推奨します。

## ブラウザの制約

- loader は **同一オリジン**想定です
- クロスオリジンの fetch はサポートしません
- ライブラリ本体はネットワークにアクセスしません

## 関連

- [renderClient](/ja/api/render-client) — loader 必須
- [パスとセキュリティ](/ja/syntax/paths-and-security)
