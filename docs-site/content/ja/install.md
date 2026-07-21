---
title: インストール
description: @b4moss/hyogen-md のインストール
---

# インストール

```bash
npm install @b4moss/hyogen-md
```

## クイックスタート（サーバー）

```ts
import { renderServer } from '@b4moss/hyogen-md'

const result = await renderServer('# Hello {{ name }}', {
  context: { name: 'world' },
})
```

API とテンプレート構文の詳細ページは docs.7 で追加します。
