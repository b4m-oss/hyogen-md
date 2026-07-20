# hyogen.md - Extended Markdown Template Engine

`hyogen.md`（表現.md）は、Markdownをテンプレートエンジンとして用いる TypeScript ライブラリ（npm パッケージ）である。

## モチベーション

- Markdownの表現力を上げる
- テンプレート・コンポーネントの概念を導入する
- リアルタイムレンダリング（CSR）と静的／サーバレンダリング（SSG / SSR）に両対応する

## ゴール / 非ゴール

### ゴール

- **Front matter 以外は Markdown 互換**であること
  - 制御構文は HTML コメントに閉じ、生ソースのプレビューを壊さない
  - 展開後の出力も通常の Markdown パーサで読める
- テンプレートエンジンとしての能力（include / component / extend / 変数 / ロジック）は、既存エンジン（Pug / Blade / Twig / Mustache）と同系統の体験を提供する

### 非ゴール（初期）

- Mustache のセクション（`{{#x}}...{{/x}}`）や partial（`{{> foo}}`）の完全互換
- extend の多重継承
- **mixin**（保留。component で代替）
- 任意 JavaScript の評価（`eval` / `new Function` 等）
- **HTML 出力**（Markdown 出力のみ。HTML 化は利用側）
- **ドキュメントサイト**（当面作らない。動作確認は同リポのプレイグラウンドで足りる想定）

### 表記

- 正式名称は **`hyogen.md`**（`hyougen.md` は用いない）

### 周辺（方針メモ）

- **プレイグラウンド**: 同リポジトリ内。ローカルで試せれば十分。npm 公開はプレイグラウンドの前提にしない（時期未定） → [need_decision.md](./need_decision.md) / [roadmap.md](./roadmap.md)

---

## ドキュメント構成

| 文書 | 内容 |
|------|------|
| [specs/pipeline.md](./specs/pipeline.md) | 処理パイプライン・実行環境 |
| [specs/templating.md](./specs/templating.md) | include / component / extend・block |
| [specs/variables.md](./specs/variables.md) | 変数・front matter・スコープ |
| [specs/logic.md](./specs/logic.md) | if / each / 三項 |
| [specs/dsl.md](./specs/dsl.md) | DSL（`@hg` / `@@` ショートハンド） |
| [specs/paths.md](./specs/paths.md) | パス解決・`.doc_root`・リモート |
| [specs/security.md](./specs/security.md) | セキュリティ方針 |
| [specs/api.md](./specs/api.md) | 公開 API・loader・エラーコード |
| [specs/messages.en.json](./specs/messages.en.json) | 英語エラー・警告メッセージ |
| [need_decision.md](./need_decision.md) | 未決定・後続定義事項 |
| [roadmap.md](./roadmap.md) | 開発ロードマップ（現行 `v0.9.0`〜） |
| [_archive/roadmap/](./_archive/roadmap/) | 完了ロードマップ（`v0.1.0`〜`v0.8.0`） |
| [development.md](./development.md) | 開発方針（TDD） |
| [app/test/specs/v0.1.0.md](../app/test/specs/v0.1.0.md) | v0.1.0 テスト仕様書 |
| [app/test/specs/v0.2.0.md](../app/test/specs/v0.2.0.md) | v0.2.0 テスト仕様書 |
| [app/test/specs/v0.3.0.md](../app/test/specs/v0.3.0.md) | v0.3.0 テスト仕様書 |
| [app/test/specs/v0.4.0.md](../app/test/specs/v0.4.0.md) | v0.4.0 テスト仕様書 |
| [app/test/specs/v0.5.0.md](../app/test/specs/v0.5.0.md) | v0.5.0 テスト仕様書 |
| [app/test/specs/v0.6.0.md](../app/test/specs/v0.6.0.md) | v0.6.0 テスト仕様書 |
| [app/test/specs/v0.7.0.md](../app/test/specs/v0.7.0.md) | v0.7.0 テスト仕様書 |
| [app/test/specs/v0.8.0.md](../app/test/specs/v0.8.0.md) | v0.8.0 テスト仕様書 |

---

## 実装優先度（目安）

1. **v0.9.0**: 同リポ・ローカル向けプレイグラウンド
2. **v0.10.0**: データソースのインポート（API・複数ファイル）
3. **v0.11.0**: TOC 専用ヘルパ
4. **v0.12.0**: 許可メソッド（`.length` / `.slice` 等）

詳細: [roadmap.md](./roadmap.md)

---

以上
