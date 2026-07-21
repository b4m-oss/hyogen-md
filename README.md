# hyogen.md (`@b4moss/hyogen-md`)

![masthead](https://raw.githubusercontent.com/b4m-oss/hyogen-md/develop/user-docs/hyogen-md-masthead.png)

[![npm version](https://img.shields.io/npm/v/@b4moss/hyogen-md.svg)](https://www.npmjs.com/package/@b4moss/hyogen-md)
[![license](https://img.shields.io/github/license/b4m-oss/hyogen-md)](./LICENSE)
[![node](https://img.shields.io/node/v/@b4moss/hyogen-md.svg)](https://www.npmjs.com/package/@b4moss/hyogen-md)
[![coverage](https://img.shields.io/badge/coverage-84%25-brightgreen)](#status)

Extended Markdown template engine for TypeScript / JavaScript.

Control flow and templating live in HTML comments (`@hg` … `@endhg` or `@@` … `@@`), so source files stay preview-friendly. The library outputs **Markdown only** (HTML is left to the consumer).

- **Package name:** `@b4moss/hyogen-md`
- **Product name:** hyogen.md（表現.md）
- **License:** MIT
- **Japanese README:** [README_ja.md](./README_ja.md)
- **Changelog:** [user-docs/changelog.md](https://github.com/b4m-oss/hyogen-md/blob/develop/user-docs/changelog.md)
- **Playground:** [https://hyogen-md.netlify.app](https://hyogen-md.netlify.app) (Netlify; not in the npm package)
- **Specs (Japanese, maintainers):** [dev-docs/](https://github.com/b4m-oss/hyogen-md/tree/develop/dev-docs)

> **Homepage:** [https://github.com/b4m-oss/hyogen-md](https://github.com/b4m-oss/hyogen-md)

This file is kept **in sync** at the repository root and at `app/README.md` (npm package root).

---

## Install

```bash
npm install @b4moss/hyogen-md
```

Requires **Node.js >= 20**.

---

## Quick start

### Client / CSR (`@b4moss/hyogen-md/client`)

```ts
import { renderClient } from "@b4moss/hyogen-md/client";

const result = await renderClient(
  { path: "/src/index.md" },
  { siteName: "Demo" },
  {
    loader: async (path) => {
      // resolve path → file contents (virtual FS, fetch, etc.)
      return await readSomewhere(path);
    },
  },
);

console.log(result.markdown);
console.log(result.warnings);
```

### Server / SSR (`@b4moss/hyogen-md`)

```ts
import { renderServer, createNodeLoader } from "@b4moss/hyogen-md";

const result = await renderServer(
  { path: "./pages/index.md" },
  { title: "Hello" },
  {
    loader: createNodeLoader(),
    // serverContext: { apiKey: "…" }, // server-only; not available on renderClient
  },
);
```

### SSG batch (`build`)

```ts
import { build } from "@b4moss/hyogen-md";

const { files, warnings } = await build({
  input: "./src/**/*.md",
  outDir: "./out",
  context: { siteName: "Demo" },
});
```

API details: [dev-docs/specs/api.md](https://github.com/b4m-oss/hyogen-md/blob/develop/dev-docs/specs/api.md).

---

## Repository layout

| Path | Role |
|------|------|
| `app/` | Library published to npm (`files`: `dist`, plus README / LICENSE) |
| `playground/` | Vite + Vue playground on [Netlify](https://hyogen-md.netlify.app) (**not** in npm) |
| `user-docs/` | User-facing docs (e.g. [changelog](https://github.com/b4m-oss/hyogen-md/blob/develop/user-docs/changelog.md)) |
| `dev-docs/` | Specs and roadmap (**Japanese**, maintainers) |

### Playground

Online: **[https://hyogen-md.netlify.app](https://hyogen-md.netlify.app)** (deploys from `main`).

Local:

```bash
cd playground
npm install
npm run dev
```

Uses `../app` via Vite alias. Virtual FS + `localStorage` only (no real disk I/O).

---

## Status

This is **0.x**. APIs and output may change until `1.0.0`.  
Published: **`@b4moss/hyogen-md@0.10.0`** (git tag `v0.10.0`).

Playground UX is part of the **v0.10.0** product milestone but is **not** included in the npm tarball.

The coverage badge reflects approximate **statement coverage for `app/`** (library) from Vitest (~84%). Initial release goal is ≥50%. It is not yet wired to CI / Codecov.

---

## Changelog

See **[user-docs/changelog.md](https://github.com/b4m-oss/hyogen-md/blob/develop/user-docs/changelog.md)** (Japanese: [changelog_ja.md](https://github.com/b4m-oss/hyogen-md/blob/develop/user-docs/changelog_ja.md)).

---

## License

[MIT](./LICENSE) © Kohki SHIKATA
