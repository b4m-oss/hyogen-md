# hyogen.md（`@b4moss/hyogen-md`）

![masthead](https://raw.githubusercontent.com/b4m-oss/hyogen-md/develop/user-docs/hyogen-md-masthead.png)

[![npm version](https://img.shields.io/npm/v/@b4moss/hyogen-md.svg)](https://www.npmjs.com/package/@b4moss/hyogen-md)
[![license](https://img.shields.io/github/license/b4m-oss/hyogen-md)](./LICENSE)
[![node](https://img.shields.io/node/v/@b4moss/hyogen-md.svg)](https://www.npmjs.com/package/@b4moss/hyogen-md)
[![coverage](https://img.shields.io/badge/coverage-84%25-brightgreen)](#ステータス)

TypeScript / JavaScript 向けの拡張 Markdown テンプレートエンジンです。

制御構文は HTML コメント内（`@hg` … `@endhg` または `@@` … `@@`）に閉じるため、生ソースのプレビューを壊しにくいです。ライブラリの出力は **Markdown のみ**（HTML 化は利用側）。

- **パッケージ名:** `@b4moss/hyogen-md`
- **製品名:** hyogen.md（表現.md）
- **ライセンス:** MIT
- **English README:** [README.md](./README.md)
- **Changelog:** [user-docs/changelog_ja.md](https://github.com/b4m-oss/hyogen-md/blob/develop/user-docs/changelog_ja.md)
- **ドキュメントサイト:** [https://hyogen-md.netlify.app](https://hyogen-md.netlify.app)（Nuxt Content。npm 非同梱）
- **Playground:** [https://hyogen-md.netlify.app/playground](https://hyogen-md.netlify.app/playground)（同一サイト。npm 非同梱）
- **仕様（日本語・メンテナー向け）:** [dev-docs/](https://github.com/b4m-oss/hyogen-md/tree/develop/dev-docs)

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

API の詳細: [dev-docs/specs/api.md](https://github.com/b4m-oss/hyogen-md/blob/develop/dev-docs/specs/api.md)。

---

## リポジトリ構成

| パス | 役割 |
|------|------|
| `app/` | npm 公開するライブラリ（`dist` + README / LICENSE） |
| `docs-site/` | [Netlify](https://hyogen-md.netlify.app) 上のドキュメントサイト + Playground（**npm 非同梱**） |
| `user-docs/` | 利用者向けドキュメント（例: [changelog](https://github.com/b4m-oss/hyogen-md/blob/develop/user-docs/changelog_ja.md)） |
| `dev-docs/` | 仕様・ロードマップ（**日本語**・メンテナー向け） |

### ドキュメントサイト & Playground

**サイト:** **[https://hyogen-md.netlify.app](https://hyogen-md.netlify.app)**（`main` からデプロイ）  
**Playground:** **[https://hyogen-md.netlify.app/playground](https://hyogen-md.netlify.app/playground)**

ローカル:

```bash
make install-docs
make dev-docs
```

`http://localhost:3000`（ドキュメント）と `/playground`。Vite alias で `../app` を参照。仮想 FS + `localStorage` のみ。

---

## ステータス

**0.x** です。`1.0.0` まで API・出力は変わりえます。  
公開済み: **`@b4moss/hyogen-md@0.10.0`**（git tag `v0.10.0`）。

Playground UX は **v0.10.0** マイルストーンに含まれますが、**npm の tarball には入りません**。

coverage バッジはライブラリ（`app/`）の Vitest **statement カバレッジ概算（約 84%）**です。初期リリース目標は 50% 以上。CI / Codecov 連携はまだありません。

---

## Changelog

**[user-docs/changelog_ja.md](https://github.com/b4m-oss/hyogen-md/blob/develop/user-docs/changelog_ja.md)** を参照（English: [changelog.md](https://github.com/b4m-oss/hyogen-md/blob/develop/user-docs/changelog.md)）。

---

## ライセンス

[MIT](./LICENSE) © Kohki SHIKATA
