# 要意思決定・後続定義事項

確定済みの仕様は各 [specs](./specs/) を正とする。  
ここに残すのは **未決・後続** のみ。バージョン割当の正は [roadmap.md](./roadmap.md)。

---

## 保留（当面実装しない）

| 項目 | 方針 |
|------|------|
| **mixin** | 廃止（保留）。component / include で代替。必要時に将来実装 |

---

## バージョン割当（実装予定）

| バージョン | 項目 | 方針 | 参照 |
|------------|------|------|------|
| **v0.9.0** | プレイグラウンド基盤 | **完了**。詳細は [playground.md](./playground.md) | [_archive/roadmap/v0.9.0.md](./_archive/roadmap/v0.9.0.md) |
| **v0.9.1** | outDir の `_` 除外 | **完了** | [playground.md](./playground.md), [_archive/roadmap/v0.9.1.md](./_archive/roadmap/v0.9.1.md) |
| **v0.9.2** | 出力 Markdown の空行改善 | **完了** | [pipeline.md](./specs/pipeline.md), [_archive/roadmap/v0.9.2.md](./_archive/roadmap/v0.9.2.md) |
| **v0.10.0** | プレイグラウンド UX + **npm 初回公開** | **完了**。`@b4moss/hyogen-md@0.10.0` 公開済み。Playground はパッケージに含めない | [playground.md](./playground.md), [_archive/roadmap/v0.10.0.md](./_archive/roadmap/v0.10.0.md) |
| **v0.10.0-docs.5〜8** | ドキュメントサイト | **進行中**。Nuxt Content・Playground 内包・dark/light/system・API/構文網羅。ライブラリ新機能なし。完了後に v0.11.0 | [docs-site.md](./docs-site.md), [roadmap.md](./roadmap.md) |
| **v0.11.0** | データソースのインポート | **DSL では読まない**。**API 側のみ**。YAML / JSON / CSV 等 → 変数。**複数ファイル**可。詳細 API は実装前に spec 更新。**docs.8 完了後** | [api.md](./specs/api.md), [dsl.md](./specs/dsl.md) |
| **v0.12.0** | TOC | **専用ヘルパ**。構文・配置・見出し抽出の詳細は後で詰める | [roadmap.md](./roadmap.md) |
| **v0.13.0** | 許可メソッドの追加 | 実装は当面 `.toLocaleString` のみ。追加候補: `.length` / `.slice` など配列操作系 | [dsl.md](./specs/dsl.md) |

## トリガー待ち・方針のみ

| 項目 | 方針 | 参照 |
|------|------|------|
| ビルトイン関数 | **当面なし**。必要なら別バージョンで spec 追加のうえ最小セット | [dsl.md](./specs/dsl.md) |
| パフォーマンス | **当面やらない**。体感遅さが出たら計測基盤 → ホットパス改善 | [roadmap.md](./roadmap.md) |
| 未展開 `{{ }}` の明示オプション | **不要（後回し）**。現状のプレビュー許容で十分 | [pipeline.md](./specs/pipeline.md), [variables.md](./specs/variables.md) |

## 配布・公開（v0.10.0 で確定）

| 項目 | 方針 | 参照 |
|------|------|------|
| npm 公開 | **v0.10.0 で初回公開済み**（`@b4moss/hyogen-md`。公開物は `app/` の `dist` のみ。Playground は同梱しない） | [roadmap.md](./roadmap.md) |
| 版番号 | **git tag `v0.10.0` = npm `0.10.0`**。以降も tag と npm を一致。`app` にコード差分が無くてもリリース版では version を揃える | [roadmap.md](./roadmap.md) |
| タグ | リリースは **`v0.10.0`（正式）** を切る。alpha 系の遡及付与は不要 | [roadmap.md](./roadmap.md) |
| GitHub | 公開用リポジトリ **`https://github.com/b4m-oss/hyogen-md`**（homepage） | — |
| npm 名 | **`@b4moss/hyogen-md`**（製品名 hyogen.md とは別に、パス／パッケージは `hyogen-md`） | [note.md](./note.md) |
| LICENSE | **MIT**（リポジトリ根および `app/package.json` の `license`） | — |
| README | **英語**の `README.md` をリポジトリ根と **`app/README.md` で同内容同期**。同内容の日本語を `README_ja.md`（根・必要なら `app/` も同期） | [roadmap.md](./roadmap.md) |
| CHANGELOG | **`user-docs/changelog.md`**（日本語: `changelog_ja.md`）。README からはリンクする | — |
| `dev-docs/` | **日本語のまま**（仕様の正・メンテナー向け）。利用者向けは `user-docs/` / README | [main.md](./main.md) |
| 公開前チェック | `build` / `test` / `npm pack --dry-run` 等を実施してから publish | [roadmap.md](./roadmap.md) |
| ドキュメントサイト | **v0.10.0-docs.5〜8** で構築（Nuxt Content・Playground 内包）。正: [docs-site.md](./docs-site.md) | [docs-site.md](./docs-site.md), [roadmap.md](./roadmap.md) |

