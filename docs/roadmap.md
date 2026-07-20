# 開発ロードマップ

[SemVer](https://semver.org/) に従う。`v1.0.0` への引き上げ判断はメンテナーが行う。  
本ロードマップは **`v0.n.0` を機能単位の区切り**として記述する（日付・リリース時期の約束はしない）。

仕様の正: [main.md](./main.md)、[specs/](./specs/)、[need_decision.md](./need_decision.md)  
実装の進め方（TDD）: [development.md](./development.md)

完了済み（`v0.1.0`〜`v0.8.0`）: [_archive/roadmap/](./_archive/roadmap/)

各バージョンの「テスト」節は [development.md](./development.md) の手順に従い、**テスト仕様書 → Red → Green → Refactor** で埋める。

---

## 優先順位（目安）

1. **v0.9.0** — プレイグラウンド（最優先）
2. **v0.10.0** — データソースのインポート（API）
3. **v0.11.0** — TOC 専用ヘルパ
4. **v0.12.0** — 許可メソッド追加（`.length` / `.slice` 等）

詳細方針は [need_decision.md](./need_decision.md)。

---

## v0.9.0 — プレイグラウンド

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

テスト仕様書: [app/test/specs/v0.9.0.md](../app/test/specs/v0.9.0.md)（[development.md](./development.md) の TDD 手順に従う。UI は手動）

- [x] 仮想 FS CRUD・永続化・Reset
- [x] loader 経由で include / component が解決できること
- [x] 開いている 1 ファイルの src → outDir 反映

### 参照

[playground.md](./playground.md) / [need_decision.md](./need_decision.md) / [api.md](./specs/api.md) / [main.md](./main.md)

---

## v0.10.0 — データソースのインポート（API）

外部データ（YAML / JSON / CSV 等）を **API 側のみ**で読み、変数へバインドする。DSL では読まない。

### 実装（メモ）

- [ ] 公開 API でデータファイルを読み込む経路を追加（詳細形は実装前に [api.md](./specs/api.md) を更新）
- [ ] **複数ファイル**読込可
- [ ] 読み結果を context / テンプレート変数へバインド
- [ ] 対応形式: 少なくとも YAML / JSON。CSV は同バージョンまたは直後で可
- [ ] DSL の `import` / `require` は引き続き禁止（[dsl.md](./specs/dsl.md)）

### テスト

- [ ] テスト仕様書: `app/test/specs/v0.10.0.md`
- [ ] 単一・複数ファイルの読込と変数参照
- [ ] 欠落ファイル等のエラー挙動

### 参照

[need_decision.md](./need_decision.md) / [api.md](./specs/api.md) / [dsl.md](./specs/dsl.md)

---

## v0.11.0 — TOC 専用ヘルパ

ページ内見出しをパースし、TOC を生成する **専用ヘルパ**を入れる。

### 実装（メモ）

- [ ] 構文・配置・見出し抽出ルールを [specs/](./specs/) に確定してから実装
- [ ] 専用ヘルパとして提供（詳細は後続で詰める）
- [ ] 出力は Markdown（リスト等）。HTML 化は対象外

### テスト

- [ ] テスト仕様書: `app/test/specs/v0.11.0.md`
- [ ] 代表的な見出し階層から TOC が生成されること

### 参照

[need_decision.md](./need_decision.md) / [wishlist.md](./wishlist.md)（個人メモ）

---

## v0.12.0 — 許可メソッド追加

式内の許可メソッドを拡張する（ビルトイン関数は当面なしのまま）。

### 実装（メモ）

- [ ] `.length` を許可
- [ ] `.slice` など配列操作系を最小セットで許可（都度 [dsl.md](./specs/dsl.md) 更新）
- [ ] ビルトイン関数は導入しない（必要なら別バージョンで再検討）

### テスト

- [ ] テスト仕様書: `app/test/specs/v0.12.0.md`
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
| 本ロードマップ | **`v0.n.0` = MINOR 相当の機能塊**（PATCH は同一塊内の修正） |
| `v1.0.0` | API・仕様安定の宣言。タイミングはメンテナー判断 |
| spec 変更 | 実装前に [specs/](./specs/) を更新し、ロードマップのチェック項目と同期する |
| 完了バージョン | [_archive/roadmap/](./_archive/roadmap/) へ移す |

---

以上
