# 要意思決定・後続定義事項

確定済みの仕様は各 [specs](./specs/) を正とする。  
ここに残すのは **未決・後続** のみ。

---

## DSL

- 許可メソッドの追加（都度 spec。当面 `.toLocaleString` のみ）
- 初期リリースのビルトイン関数（実装状況を見て検討）

---

## Component

- **each 内で component を呼ぶ公式例**の追加（方針: 可・変数見える → [templating.md](./specs/templating.md)）

---

## セキュリティ

- 危険 context 警告の **最終正規表現**（パターン表は [security.md](./specs/security.md) に確定。実装時に調整）

---

## 保留（当面実装しない）

| 項目 | 方針 |
|------|------|
| **mixin** | 廃止（保留）。component / include で代替。必要時に将来実装 |

---

## 実装時の委任（方針確定済み）

| 項目 | 方針 | 参照 |
|------|------|------|
| `HyogenError` / `HyogenWarning` の詳細型 | api.md の概要型をベースに実装 | [api.md](./specs/api.md) |
| glob 実装 | Vite 系。picomatch + fast-glob 等 | [api.md](./specs/api.md) |
| 英語メッセージ | [messages.en.json](./specs/messages.en.json) を正 | [api.md](./specs/api.md) |

---

## 転記済み（参照用）

| 領域 | 文書 |
|------|------|
| API / loader / エラーコード | [api.md](./specs/api.md), [messages.en.json](./specs/messages.en.json) |
| セキュリティ / 危険キー / context 警告 | [security.md](./specs/security.md) |
| Component / extend / include | [templating.md](./specs/templating.md) |
| 変数 / props 推論 | [variables.md](./specs/variables.md) |
| パイプライン順 / if | [pipeline.md](./specs/pipeline.md), [dsl.md](./specs/dsl.md) |
| DSL / ショートハンド `@@` | [dsl.md](./specs/dsl.md) |
