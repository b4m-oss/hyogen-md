# 開発ロードマップ

[SemVer](https://semver.org/) に従う。`v1.0.0` への引き上げ判断はメンテナーが行う。  
本ロードマップは **`v0.n.0` を機能単位の区切り**として記述する（日付・リリース時期の約束はしない）。

仕様の正: [main.md](./main.md)、[specs/](./specs/)、[need_decision.md](./need_decision.md)  
実装の進め方（TDD）: [development.md](./development.md)

各バージョンの「テスト」節は [development.md](./development.md) の手順に従い、**テスト仕様書 → Red → Green → Refactor** で埋める。

---

## v0.1.0 — 基盤と MVP

パイプラインの骨格と、最小限のテンプレート機能を Node 単体文字列入力で動かす。

### 実装

- [x] 公開型の骨格（`HyogenError` / `HyogenWarning` / `RenderResult` 等 → [api.md](./specs/api.md)）
- [x] 英語メッセージ参照（[messages.en.json](./specs/messages.en.json)）
- [x] 処理パイプラインのオーケストレータ（段階の呼び出し順のみ。中身は段階的に接続 → [pipeline.md](./specs/pipeline.md)）
- [x] hyogen ブロックの字句解析（`@hg` / `@endhg`。`@@` は後続バージョンでも可）
- [x] YAML front matter のパースと context への注入（64KB 上限 → `frontmatter_too_large`）
- [x] 本文 `{{ }}` の式評価（変数参照・リテラル・メンバアクセス）
- [x] デフォルトパイプ `{{ value | "default" }}`
- [x] `include`（ローカル相対パス。`renderServer(source: string)` から）
- [x] 出力オプション: front matter strip（デフォルト ON）、hyogen コメント strip（デフォルト ON）
- [x] エラー: `parse_error` / `file_not_found` / `load_failed`（loader 未実装時の FS 読み込み含む）

### テスト

テスト仕様書: [app/test/specs/v0.1.0.md](../app/test/specs/v0.1.0.md)（[development.md](./development.md) の TDD 手順に従う）

- [x] front matter → 変数展開
- [x] include の単純埋め込み
- [x] デフォルトパイプ
- [x] 不正 DSL → `parse_error`

### 参照 spec

[variables.md](./specs/variables.md) / [pipeline.md](./specs/pipeline.md) / [templating.md](./specs/templating.md)（include のみ）/ [dsl.md](./specs/dsl.md)（最小 subset）

---

## v0.2.0 — パス解決・loader・component

ファイルパス入力とコンポーネント呼び出しまでを Node SSR/SSG 向けに揃える。

### 実装

- [ ] `.doc_root` と相対パス規則（[paths.md](./specs/paths.md)）
- [ ] `renderServer({ path })` と `root` オプション
- [ ] デフォルト Node loader（FS。省略時利用）
- [ ] `Loader` 型と注入（[api.md](./specs/api.md)）
- [ ] 循環 include 検出 → `circular_include` 警告
- [ ] 危険キーアクセス拒否 → `forbidden_property_access`（[security.md](./specs/security.md)）
- [ ] `component path as name` の登録（hyogen ブロック内）
- [ ] `{{ name({ ... }) }}` による component 呼び出し（単行出力のみ → `component_multiline_output`）
- [ ] component front matter からの props 定義・型検証（警告: `prop_*`）
- [ ] エイリアス衝突 → `duplicate_component_alias` / `alias_collision`
- [ ] スコープ: 後勝ち。component `as` 衝突はエラー（[variables.md](./specs/variables.md)）

### テスト

- [ ] `.doc_root` 基準の include / component 解決
- [ ] props 型不一致・未知 props・必須欠落
- [ ] 循環 include
- [ ] `__proto__` 等の拒否

### 参照 spec

[paths.md](./specs/paths.md) / [templating.md](./specs/templating.md) / [security.md](./specs/security.md)

---

## v0.3.0 — ロジック（if / each）

本文を挟む構造ディレクティブと、step 2 / step 5 の分離を実装する。

### 実装

- [ ] hyogen ブロック内の宣言・代入（`const` / `let`、ホワイトリスト準拠 → [dsl.md](./specs/dsl.md)）
- [ ] `if` / `else if` / `else` / `endif`（Pug 風。step 5 展開）
- [ ] `each` / `endeach`（Pug 風。step 5 展開）
- [ ] `if` / `each` 構造ネスト合計 20 → `nest_limit_exceeded` 警告（[logic.md](./specs/logic.md)）
- [ ] 条件式・ループ式は `{{ }}` と同じ式サブセット
- [ ] パイプライン順の確定: 宣言（step 2）→ if/each 展開（step 5）→ `{{ }}`（step 6）

### テスト

- [ ] if 分岐（else / else if 含む）
- [ ] each（配列・オブジェクトの配列）
- [ ] if 内 each / each 内 if
- [ ] ネスト 20 超のスキップ
- [ ] 未対 `if` → `parse_error`

### 参照 spec

[dsl.md](./specs/dsl.md) / [logic.md](./specs/logic.md) / [pipeline.md](./specs/pipeline.md)

---

## v0.4.0 — extend / block

レイアウト継承をパイプライン上 include より先に解決する。

### 実装

- [ ] `extend <path>` / `block <name>` … `endblock`
- [ ] 子テンプレート: block 以外の本文は無視
- [ ] 未上書き block は layout デフォルトを残す
- [ ] extend は include より先（step 3）
- [ ] component 内 extend → `extend_in_component` 警告でスキップ
- [ ] extend 先頭 hyogen 必須（その上の front matter は可）

### テスト

- [ ] 単一継承の block 上書き
- [ ] 未上書き block のデフォルト残存
- [ ] component 内 extend のスキップ

### 参照 spec

[templating.md](./specs/templating.md) / [pipeline.md](./specs/pipeline.md)

---

## v0.5.0 — SSG（build）と Node 拡張

一括ビルドとサーバ専用 context、リモート取得を載せる。

### 実装

- [ ] `build()`（[api.md](./specs/api.md)）
- [ ] 入力: パス列挙 + glob（picomatch + fast-glob 想定）
- [ ] `_` partial のエントリ除外（マッチ後フィルタ。glob 明示で上書き可）
- [ ] エントリ指定 → 依存（include / component / extend）を辿る走査
- [ ] `serverContext`（`renderServer` / `build` のみ）
- [ ] リモート URL の include / component（Node のみ。デフォルト loader 拡張）
- [ ] `renderClient` に `serverContext` 相当 → `server_context_on_client` エラー

### テスト

- [ ] glob + `_` フィルタ
- [ ] 依存グラフ走査
- [ ] `serverContext` が CSR に渡らないこと
- [ ] リモート include（モック fetch）

### 参照 spec

[api.md](./specs/api.md) / [paths.md](./specs/paths.md) / [pipeline.md](./specs/pipeline.md)

---

## v0.6.0 — CSR（renderClient）

ブラウザ実行向け API と loader 必須の制約を実装する。

### 実装

- [ ] `renderClient()`（loader **必須**）
- [ ] ライブラリ本体はネットワーク取得しない（loader に委譲）
- [ ] 同一オリジン想定のパス解決（[paths.md](./specs/paths.md)）
- [ ] Node / ブラウザで共通のコアと、環境差（デフォルト loader の有無）の分離

### テスト

- [ ] loader 未指定時のエラー
- [ ] 注入 loader 経由の include / component
- [ ] ブラウザバンドル可能な公開面（import パスの確認）

### 参照 spec

[api.md](./specs/api.md) / [pipeline.md](./specs/pipeline.md)

---

## v0.7.0 — DSL 残り・式の完成度

ホワイトリスト上の残り構文とショートハンド、セキュリティ警告を揃える。

### 実装

- [ ] `@@` ショートハンド（`@hg` と等価 → [dsl.md](./specs/dsl.md)）
- [ ] `for (init; cond; update)` / `do { ... } while (cond)`（hyogen ブロック内）
- [ ] 三項演算子（`{{ }}` 内）
- [ ] `.toLocaleString(...)` の許可
- [ ] テンプレートリテラル内 `${}` の式制限
- [ ] コードフェンス内 hyogen ブロックの無視
- [ ] context 値の危険パターン警告 → `suspicious_context_value`（正規表現は実装時調整 → [need_decision.md](./need_decision.md)）

### テスト

- [ ] `@@` と `@hg` の等価性
- [ ] for / do-while
- [ ] 三項・テンプレートリテラル
- [ ] フェンス内 DSL が実行されないこと

### 参照 spec

[dsl.md](./specs/dsl.md) / [security.md](./specs/security.md)

---

## v0.8.0 — 仕上げ・ドキュメント追随

実装と spec の差分を埋め、利用例と回帰テストを厚くする。

### 実装

- [ ] [need_decision.md](./need_decision.md) の未決が残っていれば spec 更新または実装反映
- [ ] each 内 component 呼び出しの公式例を [templating.md](./specs/templating.md) に追記
- [ ] エラーログ出力形式の統一（[api.md](./specs/api.md) の例）
- [ ] ビルトイン関数の要否判断（必要なら spec 追加のうえ最小セット）

### テスト

- [ ] spec 各章に対応する統合テスト（代表 fixture）
- [ ] 回帰: 警告は中断しない・エラーは中断する

---

## v0.9.0 以降（未定）

以下は **v0.x の追加候補**。順序・採否は実装の進捗と spec 更新に従う。

- パフォーマンス計測とホットパス改善
- 追加ビルトイン関数・許可メソッド
- **mixin**（保留中。必要が出た時点で spec 再検討 → [need_decision.md](./need_decision.md)）
- プレビュー向け（未展開 `{{ }}` 許容）の明示的オプション化
- HTML 出力レイヤ（当面は Markdown 出力が第一。後段責務として分離しうる）

---

## バージョン運用メモ

| ルール | 内容 |
|--------|------|
| 形式 | SemVer（`MAJOR.MINOR.PATCH`） |
| 本ロードマップ | **`v0.n.0` = MINOR 相当の機能塊**（PATCH は同一塊内の修正） |
| `v1.0.0` | API・仕様安定の宣言。タイミングはメンテナー判断 |
| spec 変更 | 実装前に [specs/](./specs/) を更新し、ロードマップのチェック項目と同期する |

---

以上
