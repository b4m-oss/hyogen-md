---
title: Front matter
description: YAML front matter と component の props 契約
---

# Front matter

ファイル先頭の **YAML** ブロックです。ドキュメントのメタデータや、component の props 契約として使います。

```markdown
---
title: My Page
author: Alice
---

# {{ title }}

Written by {{ author }}.
```

## 役割

1. **ドキュメントのメタデータ** — レンダリング開始時にテンプレート変数へ注入される初期値
2. **component の props 契約** — 型・必須・デフォルトを定義（[include と component](/ja/syntax/includes)）

## 出力時の扱い

**デフォルト**では、レンダリング後の Markdown から front matter は **除去**されます。残したい場合は `preserveFrontMatter: true` を指定します。

## サイズ制限

front matter のソースは **最大 64 KB** です。超過すると `frontmatter_too_large` エラーで中断します。

## props 契約（component 用）

component ファイルでは、front matter で props を定義します。

```yaml
---
props:
  name:
    type: string
    isRequired: true
    default: "Ethan Hunt"
  age:
    type: number
---
```

| フィールド | 説明 |
|-----------|------|
| `type` | `string` / `number` / `boolean` / `object` / `array` |
| `isRequired` | `true` のとき必須。欠落時は警告（値は `undefined`） |
| `default` | 未指定時の初期値 |

`type` を省略すると、渡された値や `default` から推論します。

### 実行時の挙動

| 状況 | 挙動 |
|------|------|
| 型不一致 | 警告 + 値は `undefined` |
| 必須 props の欠落 | 警告 + 値は `undefined` |
| 未知の props キー | 警告して無視 |

## 変数の優先順位

固定の優先順位はありません。**適用・呼び出し順に束縛し、あとから同名が来たら上書き**します。

1. API の `context` が先に入る
2. ファイルの front matter が後から適用されれば上書き
3. component 呼び出しの props がさらに後なら、component 内ではそれが勝つ

## 注意

- 秘密情報を front matter に書かないこと（運用上の推奨）
- front matter は **YAML のみ**対応

## 関連

- [include と component](/ja/syntax/includes)
- [式と変数展開](/ja/syntax/expressions)
