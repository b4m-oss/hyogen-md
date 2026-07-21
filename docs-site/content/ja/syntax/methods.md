---
title: 許可メソッド
description: 式で使えるメソッド呼び出し
---

# 許可メソッド

`{{ }}` 内および hyogen ブロック内の式で使えるメソッド呼び出しは、現時点では **`.toLocaleString(...)` のみ**です。

```markdown
{{ population.toLocaleString('ja-JP') }}
```

出力例: `2,825,000`

## 引数

引数は **JavaScript に準拠**します。バリデーションは行いません。

```markdown
{{ price.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) }}
```

## テンプレートリテラル内

テンプレートリテラル `` `hello ${...}` `` の `${}` 内でも、許可された式が使えます。`.toLocaleString` は **可**です。

```markdown
<!--@hg
const count = 1234567
const msg = `Total: ${count.toLocaleString('ja-JP')}`
@endhg-->

{{ msg }}
```

## 使えないメソッド

次のような一般的なメソッドは **使えません**:

- `.map()` / `.filter()` / `.reduce()`
- `.trim()` / `.slice()` / `.length`（プロパティとしてはアクセス可）
- 任意のユーザー定義メソッド

配列操作が必要な場合は、hyogen ブロック内で `each` ループを使うか、context に整形済みの値を渡してください。

## 関数呼び出し

メソッド以外の関数呼び出しは、**component で登録した関数**（`component ... as name` の `name(...)`）のみ許可されています。ビルトイン関数は当面ありません。

## 関連

- [式と変数展開](/ja/syntax/expressions)
- [include と component](/ja/syntax/includes)
