---
title: API リファレンス
description: @b4moss/hyogen-md の公開 API 一覧
---

# API リファレンス

`@b4moss/hyogen-md` が公開する API の索引です。対象バージョンは **0.10.0** です。

## レンダリング

| API | 用途 | パッケージ |
|-----|------|-----------|
| [renderServer](/ja/api/render-server) | SSR / SSG 向け | `@b4moss/hyogen-md` |
| [renderClient](/ja/api/render-client) | CSR 向け | `@b4moss/hyogen-md/client` |
| [build](/ja/api/build) | 一括ビルド（SSG） | `@b4moss/hyogen-md` |

## ファイル読み込み

| API | 用途 |
|-----|------|
| [loader](/ja/api/loader) | `include` / `component` / `extend` のパス解決 |
| `createNodeLoader` | Node 用（FS + リモート fetch） |
| `createFsLoader` | ローカル FS のみ |

## 診断・エラー

| API | 用途 |
|-----|------|
| [診断とログ](/ja/api/diagnostics) | `formatDiagnosticLog`、警告の扱い |
| [エラーコード](/ja/api/error-codes) | `code` 一覧 |
| `createHyogenError` | カスタム loader 等でのエラー生成 |
| `formatMessage` | メッセージテンプレートの整形 |

## 型とオプション

[型とオプション](/ja/api/types-and-options) に `HyogenContext`、`RenderOptions`、`BuildOptions` などの要約があります。

## 設計上の分離

- **サーバー専用データ**は `serverContext` で渡します（`renderServer` / `build` のみ）
- **クライアント**では `serverContext` を渡せません（`server_context_on_client` エラー）
- ライブラリは **console に自動出力しません**。ログは呼び出し側が `formatDiagnosticLog` で整形します
