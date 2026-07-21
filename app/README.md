# hyogen.md (`@b4moss/hyogen-md`)

Extended Markdown template engine for TypeScript / JavaScript.

Control flow and templating live in HTML comments (`@hg` … `@endhg` or `@@` … `@@`), so source files stay preview-friendly. The library outputs **Markdown only** (HTML is left to the consumer).

- **Package name:** `@b4moss/hyogen-md`
- **Product name:** hyogen.md（表現.md）
- **License:** MIT
- **Japanese README:** [README_ja.md](./README_ja.md)
- **Specs (Japanese):** [docs/](https://github.com/b4m-oss/hyogen-md/tree/develop/docs)

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

API details: [docs/specs/api.md](https://github.com/b4m-oss/hyogen-md/blob/develop/docs/specs/api.md).

---

## Repository layout

| Path | Role |
|------|------|
| `app/` | Library published to npm (`files`: `dist`, plus README / LICENSE) |
| `playground/` | Local Vite + Vue playground (**not** published to npm) |
| `docs/` | Specs and roadmap (**Japanese**) |

### Playground (local only)

```bash
cd playground
npm install
npm run dev
```

Uses `../app` via Vite alias. Virtual FS + `localStorage` only (no real disk I/O).

---

## Status

This is **0.x**. APIs and output may change until `1.0.0`.  
Formal npm release target: **`0.10.0`** (git tag `v0.10.0`). Current prep track: `0.10.0-beta.2`.

Playground UX is part of the **v0.10.0** product milestone but is **not** included in the npm tarball.

---

## Changelog

Library vs Playground-only changes are labeled. Alpha tags are development markers; the formal release tag is `v0.10.0`.

### 0.10.0-beta.2

- **Docs / packaging:** MIT LICENSE, bilingual README + CHANGELOG, `@b4moss/hyogen-md` package name, GitHub homepage `b4m-oss/hyogen-md`.

### 0.10.0-beta.1

- **Docs:** npm first-publish policy (tag ↔ npm version, MIT, README sync, GitHub homepage).

### 0.10.0 (planned) — Playground UX + first npm publish

Playground (not in npm package):

- Action menus (⋯) for file operations
- `@hg` / `@@` syntax highlighting (JS-approx) and light `{{ }}` marks
- Soft Diagnostics **note** for non-entry files (e.g. layouts); Preview shows source Markdown
- Filer UX (OUT read-only styling, icons); Reset re-renders full `/src` tree into `/out`
- Markdown tab highlighting via highlight.js

Library packaging:

- Publish `@b4moss/hyogen-md@0.10.0` from `app/` (`dist` only + docs/license)
- git tag `v0.10.0` matches npm version

### 0.9.2 — Library

- Tighten extra blank lines in expanded Markdown (`stripHgComments` / layout / include seams). Notable output change vs earlier builds.

### 0.9.1 — Playground

- Exclude `_`-prefixed files/dirs from outDir; sync OUT after SRC rename / unhide.

### 0.9.0 — Playground

- Local playground: virtual FS, filer, CodeMirror editor, auto-render, preview, diagnostics, demo seed, `localStorage`.

### 0.8.0 — Library

- `formatDiagnosticLog`; `each` + `component` with expression props; cross-spec tests / docs polish.

### 0.7.0 — Library

- `@@` shorthand; ternary / template literals; `for` / `do`–`while`; suspicious context warnings.

### 0.6.0 — Library

- `renderClient` and `@b4moss/hyogen-md/client` browser-oriented entry.

### 0.5.0 — Library

- `build`, `serverContext`, remote loader support.

### 0.4.0 — Library

- `extend` / `block` layout inheritance.

### 0.3.0 — Library

- Declarations and `if` / `each` control blocks; expression operators.

### 0.2.0 — Library

- Path resolution, Node loader, `component`.

### 0.1.0 — Library

- Pipeline MVP: `@hg` blocks, front matter, `{{ }}`, `include`.

---

## License

[MIT](./LICENSE) © Kohki SHIKATA
