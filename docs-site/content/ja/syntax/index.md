---
title: テンプレート構文
description: hyogen-md のテンプレート構文クックブックとリファレンス
---

# テンプレート構文

hyogen-md のテンプレート構文の索引です。制御構文は HTML コメント内に閉じるため、Markdown プレビューで目立ちにくいのが特徴です。

## 基本概念

| 領域 | 書き方 | できること |
|------|--------|-----------|
| hyogen ブロック | `@hg` … `@endhg` または `@@` … `@@` | 宣言、制御構造、include など |
| 式の展開 | `{{ }}` / `{{{ }}}` | 変数参照・式の評価（文は書けない） |
| メタデータ | YAML front matter | ドキュメントのメタデータ、component の props 契約 |

## 構文リファレンス

| トピック | 説明 |
|---------|------|
| [Front matter](/ja/syntax/front-matter) | YAML メタデータと props 契約 |
| [式と変数展開](/ja/syntax/expressions) | `{{ }}`、デフォルト値、三項演算子 |
| [hyogen ブロック](/ja/syntax/hg-blocks) | `@hg` / `@@` の書き方 |
| [宣言と代入](/ja/syntax/declarations) | `const` / `let` と再代入 |
| [include と component](/ja/syntax/includes) | ファイルの取り込みと再利用 |
| [制御構造](/ja/syntax/control-flow) | `if` / `each` / `extend` / `block` |
| [許可メソッド](/ja/syntax/methods) | `.toLocaleString` |
| [パスとセキュリティ](/ja/syntax/paths-and-security) | パス解決、`_` partial、注意点 |

## 二層モデル

- **hyogen ブロック内** — 宣言・代入・`for` ループ・`include` などを実行。`if` / `each` は本文を挟む構造ディレクティブ
- **`{{ }}` 内** — 式のみ（変数参照、三項演算子、component 呼び出しなど）。文や `each` は書けない

任意の JavaScript（`eval`、`import`、未許可の関数呼び出し）は実行しません。

## 試してみる

[Playground](/playground) でブラウザ上ですぐに試せます。
