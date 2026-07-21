---
title: 診断とログ
description: 警告・エラーの扱いと formatDiagnosticLog
---

# 診断とログ

hyogen-md はレンダリング中に **警告**（処理続行）と **エラー**（中断）を区別します。ライブラリは **console に自動出力しません**。呼び出し側がログを整形・出力します。

## 診断オブジェクト

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

## formatDiagnosticLog

診断を複数行テキストに整形するユーティリティです。`@b4moss/hyogen-md` と `@b4moss/hyogen-md/client` の両方から export されます。

```ts
import { formatDiagnosticLog } from '@b4moss/hyogen-md'

const text = formatDiagnosticLog('warning', diagnostic)
console.error(text)
```

### 出力形式

1 行目: `[hyogen:{kind}] {code}`

以降: `details` の各キーを `  {key}: {value}`（インデント 2 スペース）で出力。`undefined` のキーは省略します。

例:

```text
[hyogen:error] file_not_found
  path: ./missing.md
  from: ./page.md
  via: include
```

`diagnostic.path` も `path` 行として含まれます。`details.path` がある場合はそちらを優先します。

## 警告の扱い

警告は `RenderResult.warnings` または `BuildResult.warnings` に入ります。レンダリング自体は **続行**されます。

代表的な警告:

| code | 状況 |
|------|------|
| `circular_include` | 循環参照を検出し、当該取り込みをスキップ |
| `nest_limit_exceeded` | `if` / `each` の構造ネストが 20 を超え、ブロックをスキップ |
| `extend_in_component` | component 内の `extend` をスキップ |
| `prop_type_mismatch` | props の型不一致（値は `undefined`） |
| `prop_missing` | 必須 props の欠落（値は `undefined`） |
| `prop_unknown` | 未知の props キーを無視 |
| `suspicious_context_value` | context に危険そうな値（改変はしない） |

## エラーの扱い

エラーは **例外として投げられ**、レンダリングが中断します。

```ts
import { createHyogenError } from '@b4moss/hyogen-md'

try {
  await renderServer(source, context)
} catch (error) {
  if (error instanceof Error && 'code' in error) {
    console.error(formatDiagnosticLog('error', error as HyogenDiagnostic))
  }
}
```

## formatMessage

メッセージテンプレートに値を埋め込むユーティリティです。カスタム loader やツール連携で使えます。

## 関連

- [エラーコード](/ja/api/error-codes) — コード一覧
- [型とオプション](/ja/api/types-and-options)