## リポジトリ運用（v0.10.0-docs で確定）

正: [repository.md](./repository.md)。

| 項目 | 方針 | 参照 |
|------|------|------|
| docs 版 | 以降の docs／インフラ／導線は **`v0.10.0-docs.n`** | [repository.md](./repository.md) |
| 長期ブランチ | **`develop`**（維持）／**`main`**（いつでもリリース可）／**`release`**（npm 用） | 同上 |
| 機能開発 | `feat/*` → `dev-vX.Y.Z` →（roadmap 達成）`develop` → `main` → `release` | 同上 |
| docs / hotfix | docs は `main` 直マージ可。hotfix は `main` → `release` 可 | 同上 |
| CI | GitHub PR（base: `dev-v*` / `develop`） | 同上 |
| CD | **`release` へマージ → npm publish** | 同上 |
| Playground | 当面 Netlify 単独公開。**docs.6 でドキュメントサイト内へ移植**（[docs-site.md](./docs-site.md)）。npm 非同梱 | [playground.md](./playground.md), [docs-site.md](./docs-site.md) |
| ドキュメントサイト | `docs-site/` + Netlify。docs.8 完成後が利用者向けの正 | [docs-site.md](./docs-site.md) |
| `main` 直接更新 | 通常禁止。例外: **`@kohki-shikata` の force push** | [repository.md](./repository.md) |

## 採用時期未定（先送り）

| 項目 | 方針 | 参照 |
|------|------|------|
| component の見出し適合 | 親の見出し深さに合わせて component 内見出しを調整。必要時に再検討 | [pipeline.md](./specs/pipeline.md) |
| ナビゲーション機能 | 現状維持（詳細未定義のまま先送り） | — |
| front matter の `@hg` 内読み込み | 採用時期未定 | [variables.md](./specs/variables.md) |
| `@hg` 内の `echo`（変数の本文展開） | 採用時期未定。現状は `{{ }}` を使う | [dsl.md](./specs/dsl.md) |
| エディタ向けシンタックスハイライト（VS Code 等） | 採用時期未定。Playground 上のハイライトとは別 | [playground.md](./playground.md), [wishlist.md](./wishlist.md) |

## 対象外（ロードマップから除外）

| 項目 | 方針 | 参照 |
|------|------|------|
| HTML 出力レイヤ | ライブラリは **Markdown 出力のみ**。HTML 化は利用側 | [pipeline.md](./specs/pipeline.md), [main.md](./main.md) |

---

## 実装時の委任（方針確定済み）

| 項目 | 方針 | 参照 |
|------|------|------|
| `HyogenError` / `HyogenWarning` の詳細型 | api.md の概要型をベースに実装 | [api.md](./specs/api.md) |
| glob 実装 | Vite 系。picomatch + fast-glob 等 | [api.md](./specs/api.md) |
| 英語メッセージ | [messages.en.json](./specs/messages.en.json) を正 | [api.md](./specs/api.md) |
| 診断ログ形式 | `formatDiagnosticLog`（console 自動出力なし） | [api.md](./specs/api.md) |
| suspicious 正規表現 | security.md に確定転記済み | [security.md](./specs/security.md) |
| each 内 component | 可・ループ変数は props に見える。公式例あり | [templating.md](./specs/templating.md) |
| プレイグラウンド UI | Vite+Vue / CM6 / 仮想 FS / 自動 render 等。確定内容は playground.md。docs.6 でサイト内移植。テーマ dark/light/system は docs.5〜 | [playground.md](./playground.md), [docs-site.md](./docs-site.md) |

---

## 転記済み（参照用）

| 領域 | 文書 |
|------|------|
| API / loader / エラーコード | [api.md](./specs/api.md), [messages.en.json](./specs/messages.en.json) |
| セキュリティ / 危険キー / context 警告 | [security.md](./specs/security.md) |
| Component / extend / include | [templating.md](./specs/templating.md) |
| 変数 / props 推論 | [variables.md](./specs/variables.md) |
| パイプライン順 / if | [pipeline.md](./specs/pipeline.md), [dsl.md](./specs/dsl.md) |
| DSL / ショートハンド `@@` | [dsl.md](./specs/dsl.md) |
| 完了ロードマップ | [_archive/roadmap/](./_archive/roadmap/) |
| プレイグラウンド | [playground.md](./playground.md) |
| ドキュメントサイト | [docs-site.md](./docs-site.md) |
| リポジトリ運用 | [repository.md](./repository.md) |
