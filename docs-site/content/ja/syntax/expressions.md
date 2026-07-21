---
title: 式と変数展開
description: {{ }} による変数展開と式の書き方
---

# 式と変数展開

本文中の変数展開は Mustache 風の **`{{ }}`** を使います。**文は書けず、式のみ**です。

```markdown
# Hello {{ name }}

- {{ object.animal }} is {{ object.state }}
- {{ color | "transparent" }}
```

## 書ける式

| 種類 | 例 |
|------|-----|
| 変数参照 | `{{ title }}` |
| メンバアクセス | `{{ user.name }}` |
| 添え字 | `{{ items[0] }}` |
| 三項演算子 | `{{ isNight ? "Dark" : "Light" }}` |
| デフォルト値（パイプ） | `` {{ title | "Untitled" }} `` |
| component 呼び出し | `{{ cardItem({ title: "Hi" }) }}` |
| メソッド | `{{ count.toLocaleString('ja-JP') }}` |

## デフォルト値（パイプ）

```markdown
{{ title | "hardcoded title" }}
```

左辺が **falsy**（`undefined`、`null`、`""`、`0`、`false` など）のとき、右辺を使います。`||` 演算子と同じ挙動です。

## `{{{ }}}`

三重括弧も使えます。**現状の挙動は `{{ }}` と同じ**です（値をそのまま埋め込み）。将来エスケープを導入する際の予約として位置づけています。

## エスケープ

`{{ }}` も `{{{ }}}` も **HTML / Markdown エスケープは行いません**。後段の MD→HTML 変換や、呼び出し側でのサニタイズが必要です。

危険そうな値が context に含まれる場合は **`suspicious_context_value` 警告**が出ますが、値自体は改変しません。

## 親スコープの可視性

| 構文 | 親の変数 |
|------|----------|
| include | 見える |
| component | 見える |
| each 内 | ループ変数・親変数とも見える |

## 書けないもの

- 文（`const`、`if` など）— hyogen ブロック内で書く
- `each` — 構造ディレクティブとして hyogen ブロックで書く
- 未登録の関数呼び出し（`foo()` など）
- `.toLocaleString` 以外のメソッド（`.map`、`.trim` など）

## 例

```markdown
<!--
@hg
const isNight = false
@endhg
-->

# Light Status

- {{ isNight ? "Dark" : "Shine" }}
```

出力:

```markdown
# Light Status

- Shine
```

## 関連

- [宣言と代入](/ja/syntax/declarations)
- [許可メソッド](/ja/syntax/methods)
- [include と component](/ja/syntax/includes)
