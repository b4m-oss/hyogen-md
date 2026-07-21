# Changelog

ライブラリ変更と Playground 専用を区別して記載します。alpha は開発用マーカーで、正式リリース tag は `v0.10.0` です。

English: [changelog.md](./changelog.md)

### 0.10.0 — Playground UX + npm 初回公開

Playground（npm 非同梱）:

- ファイル操作のアクションメニュー（⋯）
- `@hg` / `@@` シンタックスハイライト（JS 近似）と `{{ }}` の軽い装飾
- 非エントリ向け Diagnostics **note**（例: layout）。Preview はソース Markdown
- ファイラー UX（OUT の read-only 見た目、アイコン）。Reset 時は `/src` 全体を `/out` へ再 render
- Markdown タブの highlight.js 色分け

ライブラリ配布:

- `app/` から `@b4moss/hyogen-md@0.10.0` を初回公開（`dist` + README / LICENSE。`*.map` 除外）
- git tag `v0.10.0` と npm 版を一致
- ドキュメント構成: `dev-docs/`（メンテナー）、`user-docs/`（changelog 等）

### 0.10.0-beta.3

- **Packaging:** npm tarball から `*.map` を除外。Vite `minify: true` を明示
- **Tooling:** Makefile 拡充（`size` / `pack` / `check` / playground 向け）
- **Docs:** README バッジ（npm / license / node / coverage）

### 0.10.0-beta.2

- **Docs / packaging:** MIT LICENSE、日英 README + CHANGELOG、パッケージ名 `@b4moss/hyogen-md`、GitHub homepage `b4m-oss/hyogen-md`

### 0.10.0-beta.1

- **Docs:** npm 初回公開方針（tag ↔ npm 版、MIT、README 同期、GitHub homepage）

### 0.9.2 — ライブラリ

- 展開後 Markdown の余分な空行を引き締め。以前のビルドより出力が変わりうる

### 0.9.1 — Playground

- `_` 始まりのファイル / ディレクトリを outDir から除外。SRC リネーム・アンハイライト時の OUT 同期

### 0.9.0 — Playground

- ローカル Playground: 仮想 FS、ファイラー、CodeMirror、自動 render、プレビュー、診断、デモシード、`localStorage`

### 0.8.0 — ライブラリ

- `formatDiagnosticLog`、`each` + `component`（式 props）、横断テスト / docs 仕上げ

### 0.7.0 — ライブラリ

- `@@` ショートハンド、三項・テンプレートリテラル、`for` / `do`–`while`、suspicious context 警告

### 0.6.0 — ライブラリ

- `renderClient` と `@b4moss/hyogen-md/client` 公開面

### 0.5.0 — ライブラリ

- `build`、`serverContext`、リモート loader

### 0.4.0 — ライブラリ

- `extend` / `block` レイアウト継承

### 0.3.0 — ライブラリ

- 宣言と `if` / `each`、演算子式

### 0.2.0 — ライブラリ

- パス解決、Node loader、`component`

### 0.1.0 — ライブラリ

- パイプライン MVP: `@hg`、front matter、`{{ }}`、`include`
