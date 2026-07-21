# ウィッシュリスト

個人メモ。確定方針の正は [need_decision.md](./need_decision.md) / [roadmap.md](./roadmap.md)。

## シーダーを、リアルなファイル構成にする

- 現在のシーダーは、ベタガキ。これをVirtualFSと同じ構成のディレクトリ構成にする
- なぜなら、複数パターンのサンプル構成をPlayground上で選択肢、都度シードし直せるようにしたいから
- シンプルなパターン、複雑なパターン、イテレーションのみ、コンディションのみ、など

## ドキュメントサイト

- Playgroundとは別立てで作る
- Nuxt Content採用
- とりあえず、Netlifyで運用する

## 方針が固まった候補（バージョン割当済み）

### outDir の `_` 除外 — v0.9.1
- 詳細は [playground.md](./playground.md) / [roadmap.md](./roadmap.md)

### 出力 Markdown の空行改善 — v0.9.2
- 詳細は [pipeline.md](./specs/pipeline.md) / [roadmap.md](./roadmap.md)

### プレイグラウンド UX — v0.10.0
- スリードット・アクションメニュー
- `@hg` / `@@` シンタックスハイライト（Playground 限定）
- **npm 初回公開**（`@b4moss/hyogen-md@0.10.0`。Playground は同梱しない）。詳細は [need_decision.md](./need_decision.md) / [roadmap.md](./roadmap.md)
- 詳細は [playground.md](./playground.md)

### データソースのインポート — v0.11.0
- `.yaml`, `.json`, `csv` などのサポート
- 変数としてバインディング
- **DSL では読まない**（API 側のみ）。**複数ファイル**読込可

### TOC — v0.12.0
- ページ内をパースして TOC を作る
- **専用ヘルパ**を入れたい（詳細は後で詰める）

### 許可メソッド（`.length` / `.slice` 等）— v0.13.0
- 詳細は [dsl.md](./specs/dsl.md) / roadmap

## 採用時期未定（先送り）

### Playground の Zip 出力（SRC / OUT）
- 仮想 FS はブラウザメモリ（`VirtualFs` + `localStorage`）のみで、現状は端末への書き出しなし
- `dumpFiles()` でパス→内容は取れるので、JSZip 等で SRC / OUT（または両方）を zip ダウンロードする出口を後から足せる
- バージョン割当・UI 配置は未定

### エディタ向けシンタックスハイライト（VS Code 等）
- Playground 上の `@hg` / `@@` ハイライト（v0.10.0・優先度高）とは **別物**
- エコシステム向けプラグイン化はだいぶ後。詳細は [playground.md](./playground.md)

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
