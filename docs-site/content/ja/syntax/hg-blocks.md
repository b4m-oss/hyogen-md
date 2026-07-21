---
title: hyogen ブロック
description: @hg と @@ ショートハンドの書き方
---

# hyogen ブロック

hyogen-md の制御構文は **HTML コメント**内に書きます。Markdown プレビューでは表示されません。

## 通常形: @hg … @endhg

```markdown
<!--
@hg
include ./components/description.md
@endhg
-->
```

## ショートハンド: @@ … @@

`@hg` / `@endhg` と **等価**です。短く書けます。

```markdown
<!--@@
include ./components/description.md
@@-->
```

## 書き方のバリエーション

改行あり・同一行・minify 相当のいずれでも認識します。

```markdown
<!--@hg
const title = "Hello"
@endhg-->
```

```markdown
<!--@hg /* ブロックコメントなら同一行でも OK */ @endhg-->
```

```markdown
<!--@@ /* ワンライナー */ @@-->
```

同一行にまとめる場合、`//` 行コメントは行末までがコメントになるため使えません。その場合は `/* */` を使ってください。

## コメント

`@hg` 内では JavaScript と同様のコメントが使えます。

```markdown
<!--
@hg

// 行コメント

/* ブロックコメント */

@endhg
-->
```

## コードフェンス内は無視

コードフェンス（`` ``` ``）内の hyogen ブロックは **無視**されます。生テキストとして扱い、実行・展開しません。

## 出力時の扱い

デフォルトでは、レンダリング後の Markdown から hyogen コメントは **除去**されます。デバッグ用に残す場合は `preserveHgComments: true` を指定します。

## 二層モデル

| 領域 | 内容 |
|------|------|
| hyogen ブロック内 | 宣言・代入・`include`・`if` / `each` の構造ディレクティブなど |
| `{{ }}` 内 | 式のみ |

## 関連

- [宣言と代入](/ja/syntax/declarations)
- [制御構造](/ja/syntax/control-flow)
