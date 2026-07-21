---
title: API Reference
description: Public API for @b4moss/hyogen-md — rendering, build, loaders, and diagnostics.
---

# API Reference

All public APIs for **@b4moss/hyogen-md@0.10.0**.

## Rendering

| Function | Package | Description |
|----------|---------|-------------|
| [`renderServer`](/api/render-server) | `@b4moss/hyogen-md` | Server-side render (SSR / SSG). Accepts `serverContext`. |
| [`renderClient`](/api/render-client) | `@b4moss/hyogen-md/client` | Client-side render (CSR). Requires a custom `loader`. |
| [`build`](/api/build) | `@b4moss/hyogen-md` | Batch SSG — glob input, walk dependencies, write `outDir`. |

## Loaders

| Export | Package | Description |
|--------|---------|-------------|
| [`createNodeLoader`](/api/loader) | `@b4moss/hyogen-md` | Default Node loader — local FS + remote `https://` fetch. |
| [`createFsLoader`](/api/loader) | `@b4moss/hyogen-md` | File-system loader only (no remote fetch). |
| `isRemotePath` | `@b4moss/hyogen-md` | Utility — returns `true` for `http://` / `https://` paths. |

## Diagnostics

| Export | Package | Description |
|--------|---------|-------------|
| [`formatDiagnosticLog`](/api/diagnostics) | both | Format a warning or error as multi-line log text. |
| `formatMessage` | both | Resolve a diagnostic code to an English message. |
| `createHyogenError` | both | Construct a `HyogenError` with a known code. |

## Types and options

- [Types and options](/api/types-and-options) — `HyogenContext`, `RenderOptions`, `BuildOptions`, `RenderResult`
- [Error and warning codes](/api/error-codes) — full table of diagnostic codes

## Import map

```ts
// Node (full surface)
import {
  renderServer,
  renderClient,
  build,
  createNodeLoader,
  createFsLoader,
  formatDiagnosticLog,
} from '@b4moss/hyogen-md'

// Browser (client-safe subset)
import { renderClient, formatDiagnosticLog } from '@b4moss/hyogen-md/client'
```
