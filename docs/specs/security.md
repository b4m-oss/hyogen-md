# セキュリティ

決めたデフォルトを固定し、危険寄りのオプトイン枠は **最小限**とする。

## ファイルシステム / ネットワーク

詳細は [paths.md](./paths.md)。要約:

| 項目 | 方針 |
|------|------|
| 読み込み範囲 | `.doc_root` があるとき rootDir 内 |
| `.doc_root` 無し | 相対のみ。`../` 制限なし。ルート相対はエラー |
| 絶対パス / symlink | 解決後 rootDir 内のみ |
| ブラウザ | loader 必須。クロスオリジンなし |
| Node リモート include / component | 許可 |

## 式評価

| 項目 | 方針 |
|------|------|
| 式の範囲 | `{{ }}` は式のみ。関数はユーザー登録（component `as`）のみ。ビルトインは当面なし。メソッドは当面 `.toLocaleString` のみ。詳細は [dsl.md](./dsl.md) |
| 危険キー | `__proto__` / `prototype` / `constructor` / `__defineGetter__` |
| 危険キーアクセス時 | **エラー**（`forbidden_property_access`） |
| 変数パス深さ・文字種 | 明示制限なし（識別子は JS Unicode 相当） |

## XSS・出力

| 項目 | 方針 |
|------|------|
| `{{ }}` | エスケープしない（生埋め込み） |
| `{{{ }}}` | 現状は同じ挙動。将来のエスケープ導入用にも位置づける |
| ユーザー入力 | サニタイズしない。危険そうなら **警告ログのみ** |
| 責任分界 | MD→HTML 後の XSS は後段・呼び出し側 |

### 危険そうな context の警告

改変はしない。検出したら `suspicious_context_value` を出す。  
メッセージテンプレートは [messages.en.json](./messages.en.json)。

| パターン | 例 | reason |
|----------|-----|--------|
| script タグ | `<script`, `</script>` | `contains_html_script_tag` |
| イベントハンドラ属性 | `onerror=`, `onclick=`, `onload=` | `contains_event_handler` |
| 危険スキーム | `javascript:`, `vbscript:` | `contains_dangerous_scheme` |
| 埋め込み | `<iframe`, `<object`, `<embed` | `contains_embed_tag` |
| meta refresh 等 | `<meta` + `http-equiv` | `contains_meta_refresh` |

確定正規表現（[scanSuspiciousContext.ts](../../app/src/security/scanSuspiciousContext.ts) と一致）:

```js
/<\/?script\b/i                     // contains_html_script_tag
/\bon(?:error|click|load)\s*=/i     // contains_event_handler
/(?:javascript|vbscript)\s*:/i      // contains_dangerous_scheme
/<(?:iframe|object|embed)\b/i       // contains_embed_tag
/<meta\b[^>]*\bhttp-equiv\b/i       // contains_meta_refresh
```


## DoS・資源

| 項目 | 方針 |
|------|------|
| 循環 include/component/extend | 検出 → スキップ + 警告 |
| `if` / `each` 構造ネスト | 合計最大 20。超過はスキップ + 警告 |
| 一般のファイルネスト・展開サイズ | 上限なし |
| front matter ソース | 最大 64KB（超過はエラー） |
| props / API context | 無制限 |

## 秘密情報

| 項目 | 方針 |
|------|------|
| SSR 専用データの漏洩防止 | `serverContext` と `renderServer` / `renderClient` の分離（[api.md](./api.md)） |
| front matter の秘密 | 運用ガイドのみ |
| front matter の出力 | デフォルト strip。残すのはオプション（[variables.md](./variables.md)） |

## API 表面

- 上記をデフォルトとして固定する
- 危険オプションの明示オプトイン枠は最小限にとどめる

## 関連

- パス: [paths.md](./paths.md)
- 変数: [variables.md](./variables.md)
- API: [api.md](./api.md)

---

以上