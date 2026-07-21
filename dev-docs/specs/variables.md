# 変数・Front matter

## 用語

| 用語 | 意味 |
|------|------|
| Front matter | ファイル先頭の YAML。ファイルに属する静的データ、または component の props 契約 |
| テンプレート変数 | レンダリング時点の動的な束縛。`{{ }}` が参照するもの |
| context / props | API や component 呼び出しから渡す値 |

## バインディング（Mustache 互換・変数のみ）

- 本文中の変数展開は Mustache 風の `{{ }}` を用いる
- **文は書けない。式のみ**（変数参照・メンバアクセス・三項・デフォルトパイプ、および許可された関数／メソッド呼び出し等）
- Mustache のセクション・partial は非対応
- 未展開ソースに `{{ }}` が残るプレビューは **許容**
- `{{ }}` 内で呼べる関数は **ユーザー登録関数**（例: `component ... as name` の `name(...)`）に限る。将来ビルトイン追加の余地あり
- メソッドは当面 **`.toLocaleString(...)` のみ**許可（引数は **JS に準拠**。バリデーションなし）
- デフォルト値をパイプで書ける:

```markdown
{{ title | "hardcoded title" }}
```

- 左辺の値の意味は **JS と同じ**（未束縛 → `undefined`、`null` を入れたら `null`）
- パイプのフォールバックは **`||` 相当**: 左辺が falsy（`undefined` / `null` / `""` / `0` / `false` 等）のとき右辺を使う

### `{{{ }}}`

- 三重括弧も設ける
- **現状の挙動は `{{ }}` と同じ**（値をそのまま埋める）
- 将来エスケープを導入するときの逃げ道／予約としても位置づける

### エスケープ

- `{{ }}` / `{{{ }}}` ともに **HTML / Markdown エスケープは行わない**
- 後段の MD→HTML や呼び出し側の責任とする
- 危険そうな値が context に載っている場合は **警告ログのみ**（サニタイズしない）。パターンは [security.md](./security.md)

## Front matter

- **YAML のみ**
- 役割:
  1. **ドキュメントのメタデータ** → レンダリング開始時にテンプレート変数へ注入される初期値
  2. **component の props 契約**（型・必須・デフォルト等）→ 呼び出し props と合成してテンプレート変数になる（[templating.md](./templating.md)）
- front matter ソースの上限: **64KB**（超過はエラー `frontmatter_too_large`）
- 秘密情報を front matter に書かないことは **運用ガイドのみ**

### 出力時の扱い

- **デフォルト**: 出力 Markdown から front matter を strip する
- **オプション**: 残すことを選べる

### props の型と推論

許可型: `string` / `number` / `boolean` / `object` / `array`（enum / tuple なし）。

`type` 省略時の推論:

| 値 | 推論 |
|----|------|
| 文字列 | `string` |
| 数値 | `number` |
| 真偽 | `boolean` |
| 配列 | `array` |
| プレーンオブジェクト | `object` |
| `null` / `undefined` | 型判定不能 → 警告しうる |

## スコープ規則

### 後勝ち

ソースの種類による固定優先順位は設けない。  
**適用・呼び出し順に束縛し、あとから同名が来たら上書きする。**

関係のイメージ:

1. 先に入った値がベースになる（例: API context）
2. 当該ファイルの front matter が後から適用されれば上書き
3. component 呼び出し props がさらに後なら、component 内ではそれが勝つ
4. 最終的な束縛を `{{ name }}` や `{{ title | "..." }}` が参照する

### 例外: component の `as` 名

- `component ... as name` の `name` は **後勝ちにしない**
- 同名・変数との衝突・親子での同名再登録は **エラー**（[templating.md](./templating.md)）

### 親スコープの可視性

| 構文 | 親の変数 |
|------|----------|
| include | **見える** |
| component | **見える** |
| each 内 | ループ変数・親変数とも **見える** |

## 変数パス

- 深さ・識別子文字種の **明示的な制限は設けない**（実装上の現実的限界のみ）
- 危険キーへのアクセスは **エラー**（[security.md](./security.md)）

## props / API context のサイズ

- **無制限**（front matter ソースの 64KB 制限とは別）

## 関連

- セキュリティ: [security.md](./security.md)
- テンプレーティング: [templating.md](./templating.md)
- API: [api.md](./api.md)

---

以上