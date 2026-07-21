# 開発ロードマップ

[SemVer](https://semver.org/) に従う。`v1.0.0` への引き上げ判断はメンテナーが行う。  
本ロードマップは **`v0.n.0` を機能単位の区切り**として記述する（日付・リリース時期の約束はしない）。  
プレイグラウンド基盤（`v0.9.0`）直後の修正は **`v0.9.1` / `v0.9.2`（PATCH）** で切り出す。

仕様の正: [main.md](./main.md)、[specs/](./specs/)、[need_decision.md](./need_decision.md)  
実装の進め方（TDD）: [development.md](./development.md)

完了済み（`v0.1.0`〜`v0.8.0`）: [_archive/roadmap/](./_archive/roadmap/)

各バージョンの「テスト」節は [development.md](./development.md) の手順に従い、**テスト仕様書 → Red → Green → Refactor** で埋める。

---

## 優先順位（目安）

1. **v0.9.1** — outDir の `_` 除外を仕様どおりに
2. **v0.9.2** — 出力 Markdown の余分な空行の改善（ライブラリ本体）
3. **v0.10.0** — プレイグラウンド UX（アクションメニュー + `@hg` ハイライト）
4. **v0.11.0** — データソースのインポート（API）
5. **v0.12.0** — TOC 専用ヘルパ
6. **v0.13.0** — 許可メソッド追加（`.length` / `.slice` 等）

詳細方針は [need_decision.md](./need_decision.md)。

---

## v0.9.0 — プレイグラウンド（完了）

同リポジトリ内のローカル向けプレイグラウンド。ドキュメントサイトは作らない。npm 公開は前提にしない。

製品仕様の正: [playground.md](./playground.md)

### 実装

- [x] `playground/`（Vite + Vue + TypeScript + CodeMirror 6）
- [x] バーチャル FS（実ディスクなし）。`src` 編集可 / `outDir` 読み取り専用
- [x] 左ペインファイラー（ネスト・作成・削除・リネーム・フォルダ）
- [x] エディタ + 自動 render（デバウンス）。開いている 1 ファイルだけ `outDir` へ
- [x] プレビュー: 展開後 MD + HTML 見た目。診断パネル（エラー／警告）
- [x] `localStorage` 永続化 + 「Reset to demo」
- [x] デモ寄りシード（extend / if / each / component 等）
- [x] Vite alias で `../app` ソースを参照。固定 context（UI なし）

### テスト

テスト仕様書: [app/test/specs/v0.9.0.md](../app/test/specs/v0.9.0.md)

- [x] 仮想 FS CRUD・永続化・Reset
- [x] loader 経由で include / component が解決できること
- [x] 開いている 1 ファイルの src → outDir 反映

### 参照

[playground.md](./playground.md) / [need_decision.md](./need_decision.md) / [api.md](./specs/api.md) / [main.md](./main.md)

後続 PATCH / MINOR: `v0.9.1`〜`v0.10.0`。

---

## v0.9.1 — outDir の `_` 除外

Playground の outDir を、SSG / SSR のエントリ除外（[pipeline.md](./specs/pipeline.md)）に揃える。

製品仕様: [playground.md](./playground.md)

### 実装

- [ ] `_` で始まるファイル名を outDir に書かない／ツリーに出さない
- [ ] `_` で始まるディレクトリ配下を outDir に書かない／ツリーに出さない
- [ ] `src` には `_` partial を置ける（include / component 参照用）。開いてプレビューすること自体は可

### テスト

- [ ] テスト仕様書: `app/test/specs/v0.9.1.md`（または playground 側相当）
- [ ] `_` ファイル・`_` ディレクトリ配下が outDir に出ないこと
- [ ] 通常エントリの src → outDir は従来どおり

### 参照

[playground.md](./playground.md) / [pipeline.md](./specs/pipeline.md) / [need_decision.md](./need_decision.md)

---

## v0.9.2 — 出力 Markdown の空行改善

ディレクティブ除去・`each` 等の副作用で増える空行を抑え、手書き Markdown に寄せる。**ライブラリ本体で直す**（Playground のみの補正はしない）。

方針の正: [pipeline.md](./specs/pipeline.md)

### 実装

- [ ] 実装前に [pipeline.md](./specs/pipeline.md) のアルゴリズム詳細を詰める（隣接改行の畳み方、`each` 展開時の opener/closer 扱い等）
- [ ] `stripHgComments` / 構造展開まわりで、意図したブロック構造（連続リスト・段落）が保たれるようにする
- [ ] 著者ソースに明示された空行は尊重する

### テスト

- [ ] テスト仕様書: `app/test/specs/v0.9.2.md`
- [ ] `each` で生成したリストが項目間の余分な空行で切れないこと
- [ ] hyogen コメント除去後にリスト・段落が不必要に開かないこと

### 参照

[pipeline.md](./specs/pipeline.md) / [need_decision.md](./need_decision.md) / [playground.md](./playground.md)

---

## v0.10.0 — プレイグラウンド UX

Playground の操作・可読性を製品として揃える（いずれも **優先度高**。仕様は [playground.md](./playground.md)）。

### 実装

- [ ] ファイル操作をスリードットのアクションメニューへ（`src`・フォルダ・ファイル右側）
- [ ] `@hg` / `@@` 内のシンタックスハイライト（**Playground 限定**。初版は JS 近似で可）
- [ ]（任意）`{{ }}` も見やすくする

### テスト

- [ ] テスト仕様書: `app/test/specs/v0.10.0.md`（純ロジックがあれば）／UI は手動
- [ ]（手動）アクションメニューから create / rename / delete できること
- [ ]（手動）`@hg` / `@@` 内がコメント一色ではなく色分けされること

### 参照

[playground.md](./playground.md) / [need_decision.md](./need_decision.md) / [dsl.md](./specs/dsl.md)

---

## v0.11.0 — データソースのインポート（API）

外部データ（YAML / JSON / CSV 等）を **API 側のみ**で読み、変数へバインドする。DSL では読まない。

### 実装（メモ）

- [ ] 公開 API でデータファイルを読み込む経路を追加（詳細形は実装前に [api.md](./specs/api.md) を更新）
- [ ] **複数ファイル**読込可
- [ ] 読み結果を context / テンプレート変数へバインド
- [ ] 対応形式: 少なくとも YAML / JSON。CSV は同バージョンまたは直後で可
- [ ] DSL の `import` / `require` は引き続き禁止（[dsl.md](./specs/dsl.md)）

### テスト

- [ ] テスト仕様書: `app/test/specs/v0.11.0.md`
- [ ] 単一・複数ファイルの読込と変数参照
- [ ] 欠落ファイル等のエラー挙動

### 参照

[need_decision.md](./need_decision.md) / [api.md](./specs/api.md) / [dsl.md](./specs/dsl.md)

---

## v0.12.0 — TOC 専用ヘルパ

ページ内見出しをパースし、TOC を生成する **専用ヘルパ**を入れる。

### 実装（メモ）

- [ ] 構文・配置・見出し抽出ルールを [specs/](./specs/) に確定してから実装
- [ ] 専用ヘルパとして提供（詳細は後続で詰める）
- [ ] 出力は Markdown（リスト等）。HTML 化は対象外

### テスト

- [ ] テスト仕様書: `app/test/specs/v0.12.0.md`
- [ ] 代表的な見出し階層から TOC が生成されること

### 参照

[need_decision.md](./need_decision.md) / [wishlist.md](./wishlist.md)（個人メモ）

---

## v0.13.0 — 許可メソッド追加

式内の許可メソッドを拡張する（ビルトイン関数は当面なしのまま）。

### 実装（メモ）

- [ ] `.length` を許可
- [ ] `.slice` など配列操作系を最小セットで許可（都度 [dsl.md](./specs/dsl.md) 更新）
- [ ] ビルトイン関数は導入しない（必要なら別バージョンで再検討）

### テスト

- [ ] テスト仕様書: `app/test/specs/v0.13.0.md`
- [ ] 許可メソッドの正常系・未許可メソッドの拒否

### 参照

[need_decision.md](./need_decision.md) / [dsl.md](./specs/dsl.md)

---

## トリガー待ち・採用時期未定

順序・時期は未定。ロードマップ上の番号は振らない。

| 項目 | 方針 |
|------|------|
| パフォーマンス計測とホットパス改善 | **当面やらない**。実利用で遅さを感じたら、計測 → 改善へすぐ移す |
| 未展開 `{{ }}` の明示的オプション化 | **不要（後回し）**。現状のプレビュー許容で十分 |
| component の見出し適合 | 採用時期未定 |
| ナビゲーション機能 | 現状維持・先送り |
| front matter の `@hg` 内読み込み | 採用時期未定 |
| `@hg` 内の `echo` | 採用時期未定。現状は `{{ }}` |
| エディタ向けシンタックスハイライト（VS Code 等） | **採用時期未定**。Playground 上のハイライト（v0.10.0）とは別。エコシステム展開は後回し |

詳細: [need_decision.md](./need_decision.md)

---

## 対象外・配布

| 項目 | 方針 |
|------|------|
| HTML 出力レイヤ | **対象外**。ライブラリは Markdown 出力のみ |
| npm 公開 | **時期は未定**。プレイグラウンドのためには不要 |
| ドキュメントサイト | 当面作らない（プレイグラウンドで足りる想定） |
| mixin | 無期限保留（[need_decision.md](./need_decision.md)） |

---

## バージョン運用メモ

| ルール | 内容 |
|--------|------|
| 形式 | SemVer（`MAJOR.MINOR.PATCH`） |
| 本ロードマップ | **`v0.n.0` = MINOR 相当の機能塊**。同一塊内の修正・仕様寄せは **PATCH**（例: `v0.9.1` / `v0.9.2`） |
| `v1.0.0` | API・仕様安定の宣言。タイミングはメンテナー判断 |
| spec 変更 | 実装前に [specs/](./specs/) を更新し、ロードマップのチェック項目と同期する |
| 完了バージョン | [_archive/roadmap/](./_archive/roadmap/) へ移す |

---

以上
