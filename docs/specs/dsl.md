# DSL

hyogen.md 固有の制御構文の書き方。

## 方針（確定）

- 固有構文は **HTML コメント** に閉じる
  - Markdown のプレビューでは表示したくないため
- コメントブロックの標識は次のいずれか（**等価**）
  - 通常: `@hg` … `@endhg`
  - **ショートハンド**: `@@` … `@@`（`<!--@@` … `@@-->`）
- **二層モデル**
  - hyogen ブロック内: 本仕様で定義したロジックを **実行**できる（宣言・代入・`for` 等）。`if` / `each` は **構造ディレクティブ**（本文を挟む。step 5 で展開）
  - 本文の `{{ }}` / `{{{ }}}` 内: **式のみ**（文は書けない）。詳細は [variables.md](./variables.md)
- 制御構文（include / if / each / extend 等）はコメント DSL 側
- hyogen ブロックは、改行あり・同一行・minify 相当のいずれでも認識する（空白の有無は自由）

## イメージ

input:

```markdown
# Static title

<!--
@hg
include ./components/description.md
@endhg
-->
```

output:

```markdown
# Static title

Description goes here...
```

## レンダリングオプション

- hyogen.md 固有の HTML コメントを **出力に残すか / 残さないか** を選択可能にする（デバッグ・ソーストレース用）

## 詳細文法（執筆中）

### 定数・変数・バインディング

基本は JS と同じ（`@hg` 内）。

input:

```markdown
<!--@hg

const text = "foo bar" // 定数テキスト

let fooBar = "over-writable foo bar" // 変数テキスト

fooBar = "foo bar is over-written" // 上書き

const object = {
  animal: "duck",
  state: "sitting",
} // オブジェクト

@endhg-->

- {{ text }}
- {{ fooBar }}

- {{ object.animal }} is {{ object.state }}

- default value is {{ color | "transparent" }}
```

output:

```markdown
- foo bar
- foo bar is over-written

- duck is sitting

- default value is transparent
```

### if

Pug 風。`each` と同型。**hyogen ブロックで開閉し、間に Markdown 本文**を挟む。

- 構造: `if <式>` … 本文 …（`else if <式>` … 本文 …）* …（`else` … 本文 …）? … `endif`
- `else` / `else if` は省略可（`if` … `endif` のみ可）
- 条件 `<式>` は **`{{ }}` 内と同じ式**（ホワイトリスト準拠）。JS の truthy / falsy で評価
- `if` / `else if` / `else` / `endif` は **構造ディレクティブ**（[pipeline.md](./pipeline.md) step 5 で展開。宣言の `const` 等とは別）
- 分岐内に `each` や入れ子 `if` を書いてよい（`if` / `each` の構造ネスト合計は最大 20。詳細は [logic.md](./logic.md)）
- 空の分岐（本文なし）も可
- 未対の `if`・余分な `endif` 等は **構文エラー**（`parse_error`）
- 展開後、`if` / `else if` / `else` / `endif` の hyogen コメントは strip される（step 7）

input:

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

output:

```markdown
# Light Status

Night is true.

I can see the full moon.
```

#### else if

`else if <式>` は `else` と同様、hyogen ブロック1行。`if` と `else` / `endif` の間に複数並べられる。

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

### 三項演算子

基本は JS と同じ。**本文の `{{ }}` 内の式**として書ける。

input:

```markdown
<!--
@hg
const isNight = false
@endhg
-->

# Light Status

- {{ isNight ? "Dark" : "Shine" }}
```

output:

```markdown
# Light Status

- Shine
```

### each

基本は Pug と同じ。ループ本体は `each` … `endeach` に挟まれた Markdown 本文。`if` / `each` の構造ネスト合計は最大 20（[logic.md](./logic.md)）。

#### 配列

input:

```markdown
<!--
@hg
const data = ["apple","banana","orange"]
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

output:

```markdown
# Fruits

- apple
- banana
- orange
```

#### オブジェクトの配列

input:

```markdown
<!--
@hg
const data = [
  { key: "apple", value: "red"},
  { key: "banana", value: "yellow"},
  { key: "orange", value: "orange"},
]
@endhg
-->

# Fruits color

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

output:

```markdown
# Fruits color

- apple is red
- banana is yellow
- orange is orange
```

### block / extend

規則・例は [templating.md](./templating.md) を正とする。要約:

- `extend <path>`（パス解決は include と同じ）
- `block <name>` … 本文 … `endblock`
- 終了は **`endblock` のみ**
- 子の block 以外の本文は無視
- 未上書き block は layout のデフォルトが残る
- `extend` は先頭 `@hg` 必須（その上の front matter は可）

### mixin（保留）

**当面は廃止（非ゴール）。** `component` で事足りる想定。必要があれば将来実装する。

- 再利用は **component**（ファイル単位）または **include** を用いる
- 同一ファイル内の関数相当が必要になった時点で mixin を再検討する

### 予約語（初期）

識別子として使えない:

`if` `else` `else if` `endif` `const` `let` `for` `do` `while` `each` `endeach` `block` `endblock` `extend` `include` `component` `as`

- 今後増やしうる
- ビルトイン関数名は **当面予約しない**（ビルトイン自体を当面導入しないため）
- `mixin` は当面仕様に含めない（将来再導入時に予約語へ追加しうる）

### テンプレートリテラル内の式

`` `hello ${...}` `` の `${}` 内:

- hyogen.md で許可された **式**のみ
- `.toLocaleString` は **可**
- **component 呼び出しは不可**

## トークン規則

### 標識

