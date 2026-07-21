# hyogen.md（`@b4moss/hyogen-md`）

TypeScript / JavaScript 向けの拡張 Markdown テンプレートエンジンです。

制御構文は HTML コメント内（`@hg` … `@endhg` または `@@` … `@@`）に閉じるため、生ソースのプレビューを壊しにくいです。ライブラリの出力は **Markdown のみ**（HTML 化は利用側）。

- **パッケージ名:** `@b4moss/hyogen-md`
- **製品名:** hyogen.md（表現.md）
- **ライセンス:** MIT
- **English README:** [README.md](./README.md)
- **仕様（日本語）:** [docs/](https://github.com/b4m-oss/hyogen-md/tree/develop/docs)

> **Homepage:** [https://github.com/b4m-oss/hyogen-md](https://github.com/b4m-oss/hyogen-md)

本ファイルはリポジトリ根と `app/README_ja.md` で **同内容を同期**します。

---

## インストール

```bash
npm install @b4moss/hyogen-md
```

**Node.js >= 20** が必要です。

---

## クイックスタート

### クライアント / CSR（`@b4moss/hyogen-md/client`）

```ts
import { renderClient } from "@b4moss/hyogen-md/client";

const result = await renderClient(
  { path: "/src/index.md" },
  { siteName: "Demo" },
  {
    loader: async (path) => {
      // path → ファイル内容（仮想 FS・fetch など）
      return await readSomewhere(path);
    },
  },
);

console.log(result.markdown);
console.log(result.warnings);
```

### サーバ / SSR（`@b4moss/hyogen-md`）

```ts
import { renderServer, createNodeLoader } from "@b4moss/hyogen-md";

const result = await renderServer(
  { path: "./pages/index.md" },
  { title: "Hello" },
  {
    loader: createNodeLoader(),
    // serverContext: { apiKey: "…" }, // サーバ専用。renderClient では不可
  },
);
```

### SSG 一括（`build`）

```ts
import { build } from "@b4moss/hyogen-md";

const { files, warnings } = await build({
  input: "./src/**/*.md",
  outDir: "./out",
  context: { siteName: "Demo" },
});
```

API の詳細: [docs/specs/api.md](https://github.com/b4m-oss/hyogen-md/blob/develop/docs/specs/api.md)。

---

## リポジトリ構成

| パス | 役割 |
|------|------|
| `app/` | npm 公開するライブラリ（`dist` + README / LICENSE） |
| `playground/` | ローカル向け Vite + Vue プレイグラウンド（**npm 非同梱**） |
| `docs/` | 仕様・ロードマップ（**日本語**） |

### プレイグラウンド（ローカルのみ）

```bash
cd playground
npm install
npm run dev
```

Vite alias で `../app` を参照します。仮想 FS + `localStorage` のみ（実ディスクは使いません）。

---

## ステータス

**0.x** です。`1.0.0` まで API・出力は変わりえます。  
正式な npm 公開の目標は **`0.10.0`**（git tag `v0.10.0`）。現在の準備トラックは `0.10.0-beta.2` です。

Playground UX は **v0.10.0** マイルストーンに含まれますが、**npm の tarball には入りません**。

---

## Changelog

ライブラリ変更と Playground 専用を区別して記載します。alpha は開発用マーカーで、正式リリース tag は `v0.10.0` です。

### 0.10.0-beta.2

- **Docs / packaging:** MIT LICENSE、日英 README + CHANGELOG、パッケージ名 `@b4moss/hyogen-md`、GitHub homepage `b4m-oss/hyogen-md`

### 0.10.0-beta.1

- **Docs:** npm 初回公開方針（tag ↔ npm 版、MIT、README 同期、GitHub homepage）

### 0.10.0（予定）— Playground UX + npm 初回公開

Playground（npm 非同梱）:

- ファイル操作のアクションメニュー（⋯）
- `@hg` / `@@` シンタックスハイライト（JS 近似）と `{{ }}` の軽い装飾
- 非エントリ向け Diagnostics **note**（例: layout）。Preview はソース Markdown
- ファイラー UX（OUT の read-only 見た目、アイコン）。Reset 時は `/src` 全体を `/out` へ再 render
- Markdown タブの highlight.js 色分け

ライブラリ配布:

- `app/` から `@b4moss/hyogen-md@0.10.0` を公開（`dist` + ドキュメント / ライセンス）
- git tag `v0.10.0` と npm 版を一致

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

---

## ライセンス

[MIT](./LICENSE) © Kohki SHIKATA
