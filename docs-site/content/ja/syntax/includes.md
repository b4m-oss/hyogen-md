---
title: include と component
description: ファイルの取り込みと component による再利用
---

# include と component

他の Markdown ファイルを取り込んで再利用できます。

## 使い分け

| 構文 | いつ使うか |
|------|-----------|
| **include** | props が不要な単純な取り込み |
| **component** | props で差し込みたい、呼び出し側から値を渡したい |

## include

指定した `.md` ファイルを読み込み、その位置に展開します。props はありません。親スコープのテンプレート変数は **見えます**。

```markdown
<!--
@hg
include ./components/description.md
@endhg
-->
```

ファイルが見つからない場合は **`file_not_found`** エラーで中断します。

## component

props を持つ `.md` ファイルを関数のように呼び出せます。

### 定義

```markdown
<!--@hg
component city-item.md as cityItem
@endhg-->
```

### 呼び出し

**`{{ }}` 内のみ**で呼び出します。

```markdown
- {{ cityItem({ city: "Osaka", population: 2825000 }) }}
```

### component ファイルの例

`city-item.md`:

```markdown
---
props:
  city:
    type: string
  population:
    type: number
---

Name: {{ city }} / Population: {{ population.toLocaleString('ja-JP') }}
```

### ルール

| 項目 | 内容 |
|------|------|
| 定義 | `@hg` 内で `component <path> as <name>` |
| 呼び出し | `{{ }}` 内のみ |
| `as` のスコープ | 定義したファイルだけでなく、include 先からも見える |
| `as` 名の衝突 | **エラー**（後勝ちにしない） |
| 戻り値 | レンダリング結果を `{{ }}` に埋め込む |
| 出力行数 | **単一行のみ**（改行を含むと `component_multiline_output` エラー） |
| extend | component 内では **不可**（スキップ + 警告） |

### each 内での呼び出し

ループ変数を props に渡せます。

```markdown
<!--@hg
each item in cities
@endhg-->
- {{ cityItem({ city: item.name, population: item.population }) }}
<!--@hg
endeach
@endhg-->
```

## 循環参照

`include` / `component` / `extend` の循環を検出した場合、当該取り込みを **スキップし警告**します（エラーではありません）。

## 関連

- [Front matter](/ja/syntax/front-matter) — props 契約
- [制御構造](/ja/syntax/control-flow) — `extend` / `block`
- [パスとセキュリティ](/ja/syntax/paths-and-security)
