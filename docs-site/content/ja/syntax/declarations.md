---
title: 宣言と代入
description: const / let と変数の再代入
---

# 宣言と代入

hyogen ブロック内では、JavaScript と同様に **`const`** と **`let`** で変数を宣言できます。

```markdown
<!--@hg

const text = "foo bar"
let fooBar = "over-writable"
fooBar = "over-written"

const object = {
  animal: "duck",
  state: "sitting",
}

@endhg-->

- {{ text }}
- {{ fooBar }}
- {{ object.animal }} is {{ object.state }}
```

出力:

```markdown
- foo bar
- over-written
- duck is sitting
```

## 使えるもの

| 種別 | 内容 |
|------|------|
| 宣言 | `const` / `let` |
| 再代入 | `fooBar = "new value"` |
| 更新 | `++` / `--`、複合代入（`+=` など） |
| リテラル | 数値、文字列、真偽、`null`、`undefined`、配列、オブジェクト |
| テンプレートリテラル | `` `hello ${name}` `` |
| スプレッド | `...` |

## 使えないもの

| 種別 | 内容 |
|------|------|
| 関数定義 | `function` / `=>` |
| ループ | `while`、`for…of`、`for…in` |
| モジュール | `import` / `require` |
| その他 | `try` / `catch`、`new`、分割代入 |
| 正規表現リテラル | `/foo/` |

## C 風ループ

`for (init; cond; update)` と `do { ... } while (cond)` は hyogen ブロック内で使えます。

```markdown
<!--@hg
let sum = 0
for (let i = 0; i < 3; i++) {
  sum += i
}
@endhg-->

Sum: {{ sum }}
```

## 予約語

次の語は識別子として使えません:

`if` `else` `else if` `endif` `const` `let` `for` `do` `while` `each` `endeach` `block` `endblock` `extend` `include` `component` `as`

## 関連

- [式と変数展開](/ja/syntax/expressions)
- [制御構造](/ja/syntax/control-flow)
