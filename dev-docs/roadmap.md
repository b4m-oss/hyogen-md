# 開発ロードマップ

[SemVer](https://semver.org/) に従う。`v1.0.0` への引き上げ判断はメンテナーが行う。  
本ロードマップは **`v0.n.0` を機能単位の区切り**として記述する（日付・リリース時期の約束はしない）。

仕様の正: [main.md](./main.md)、[specs/](./specs/)、[need_decision.md](./need_decision.md)  
実装の進め方（TDD）: [development.md](./development.md)  
リポジトリ運用: [repository.md](./repository.md)

完了済み（`v0.1.0`〜`v0.10.0` / docs.1〜4）: [_archive/roadmap/](./_archive/roadmap/)

各バージョンの「テスト」節は [development.md](./development.md) の手順に従い、**テスト仕様書 → Red → Green → Refactor** で埋める。

---

## 優先順位（目安）

1. **v0.10.0-docs.5〜docs.8** — ドキュメントサイト（Nuxt Content・Playground 内包・テーマ・API/構文網羅）→ [docs-site.md](./docs-site.md)
2. **v0.11.0** — データソースのインポート（API）※ docs.8 完成後
3. **v0.12.0** — TOC 専用ヘルパ
4. **v0.13.0** — 許可メソッド追加（`.length` / `.slice` 等）

詳細方針は [need_decision.md](./need_decision.md)。

**方針:** docs.5〜8 のあいだは **ライブラリ新機能を追加しない**。機能開発はドキュメントサイト完成後に **v0.11.0** から再開する。

---

## v0.10.0-docs.5〜docs.8 — ドキュメントサイト

製品仕様の正: [docs-site.md](./docs-site.md)。版は **`v0.10.0-docs.5` から `docs.8` まで**。npm / `app` の SemVer は上げない。

### 必須要件

- [ ] **Nuxt Content** によるドキュメントサイト（`docs-site/`）
- [ ] 現行 Playground を **サイト内へ移植**（Vue。機能パリティは [playground.md](./playground.md)）
- [ ] **dark / light / system（OS 準拠）** の輝度モード切替（サイト全体 + Playground）
- [ ] **現時点の公開 API すべて**と、**備えているテンプレート構文の網羅**（正は [api.md](./specs/api.md) / [specs/](./specs/)）
- [ ] Netlify 公開 + README（英・日）導線

### 実装単位

| 版 | 内容 |
|----|------|
| **docs.5** | サイト骨格・Netlify・テーマ土台 |
| **docs.6** | Playground 移植・テーマ共有・**ペイン幅ドラッグ可変** |
| **docs.7** | API / テンプレート構文のコンテンツ網羅 |
| **docs.8** | 仕上げ・導線・完成判定 |

### 完了条件

[docs-site.md](./docs-site.md)「完成判定」を満たしたら、本節をアーカイブし **v0.11.0** に進む。

### 参照

[docs-site.md](./docs-site.md) / [playground.md](./playground.md) / [repository.md](./repository.md)

---

## v0.11.0 — データソースのインポート（API）

**前提:** v0.10.0-docs.8（ドキュメントサイト）完了後。

外部データ（YAML / JSON / CSV 等）を **API 側のみ**で読み、変数へバインドする。DSL では読まない。

### 実装（メモ）

- [ ] 公開 API でデータファイルを読み込む経路を追加（詳細形は実装前に [api.md](./specs/api.md) を更新）
- [ ] **複数ファイル**読込可
- [ ] 読み結果を context / テンプレート変数へバインド
- [ ] 対応形式: 少なくとも YAML / JSON。CSV は同バージョンまたは直後の PATCH で可
- [ ] DSL の `import` / `require` は引き続き禁止（[dsl.md](./specs/dsl.md)）
- [ ] ドキュメントサイトに API ページを追加（サイトが正の利用者向け面）

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
- [ ] ドキュメントサイトに TOC ページを追加

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
- [ ] ドキュメントサイトの式リファレンスを更新

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
| Playground シーダーの複数パターン化 | 採用時期未定（[wishlist.md](./wishlist.md)） |
| Playground Zip 出力 | 採用時期未定 |
| component の見出し適合 | 採用時期未定 |
| ナビゲーション機能 | 現状維持・先送り |
| front matter の `@hg` 内読み込み | 採用時期未定 |
| `@hg` 内の `echo` | 採用時期未定。現状は `{{ }}` |
| エディタ向けシンタックスハイライト（VS Code 等） | **採用時期未定**。Playground 上のハイライトとは別 |

詳細: [need_decision.md](./need_decision.md)

---

## 対象外・配布

| 項目 | 方針 |
|------|------|
| HTML 出力レイヤ | **対象外**。ライブラリは Markdown 出力のみ |
| npm 公開 | **v0.10.0 で初回公開済み**（`app/` の `dist` のみ）。サイト・Playground は同梱しない。CD は `release` → [repository.md](./repository.md) |
| ドキュメントサイト | **v0.10.0-docs.5〜8 で構築**（[docs-site.md](./docs-site.md)）。利用者向けの正はサイト。`dev-docs/` はメンテナー向け |
| mixin | 無期限保留（[need_decision.md](./need_decision.md)） |

---

## バージョン運用メモ

| ルール | 内容 |
|--------|------|
| 形式 | SemVer（`MAJOR.MINOR.PATCH`） |
| 本ロードマップ | **`v0.n.0` = MINOR 相当の機能塊**。同一塊内の修正・仕様寄せは **PATCH**（例: `v0.9.1` / `v0.9.2`） |
| git tag と npm | **一致させる**（例: tag `v0.10.0` ↔ npm `0.10.0`）。**npm publish は `release` マージ（CD）** → [repository.md](./repository.md) |
| docs トラック | サイト・導線・インフラは **`v0.10.0-docs.n`**（npm は上げない）→ [repository.md](./repository.md) / [docs-site.md](./docs-site.md) |
| ブランチ | `feat` → `dev-vX.Y.Z` → `develop` → `main` → `release`。docs は `main` 直マージ可 → [repository.md](./repository.md) |
| `app` と版 | ライブラリに機能差分が無くても、リリース版では **`app/package.json` の version を tag / npm に揃える** |
| README | 英語 `README.md` を **リポジトリ根と `app/README.md` で同内容同期**。日本語は `README_ja.md`。利用者導線はドキュメントサイト優先 |
| `v1.0.0` | API・仕様安定の宣言。タイミングはメンテナー判断 |
| spec 変更 | 実装前に [specs/](./specs/) を更新し、ロードマップのチェック項目と同期する |
| 完了バージョン | [_archive/roadmap/](./_archive/roadmap/) へ移す |

---

以上
