# 要意思決定・後続定義事項

確定済みの仕様は各 [specs](./specs/) を正とする。  
ここに残すのは **未決・後続** のみ。

---

## 保留（当面実装しない）

| 項目 | 方針 |
|------|------|
| **mixin** | 廃止（保留）。component / include で代替。必要時に将来実装 |

---

## 将来候補（v0.9+）

| 項目 | 方針 | 参照 |
|------|------|------|
| ビルトイン関数 | **v0.8 時点では導入しない**（当面なし）。必要なら v0.9+ で spec 追加のうえ最小セット | [dsl.md](./specs/dsl.md) |
| 許可メソッドの追加 | 当面 `.toLocaleString` のみ。追加は都度 spec | [dsl.md](./specs/dsl.md) |

---

## 実装時の委任（方針確定済み）

| 項目 | 方針 | 参照 |
|------|------|------|
| `HyogenError` / `HyogenWarning` の詳細型 | api.md の概要型をベースに実装 | [api.md](./specs/api.md) |
| glob 実装 | Vite 系。picomatch + fast-glob 等 | [api.md](./specs/api.md) |
| 英語メッセージ | [messages.en.json](./specs/messages.en.json) を正 | [api.md](./specs/api.md) |
| 診断ログ形式 | `formatDiagnosticLog`（console 自動出力なし） | [api.md](./specs/api.md) |
| suspicious 正規表現 | security.md に確定転記済み | [security.md](./specs/security.md) |
| each 内 component | 可・ループ変数は props に見える。公式例あり | [templating.md](./specs/templating.md) |

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
