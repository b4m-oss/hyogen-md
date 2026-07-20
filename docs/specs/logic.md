# ロジック

詳細構文は [dsl.md](./dsl.md) および後続定義。方向性と制限のみここに固定する。

## 機能一覧

| 機能 | 方向性 |
|------|--------|
| if / else / else if | Pug 風（`each` と同型）。hyogen ブロックで開閉し本文を挟む。詳細は [dsl.md](./dsl.md) |
| for (;;)、do…while | JS 風（hyogen ブロック内）。`while` 単体・`for…of` / `for…in` は不可 |
| each | Pug 風。本文を挟む。`{{ }}` 内では each 不可 |
| 三項演算子 | JS 風（主に `{{ }}` 内の式） |
| mixin | **保留（当面廃止）**。component で代替。必要時に将来実装 |

## 実行モデル（二層）

詳細・例・ホワイトリストは [dsl.md](./dsl.md)。

| 領域 | できること |
|------|------------|
| hyogen ブロック（`@hg` / `@@`） | 本仕様で定義したロジックを **実行**（宣言・代入・`for`・`component ... as` など）。`if` / `each` は step 5 で本文展開 |
| `{{ }}` / `{{{ }}}` | **式のみ**（三項・パイプ・メンバアクセス、登録済み **component** 呼び出し、`.toLocaleString` など。文・each は不可） |

- 任意のホスト JS（`eval` / `import` / 未許可の関数呼び出し等）は行わない
- 許可する文・式は dsl.md のホワイトリストに従う
- 処理順は [pipeline.md](./pipeline.md)（`if` / `each` → 本体の `{{ }}`）

## ネスト上限

- **`if` / `each` の構造ネスト合計最大 20**（入れ子の深さ。`if` 内の `each` や `each` 内の `if` も 1 段ずつ加算）
- 超過時: 当該展開を **スキップし、警告**（エラー中断ではない）
- include / component / extend のファイルネスト深さには、この 20 の制限は適用しない（循環検出は [templating.md](./templating.md)）

## 関連

- 変数: [variables.md](./variables.md)
- DSL: [dsl.md](./dsl.md)
- パイプライン: [pipeline.md](./pipeline.md)

---

以上