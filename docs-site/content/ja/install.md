---
title: インストール
description: @b4moss/hyogen-md のインストールとクイックスタート
---

# インストール

```bash
npm install @b4moss/hyogen-md
```

**Node.js >= 20** が必要です。

## クイックスタート（サーバー）

SSR や Node 上でのレンダリングには `renderServer` を使います。`loader` を省略すると、ファイルシステムとリモート URL を読み込むデフォルト loader が使われます。

```ts
import { renderServer } from '@b4moss/hyogen-md'

const result = await renderServer('# Hello {{ name }}', {
  name: 'world',
})

console.log(result.markdown)
// # Hello world
```

ファイルパスを指定する場合:

```ts
import { renderServer, createNodeLoader } from '@b4moss/hyogen-md'

const result = await renderServer(
  { path: './pages/index.md' },
  { title: 'Hello' },
  { loader: createNodeLoader() },
)
```

## クイックスタート（クライアント）

ブラウザでは `@b4moss/hyogen-md/client` から `renderClient` を import します。**loader は必須**です。

```ts
import { renderClient } from '@b4moss/hyogen-md/client'

const result = await renderClient(
  { path: '/src/index.md' },
  { siteName: 'Demo' },
  {
    loader: async (path) => {
      // 仮想 FS や fetch など、呼び出し側で実装
      return await readSomewhere(path)
    },
  },
)
```

## クイックスタート（SSG）

複数ファイルを一括でレンダリングするには `build` を使います。

```ts
import { build } from '@b4moss/hyogen-md'

const { files, warnings } = await build({
  input: './src/**/*.md',
  outDir: './out',
  context: { siteName: 'Demo' },
})
```

## 次のステップ

- [API リファレンス](/ja/api) — 関数・型の詳細
- [テンプレート構文](/ja/syntax) — `@hg` ブロックや `{{ }}` の書き方
- [Playground](/playground) — ブラウザで試す
