# テンプレーティング

## include と component の使い分け

- **props が不要なら `include`** を基本とする
- **props がある（または呼び出し側で差し込みたい）なら `component`**
- component は props 定義がなくても動作可能（契約なし＝自由に渡せる／検証なしに近い）

## include

- 指定した `.md` ファイルを読み込み、その位置に展開するだけ
- props はない
- 親スコープのテンプレート変数は **見える**（[variables.md](./variables.md)）
- パス規則は [paths.md](./paths.md)（リモート URL も Node では許可）
- 欠落時は **エラー**（[api.md](./api.md)）

## component

- props を持つ（または持ちうる）`.md`
- props の契約・デフォルトは **当該ファイルの YAML front matter** で定義する（通常の YAML として成立すること）
- 呼び出し側が渡す値が、レンダリング時のテンプレート変数になる
- 親スコープのテンプレート変数も **見える**（後から来る props / 自身の front matter が上書き）
- パスは **include と同じ**（リモート URL も Node では許可）

### 規則

| 項目 | 内容 |
|------|------|
| 定義 | `@hg` 内で `component <path> as <name>` |
| 呼び出し | **`{{ }}` 内のみ**（例: `{{ name({ ... }) }}`） |
| パス | **include と同じ**（[paths.md](./paths.md)） |
| `as` のスコープ | 定義したファイルだけでなく、**include 先からも見える** |
| `as` 名の衝突 | **エラー**（後勝ちにしない。別名にすべき） |
| 戻り値 | レンダリング結果文字列を `{{ }}` に埋め込む |
| 出力行数 | **単一行に制限**（改行を含む結果は **エラー** `component_multiline_output`） |
| ネスト | component 内でさらに `component ... as` **可** |
| include | component 内で **可** |
| extend | component 内では **不可**。書いた場合は **スキップ + 警告** |
| each 内呼び出し | **可**（ループ変数は props に見える。公式例は下記） |

関数呼び出し全般は [dsl.md](./dsl.md)。

### props 契約（front matter）

マップ形式（正式）:

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

| フィールド | 意味 |
|------------|------|
| `type` | `string` / `number`（float 含む）/ `boolean` / `object`（`{}` 可）/ `array`（`[]` 可）。`enum` / `tuple` は認めない |
| `isRequired` | `true` のとき必須。欠落時は **警告し、値は `undefined`**（中断しない）。開発時に気づくためのフラグ |
| `default` | 未指定時の初期値 |
| `type` 省略 | 渡された値／`default` から **推論**する（[variables.md](./variables.md)） |

実行時:

| 状況 | 挙動 |
|------|------|
| 型不一致 | **警告 + `undefined`** |
| 必須欠落 | **警告 + `undefined`** |
| 未知の props キー | **警告して無視**（component 内には渡さない） |

### `as` 名の衝突（エラー）

次はいずれも **エラーで中断**:

- 同一ファイルで同名 `component ... as foo` の二重登録
- 既存の変数・定数名と `as` 名の衝突
- 親で登録済みの `as` 名を、include 先などで再度同名登録

変数の「後勝ち」の **例外**（[variables.md](./variables.md)）。

### 例

component: `city-item.md`

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

parent: `cities.md`

```markdown
<!--
@hg
component city-item.md as cityItem
@endhg
-->

# City list

- {{ cityItem({ city: "Osaka", population: 2825000 }) }}
- {{ cityItem({ city: "Kobe", population: 1490000 }) }}
```

output: `cities.md`（レンダリング結果）

```markdown
# City list

- Name: Osaka / Population: 2,825,000
- Name: Kobe / Population: 1,490,000
```

### each 内での component 呼び出し

ループ変数は component の props に渡せる（呼び出しオブジェクトの値は **式可**。例: `item.name`）。親スコープの変数も component から見える（[variables.md](./variables.md)）。

parent: `cities.md`（each 版）

```markdown
<!--
@hg
component city-item.md as cityItem
@endhg
-->

<!--
@hg
const cities = [
  { name: "Osaka", population: 2825000 },
  { name: "Kobe", population: 1490000 },
]
@endhg
-->

# City list

<!--
@hg
each item in cities
@endhg
-->
- {{ cityItem({ city: item.name, population: item.population }) }}
<!--
@hg
endeach
@endhg
-->
```
output:

```markdown
# City list

- Name: Osaka / Population: 2,825,000
- Name: Kobe / Population: 1,490,000
```

## extend / block

- Pug / Blade / Twig のイメージ
- レイアウト継承とブロック上書き
- **多重継承は当面サポートしない**

### 規則

| 項目 | 内容 |
|------|------|
| 終了タグ | **`endblock`** に統一（`end block` は不可） |
| 複数 block | **可能**（名前で対応。例: `contents` / `sidebar`） |
| パス | **`include` と同じ**（[paths.md](./paths.md)） |
| `extend` の位置 | 本文としては **ファイル先頭の `@hg` で必須**。ただしその **さらに上に YAML front matter があってもよい** |
| block 以外の本文 | 子（extend する側）では **無視**する |
| 未定義の block | 子が同名 `block` を書かない場合、親（layout）の **デフォルト本文が残る** |
| 変数 | **後勝ち**（[variables.md](./variables.md)）。page 側で同名を定義すれば layout の `{{ }}` にもそれが見える／上書きされる |
| component 内 | **不可**（スキップ + 警告） |

layout 内の `---` などは **通常の Markdown**（水平線など）であり、hyogen.md の構文ではない。

### 例

input: `layout.md`

```markdown
# {{ title }}

{{ description }}

<!--
@hg
block contents
@endhg-->

The texts written at here, extended contents will be overwritten.

<!--
@hg
endblock
@endhg
-->

---

Copyright All rights reserved by example LLC.
```

input: `page.md`

```markdown
<!--
@hg
extend layout.md

const title = "I like \"Paint it black\""
const description = `
Fill with black,
to make blank.
`
@endhg
-->

<!--
@hg
block contents
@endhg-->

Paint here black all.

<!--
@hg
endblock
@endhg
-->
```

output: `page.md`（レンダリング結果）

```markdown
# I like "Paint it black"

Fill with black,
to make blank.

Paint here black all.

---

Copyright All rights reserved by example LLC.
```

## 循環参照

- include / component / extend の循環を検出したら、当該取り込みを **スキップし、警告**する
- エラーで中断はしない
- component 呼び出しグラフも同様に追跡する

## 関連

- 変数スコープ: [variables.md](./variables.md)
- パス解決: [paths.md](./paths.md)
- DSL 上の書き方: [dsl.md](./dsl.md)
- エラーコード: [api.md](./api.md)

---

以上