---
title: 制御構造
description: if / each / extend / block による制御
---

# 制御構造

条件分岐、ループ、レイアウト継承を hyogen ブロックで書きます。`if` と `each` は **本文を挟む構造ディレクティブ**です（Pug 風）。

## if / else / else if

```markdown
<!--
@hg
const isNight = true
@endhg
-->

# Light Status

Night is {{ isNight }}.
<!--
@hg
if isNight
@endhg-->
I can see the full moon.
<!--
@hg
else
@endhg-->
I can see the shiny sun.
<!--
@hg
endif
@endhg
-->
```

### 構造

`if <式>` … 本文 …（`else if <式>` … 本文 …）* …（`else` … 本文 …）? … `endif`

- 条件式は **`{{ }}` 内と同じ式**（JS の truthy / falsy で評価）
- 分岐内に `each` や入れ子 `if` を書ける
- 空の分岐（本文なし）も可
- 未対の `if` や余分な `endif` は **`parse_error`**

### else if の例

```markdown
<!--
@hg
if score >= 90
@endhg-->
Grade A.
<!--
@hg
else if score >= 60
@endhg-->
Grade B.
<!--
@hg
else
@endhg-->
Grade C.
<!--
@hg
endif
@endhg
-->
```

## each

配列やオブジェクトの配列をループします。

```markdown
<!--
@hg
const data = ["apple", "banana", "orange"]
@endhg
-->

# Fruits

<!--
@hg
each item in data
@endhg
-->
- {{ item }}
<!--
@hg
endeach
@endhg
-->
```

オブジェクトの配列:

```markdown
<!--
@hg
each item in data
@endhg
-->
- {{ item.key }} is {{ item.value }}
<!--
@hg
endeach
@endhg
-->
```

## ネスト上限

`if` / `each` の **構造ネスト合計は最大 20** です。超過すると当該ブロックをスキップし、`nest_limit_exceeded` 警告が出ます。

## extend / block

レイアウト継承とブロック上書きです（Pug / Blade / Twig 風）。**多重継承はサポートしません**。

### layout.md

```markdown
# {{ title }}

{{ description }}

<!--
@hg
block contents
@endhg-->

Default contents here.

<!--
@hg
endblock
@endhg
-->

---

Copyright example LLC.
```

### page.md

```markdown
<!--
@hg
extend layout.md

const title = "My Page"
const description = "A sample page"
@endhg
-->

<!--
@hg
block contents
@endhg-->

Custom page content.

<!--
@hg
endblock
@endhg
-->
```

### ルール

| 項目 | 内容 |
|------|------|
| 終了タグ | `endblock` のみ（`end block` は不可） |
| `extend` の位置 | ファイル先頭の `@hg` で必須（その上に front matter は可） |
| block 以外の本文 | 子（extend する側）では **無視** |
| 未定義の block | layout のデフォルト本文が残る |
| component 内 | **不可**（スキップ + 警告） |

## 関連

- [include と component](/ja/syntax/includes)
- [宣言と代入](/ja/syntax/declarations)
- [式と変数展開](/ja/syntax/expressions)
