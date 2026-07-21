---
title: hyogen-md
description: @b4moss/hyogen-md の公式ドキュメント — Markdown 向けテンプレートエンジン
---

# hyogen-md

**@b4moss/hyogen-md** の公式ドキュメントです。Markdown をそのままテンプレートとして使えるエンジンです。

制御構文は HTML コメント内（`@hg` … `@endhg` または `@@` … `@@`）に閉じるため、生ソースのプレビューを壊しにくい設計です。出力は **Markdown のみ**（HTML 化は利用側の責任です）。

## はじめる

- [インストール](/ja/install) — npm インストールとクイックスタート
- [Playground](/playground) — ブラウザで構文を試せます

## API リファレンス

- [API 概要](/ja/api) — 公開 API の索引
- [renderServer](/ja/api/render-server) — SSR / SSG 向けレンダリング
- [renderClient](/ja/api/render-client) — CSR 向けレンダリング
- [build](/ja/api/build) — 一括ビルド（SSG）
- [loader](/ja/api/loader) — ファイル読み込みのカスタマイズ
- [診断とログ](/ja/api/diagnostics) — 警告・エラーの扱い
- [型とオプション](/ja/api/types-and-options) — 公開型の要約
- [エラーコード](/ja/api/error-codes) — コード一覧

## テンプレート構文

- [構文概要](/ja/syntax) — テンプレート構文の索引
- [Front matter](/ja/syntax/front-matter) — YAML メタデータと props 契約
- [式と変数展開](/ja/syntax/expressions) — `{{ }}` とデフォルト値
- [hyogen ブロック](/ja/syntax/hg-blocks) — `@hg` / `@@` の書き方
- [宣言と代入](/ja/syntax/declarations) — `const` / `let`
- [include と component](/ja/syntax/includes) — ファイルの取り込みと再利用
- [制御構造](/ja/syntax/control-flow) — `if` / `each` / `extend`
- [許可メソッド](/ja/syntax/methods) — `.toLocaleString` など
- [パスとセキュリティ](/ja/syntax/paths-and-security) — パス解決と注意点

## その他

- [変更履歴](/ja/changelog)
- [npm パッケージ](https://www.npmjs.com/package/@b4moss/hyogen-md)
- [GitHub](https://github.com/b4m-oss/hyogen-md)
