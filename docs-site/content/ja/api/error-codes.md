---
title: エラーコード
description: hyogen-md のエラー・警告コード一覧
---

# エラーコード

診断の `code` フィールドに入る値の一覧です。メッセージは英語テンプレートで生成されます。

## 中断するエラー

これらが発生するとレンダリングは **例外で中断**します。

| code | 状況 |
|------|------|
| `file_not_found` | `include` / `component` / `extend` 先が存在しない |
| `frontmatter_too_large` | front matter のソースが 64 KB を超える |
| `duplicate_component_alias` | 同一ファイルで同名の `component ... as` を二重登録 |
| `alias_collision` | `as` 名が既存の変数・別の `as` と衝突 |
| `forbidden_property_access` | `__proto__` など危険キーへのアクセス |
| `parse_error` | ホワイトリスト外の構文・不正な DSL |
| `component_multiline_output` | component の戻り値が複数行（単一行のみ許可） |
| `server_context_on_client` | `renderClient` に `serverContext` を渡した |
| `load_failed` | loader のその他の失敗 |

### 例: file_not_found

```text
[hyogen:error] file_not_found
  path: ./missing.md
  from: ./page.md
  via: include
```

## 中断しない警告

警告は `warnings` 配列に入り、処理は **続行**されます。

| code | 状況 |
|------|------|
| `circular_include` | 循環参照を検出し、当該取り込みをスキップ |
| `nest_limit_exceeded` | `if` / `each` の構造ネスト合計が 20 を超え、ブロックをスキップ |
| `extend_in_component` | component 内の `extend` をスキップ |
| `prop_type_mismatch` | props の型不一致（値は `undefined`） |
| `prop_missing` | `isRequired` な props が欠落（値は `undefined`） |
| `prop_unknown` | 未知の props キーを無視 |
| `suspicious_context_value` | context に危険そうな値（値は改変しない） |

### suspicious_context_value の理由

| reason | 検出内容 |
|--------|---------|
| `contains_html_script_tag` | `<script` / `</script>` |
| `contains_event_handler` | `onerror=` などのイベントハンドラ属性 |
| `contains_dangerous_scheme` | `javascript:` / `vbscript:` |
| `contains_embed_tag` | `<iframe` / `<object` / `<embed` |
| `contains_meta_refresh` | `<meta` + `http-equiv` |

## ログの出力

ライブラリは自動で console 出力しません。[formatDiagnosticLog](/ja/api/diagnostics) で整形してから出力してください。

```ts
import { formatDiagnosticLog } from '@b4moss/hyogen-md'

for (const w of result.warnings) {
  console.warn(formatDiagnosticLog('warning', w))
}
```

## 関連

- [診断とログ](/ja/api/diagnostics)
- [パスとセキュリティ](/ja/syntax/paths-and-security)
