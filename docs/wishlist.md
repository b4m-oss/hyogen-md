# ウィッシュリスト

個人メモ。確定方針の正は [need_decision.md](./need_decision.md) / [roadmap.md](./roadmap.md)。

## 方針が固まった候補（バージョン割当済み）

### プレイグラウンド — v0.9.0（最優先）
- 同リポジトリ内・ローカルで十分。詳細は [playground.md](./playground.md) / [roadmap.md](./roadmap.md)

### データソースのインポート — v0.10.0
- `.yaml`, `.json`, `csv` などのサポート
- 変数としてバインディング
- **DSL では読まない**（API 側のみ）。**複数ファイル**読込可

### TOC — v0.11.0
- ページ内をパースして TOC を作る
- **専用ヘルパ**を入れたい（詳細は後で詰める）

### 許可メソッド（`.length` / `.slice` 等）— v0.12.0
- 詳細は [dsl.md](./specs/dsl.md) / roadmap

## 採用時期未定（先送り）

### component の見出し適合
- 親ページの見出し数・ネスト数をパースし、component 内の見出しを調節する
- component 内では、見出しは常に `#` から始めるとよい

### ナビゲーション機能
- （現状維持・詳細未定義）

### front matter の `@hg` 構文内読み込み
- `@hg` 構文内での読み込みをサポートすることによって、レンダリング後の front matter の strip が可能（Valid な Markdown に近づけたいときに）

### `@hg` 構文による変数の展開（`echo`）

input:

```markdown
<!--
@hg
const greet = "Hello world!"
echo greet
@endhg
-->
```

output:

```markdown
Hello world!
```

input:

```markdown
<!--
@hg
const greet = "Hello world!"
@endhg
-->
<!--@@ echo greet @@-->
```

output:

```markdown
Hello world!
```

---

以上
