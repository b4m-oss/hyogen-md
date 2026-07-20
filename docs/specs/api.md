# 公開 API

シグネチャの細部は実装前に調整してよいが、方針は確定とする。

## レンダリング入口

- サーバ向けとクライアント向けで API を分ける
  - **`renderServer`** … SSR / SSG 想定。`serverContext` を渡せる
  - **`renderClient`** … CSR 想定。`serverContext` は渡せない
- SSG 一括は **`build`**

## 型（概要）

```ts
type HyogenContext = Record<string, unknown>;

type HyogenDiagnostic = {
  code: string;
  message: string;
  path?: string;
  details?: Record<string, unknown>;
};

type HyogenWarning = HyogenDiagnostic;
type HyogenError = Error & HyogenDiagnostic;

type RenderOptions = {
  preserveFrontMatter?: boolean;
  preserveHgComments?: boolean;
  loader?: Loader;
  root?: string;
};

type ServerRenderOptions = RenderOptions & {
  serverContext?: HyogenContext;
};

type Loader = (path: string) => Promise<string>;

type RenderResult = {
  markdown: string;
  warnings: HyogenWarning[];
};

type BuildResult = {
  files: { path: string; markdown: string }[];
  warnings: HyogenWarning[];
};
```

## 関数

```ts
declare function renderServer(
  source: string | { path: string },
  context?: HyogenContext,
  options?: ServerRenderOptions,
): Promise<RenderResult>;

declare function renderClient(
  source: string | { path: string },
  context?: HyogenContext,
  options?: RenderOptions,
): Promise<RenderResult>;

type BuildOptions = RenderOptions & {
  input: string | string[];
  outDir: string;
  includeUnderscoreEntries?: boolean;
  context?: HyogenContext;
  serverContext?: HyogenContext;
};

declare function build(options: BuildOptions): Promise<BuildResult>;

/** 診断を api.md 例形式の複数行テキストに整形する。console へは出力しない。 */
declare function formatDiagnosticLog(
  kind: "error" | "warning",
  diagnostic: HyogenDiagnostic,
): string;
```

`formatDiagnosticLog` は `hyogen-md` および `hyogen-md/client` から export される。

- 1 行目: `[hyogen:{kind}] {code}`
- 以降: `details` の各キーを `  {key}: {value}`（インデント 2 スペース）。値は `String(value)`。`undefined` のキーは省略
- `diagnostic.path` も `path` 行として含める。`details.path` がある場合はそちらを優先
- ライブラリ本体は **自動で console 出力しない**（呼び出し側が使うユーティリティ）

### サーバ専用 context

- **別引数 `serverContext`** を採用する
- `renderServer` / `build` のみ `serverContext` を受け取れる
- `renderClient` の options に `serverContext` 相当が渡された場合は **エラー**（`server_context_on_client`）
- context に秘密キー名を機械検出する機能は **当面設けない**（API 分離とドキュメントで防ぐ）

```ts
await renderServer("./page.md", { title: "public" }, {
  serverContext: { apiKey: "secret" },
});
```

## loader

`include` / `component` / `extend` のパスを解決し、ソース文字列を返す。

- 戻り値は `(path: string) => Promise<string>` で足りる（メタデータは後で拡張可）
- **ブラウザ**: 呼び出し側が必須。同一オリジン想定
- **Node**: 省略時は FS + 許可されたリモート fetch のデフォルト loader
- 失敗時は `file_not_found` または `load_failed` で **中断**。`ENOENT` 等は hyogen エラーに包む

## 入力の指定（SSG / 一括）

- 個別パス列挙 + **glob**
- glob 方言: **Vite / JS エコシステムで一般的な glob**（実装は **picomatch + fast-glob** 等を想定）
- SSG 既定: **エントリ指定 → 依存を辿って走査**
- `_` partial: **マッチ後フィルタ**。input glob で明示したパスは **除外を上書きしてエントリに含めてよい**

## オプション（デフォルト）

| オプション | デフォルト |
|------------|------------|
| front matter を出力に残す | OFF |
| hyogen HTML コメントを出力に残す | OFF |
| リモート include / component（Node） | 許可 |

## エラー・警告コード

英語メッセージテンプレート: [messages.en.json](./messages.en.json)

### 中断するエラー

| code | 状況 |
|------|------|
| `file_not_found` | include / component / extend 先が存在しない |
| `frontmatter_too_large` | front matter ソースが 64KB 超 |
| `duplicate_component_alias` | 同名 `component ... as` の二重登録 |
| `alias_collision` | `as` 名の衝突（変数・親子再登録含む） |
| `forbidden_property_access` | 危険キーへのアクセス |
| `parse_error` | ホワイトリスト外構文・不正 DSL |
| `component_multiline_output` | component 結果が複数行 |
| `server_context_on_client` | `renderClient` に `serverContext` 相当 |
| `load_failed` | loader のその他失敗 |

### 中断しない警告

| code | 状況 |
|------|------|
| `circular_include` | 循環参照（当該取り込みスキップ） |
| `nest_limit_exceeded` | `if` / `each` 構造ネスト合計 20 超（スキップ） |
| `extend_in_component` | component 内の extend（スキップ） |
| `prop_type_mismatch` | props 型不一致（値は `undefined`） |
| `prop_missing` | `isRequired` なのに欠落（値は `undefined`） |
| `prop_unknown` | 未知の props キー（**無視**） |
| `suspicious_context_value` | context 値が危険っぽい（改変しない） |

ログ出力例:

```text
[hyogen:error] file_not_found
  path: ./missing.md
  from: ./page.md
  via: include
```

## 関連

- パイプライン: [pipeline.md](./pipeline.md)
- パス: [paths.md](./paths.md)
- セキュリティ: [security.md](./security.md)
- 未決: [need_decision.md](../need_decision.md)

---

以上