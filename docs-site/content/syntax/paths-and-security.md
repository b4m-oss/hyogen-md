---
title: Paths and Security
description: Path resolution, partials, and security considerations for hyogen.md.
---

# Paths and Security

## .doc_root marker

Place an empty file named `.doc_root` at your project root. The library walks up from the entry file to find it.

| With `.doc_root` | Without `.doc_root` |
|------------------|---------------------|
| Reads restricted to `rootDir` | Relative paths only |
| Root-relative paths allowed (`/partials/x.md`) | Root-relative paths error |
| Absolute paths allowed if resolved path stays inside `rootDir` | Absolute paths effectively error |

Symlinks are followed on Node, but the resolved target must stay inside `rootDir`.

## Relative paths

`./` and `../` work. Without `.doc_root`, `../` is not restricted — your loader and file layout are responsible for safety.

## Remote paths (Node)

`https://…` URLs are allowed for `include` and `component` on Node. The default `createNodeLoader` fetches them.

## Browser

- Loader is **required** — the library does not fetch files
- Cross-origin loading is **not supported**

## Underscore partials

Files or directories starting with `_` are excluded from SSG entry discovery (like Sass partials):

```
content/
  index.md          ← build entry
  _partials/
    header.md       ← not an entry, but includable
```

Explicitly listing a `_` path in `build({ input })` overrides the filter. Set `includeUnderscoreEntries: true` to include all matches.

## Expression security

### Forbidden property access

Accessing these keys throws `forbidden_property_access`:

- `__proto__`
- `prototype`
- `constructor`
- `__defineGetter__`

### No arbitrary code

Expressions are parsed and evaluated against a whitelist — no `eval`, `import`, or host JS execution.

## XSS and output

| Topic | Behavior |
|-------|----------|
| `{{ }}` output | Not escaped — raw interpolation |
| `{{{ }}}` | Same as `{{ }}` today |
| Context sanitization | None — suspicious values trigger `suspicious_context_value` **warnings** only |
| HTML safety | Responsibility of your MD→HTML pipeline |

### Suspicious context patterns

Values containing script tags, event handlers, `javascript:` URLs, embed tags, or meta refresh may warn. The value is **not modified**.

## Secrets

| Do | Don't |
|----|-------|
| Pass secrets via `serverContext` on `renderServer` / `build` | Put secrets in front matter |
| Use `renderClient` only with public data | Pass `serverContext` to `renderClient` |

## Resource limits

| Limit | Behavior |
|-------|----------|
| Front matter size | 64 KB max — error |
| `if` / `each` nesting | 20 levels — warning, block skipped |
| Circular includes | Warning, reference skipped |
| File expansion depth | No hard limit |
