---
title: パスとセキュリティ
description: パス解決、_ partial、セキュリティ上の注意点
---

# パスとセキュリティ

`include`、`component`、`extend` のパス解決と、利用時のセキュリティ注意点です。

## .doc_root

プロジェクトのルートを示す **マーカーファイル** `.doc_root` があります。中身は空で構いません（中身は評価しません）。

### .doc_root がある場合

- 読み込みは原則 **`rootDir` 配下に限る**
- **ルート相対パス**（`/components/card.md` など）が使える

### .doc_root がない場合

- ルート相対パスは **エラー**
- 相対パスは有効（`../` による上方向への移動は制限しない）

## 絶対パスとシンボリックリンク（Node）

- 絶対パスは、正規化後の実体が **rootDir 内に収まるときだけ**許可
- シンボリックリンクは追従するが、解決後の実体が rootDir 内のときだけ許可

## ブラウザ（CSR）

- ライブラリは fetch しない。**loader 必須**
- **クロスオリジンはサポートしない**

## リモート URL（Node）

Node 環境では `https://...` などのリモート URL を **include と component の両方**で許可します。

```markdown
<!--
@hg
include https://example.com/snippets/footer.md
@endhg
-->
```

## _ プレフィックス（partial）

Sass の `_` partial と同様:

- `_` で始まるファイル、および `_` で始まるディレクトリ配下は **SSG / SSR のエントリ対象外**
- `include` / `component` による読み込み自体は可能
- glob で明示的に指定したパスは、除外を上書きしてエントリに含められる

## 式のセキュリティ

| 項目 | 方針 |
|------|------|
| 式の範囲 | `{{ }}` は式のみ。任意の JS 評価はしない |
| 危険キー | `__proto__` / `prototype` / `constructor` / `__defineGetter__` |
| 危険キーアクセス | **エラー**（`forbidden_property_access`） |

## 出力と XSS

| 項目 | 方針 |
|------|------|
| `{{ }}` | エスケープしない（生埋め込み） |
| ユーザー入力 | サニタイズしない |
| 責任分界 | MD→HTML 後の XSS は後段・呼び出し側 |

危険そうな context 値には `suspicious_context_value` 警告が出ますが、値は改変しません。

## 秘密情報

- サーバー専用データは **`serverContext`** で渡し、`renderClient` では渡さない
- front matter に秘密を書かない（運用上の推奨）
- front matter はデフォルトで出力から除去される

## 資源制限

| 項目 | 制限 |
|------|------|
| 循環 include / component / extend | 検出 → スキップ + 警告 |
| `if` / `each` 構造ネスト | 合計最大 20 |
| front matter ソース | 最大 64 KB |
| props / API context | 無制限 |

## 関連

- [loader](/ja/api/loader)
- [エラーコード](/ja/api/error-codes)
- [renderServer](/ja/api/render-server) — `serverContext`