- Markdown 内の **HTML コメント**の中に記述する
- **通常形**: 開始 `@hg` / 終了 `@endhg`
- **ショートハンド**: 開始 `@@` / 終了 `@@`（`<!--@@` … `@@-->`）
- 通常形・ショートハンドは **等価**（パーサは同じ hyogen ブロックとして扱う）
- `<!--` と標識、標識と `-->` は同一行でも別行でもよい（minify 可）

通常形:

```markdown
<!--
@hg
// ここが hyogen.md の記述箇所
@endhg
-->
```

```markdown
<!--@hg
// つなげてもOK
@endhg-->
```

```markdown
<!--@hg /* ブロックコメントなら同一行でもOK */ @endhg-->
```

ショートハンド:

```markdown
<!--@@
// hyogen.md 構文
@@-->
```

```markdown
<!--@@ /* ワンライナーもOK */ @@-->
```

同一行にまとめる場合、`//` 行コメントは行末までがコメントになるため使えない。その場合は `/* */` を使う。

### コメント（`@hg` 内）

JS と同様。

```markdown
<!--
@hg

// 行コメント

/* ブロックコメント */

/*
 * 複数行ブロックコメント
 */

@endhg
-->
```

### 識別子

JS の識別子に合わせる（Unicode 識別子）。

- おおよそ: `IdentifierStart` で始まり、続けて `IdentifierPart`（`$`・ゼロ幅接合子を含む JS 相当）
- 実装目安: `[$_\p{ID_Start}][$\u200C\u200D\p{ID_Continue}]*`（エンジンの Unicode プロパティ対応に依存）
- **予約語は識別子として使えない**（下記「予約語（初期）」および本節のリスト）

### メンバアクセス・添え字（式）

識別子そのものではなく、式としての参照。`{{ }}` 内および `@hg` 内の式で用いる。

| 書き方 | 意味 |
|--------|------|
| `fooBar` | 変数・定数の参照 |
| `object.key` | プロパティ参照 |
| `object[key]` | 計算プロパティ（`key` は式） |
| `array[index]` | 配列要素 |

### リテラル

| 種類 | 可否 | 例 |
|------|------|-----|
| 数値 | 可 | `123`, `1.5` |
| 文字列 | 可 | `"..."`, `'...'` |
| 真偽 | 可 | `true`, `false` |
| `null` | 可 | `null` |
| `undefined` | 可 | `undefined` |
| 配列・オブジェクト | 可 | `[...]`, `{ ... }` |
| テンプレートリテラル | 可 | `` `hello ${name}` `` |
| スプレッド | 可 | `...`（JS と同じ） |
| 正規表現リテラル | **不可** | `/foo/` は書かない |

### 空白・改行

JS と同じ。minify（空白削除）しても構文として解釈できなければならない。

### 行末のセミコロン

JS と同じ。あってもなくても可。

---

## コードフェンス内の HTML コメント

コードフェンス（`` ``` ``）内に現れる hyogen ブロック（`@hg` / `@@` いずれも）は **無視する**。  
フェンス内は生テキストとして扱い、実行・展開しない。

---

## `@hg` 内で許可する文・式（ホワイトリスト）

許可したもの以外は構文エラー（または拒否）とする。任意のホスト JS 評価は行わない。

### 許可

| 種別 | 内容 |
|------|------|
| 宣言・代入 | `const` / `let` / 再代入 |
| 構造制御（Pug 風） | `if <式>` / `else if <式>` / `else` / `endif`（本文を挟む。`each` / `endeach` と同型） |
| ループ | `each` / `endeach`（Pug 風） |
| ループ | `for (init; cond; update)`（C 風のみ） |
| ループ | `do { ... } while (cond)` |
| 更新 | `++` / `--`（前置・後置）、複合代入（`+=` `-=` 等） |
| 式 | 比較・論理（`===` `&&` `||` `!` 等）、算術（`+ - * /` 等） |
| リテラル | 上記「リテラル」表のとおり |
| テンプレーティング | `include` / `extend` / `block` / `endblock` / `component ... as ...` 等（[templating.md](./templating.md)） |
| 関数呼び出し | **ユーザー登録関数のみ**（現状は `component ... as name` で登録した `name(...)`）。**ビルトイン関数は当面なし**（v0.8 時点で導入しない。将来候補は v0.9+） |
| メソッド呼び出し | 当面 **`.toLocaleString(...)` のみ許容**。それ以外のメソッドは不可（候補メモ: `.length` / `.slice` 等 → [need_decision.md](../need_decision.md)） |

### 禁止（代表）

| 種別 | 内容 |
|------|------|
| ループ | `while`（条件のみの while。`do…while` は可） |
| ループ | `for…of` / `for…in` |
| 関数 | 関数定義（`function` / `=>`） |
| 関数 | ユーザー未登録・ビルトイン未提供の呼び出し（一般の `foo()` 等） |
| メソッド | `.toLocaleString` 以外（例: `.map` / `.trim` 等） |
| モジュール | `import` / `require` |
| その他 | `try` / `catch`、`new`、分割代入 |

---

## 後続で詰める項目

- 許可メソッドの追加（都度 spec 更新。実装は当面 `.toLocaleString` のみ）
  - **候補メモ（未実装）**: `.length` / `.slice` など配列操作系
- ビルトイン関数（**当面なし**。必要なら v0.9+ で spec 追加）
- mixin（保留。必要時に再検討）
- データソース読込は **API 側のみ**（DSL の `import` / `require` は引き続き禁止）。詳細は [need_decision.md](../need_decision.md)
- `@hg` 内の `echo` による本文展開は **採用時期未定**（現状は `{{ }}`）
- TOC 専用ヘルパ（詳細未定）

---

以上