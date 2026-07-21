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

type DataSourcesMap = Record<string, string>;

type ServerRenderOptions = RenderOptions & {
  serverContext?: HyogenContext;
  /** 変数名 → ルート相対のデータファイルパス（YAML / JSON / CSV） */
  dataSources?: DataSourcesMap;
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
  dataSources?: DataSourcesMap;
};

declare function build(options: BuildOptions): Promise<BuildResult>;

/**
 * 複数データファイルを読み込み、変数名 → 値の HyogenContext を返す。
 * renderServer / build の dataSources と同じパース規則。
 */
declare function loadDataSources(
  sources: DataSourcesMap,
  options?: { root?: string; loader?: Loader },
): Promise<HyogenContext>;

/** 診断を api.md 例形式の複数行テキストに整形する。console へは出力しない。 */
declare function formatDiagnosticLog(
  kind: "error" | "warning",
  diagnostic: HyogenDiagnostic,
): string;
```

`formatDiagnosticLog` は `@b4moss/hyogen-md` および `@b4moss/hyogen-md/client` から export される。

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

## データソースのインポート（v0.11.0）

外部データ（YAML / JSON / CSV）を **API 側のみ**で読み、テンプレート変数へバインドする。DSL の `import` / `require` は **引き続き禁止**（[dsl.md](./dsl.md)）。

### オプション `dataSources`

`renderServer` / `build` の options に **変数名 → ファイルパス** のマップを渡す。

```ts
await renderServer("./page.md", {}, {
  root: "./site",
  dataSources: {
    site: "./data/site.yaml",
    products: "./data/products.json",
    rows: "./data/rows.csv",
  },
});
```

- パスは `options.root`（省略時は `.doc_root` 探索結果または cwd）からの **相対パス**
- **リモート URL** は v0.11.0 では **非対応**（`file_not_found` または `load_failed`）
- `renderClient` に `dataSources` を渡した場合は **`data_sources_on_client`** で中断

### 関数 `loadDataSources`

プログラムから先に読み込み、手動で context に合成してもよい。

```ts
const fromFiles = await loadDataSources(
  { site: "./data/site.yaml" },
  { root: "./site" },
);
await renderServer("./page.md", { ...fromFiles, extra: 1 });
```

`@b4moss/hyogen-md`（サーバ向け）のみ export。`@b4moss/hyogen-md/client` には **載せない**。

### context へのマージ順

`renderServer` / `build` では次の順で浅いマージ（[variables.md](./variables.md)）:

1. `loadDataSources(dataSources)` の結果
2. 呼び出し側 `context`（`build` の `options.context`）
3. `serverContext`

同名キーは **後勝ち**。front matter は `renderDocument` 内でさらに後から適用される（従来どおり）。

### 形式別パース

| 拡張子 | パース結果（変数に束縛される値） |
|--------|--------------------------------|
| `.json` | `JSON.parse` の結果（オブジェクト / 配列 / プリミティブ） |
| `.yaml` / `.yml` | `yaml` パッケージでパースした結果 |
| `.csv` | **ヘッダー行あり**の CSV → **オブジェクト配列**（1 行 = 1 レコード） |

- 空ファイル → **`parse_error`**
- 未対応拡張子 → **`parse_error`**（`details.format` に拡張子）
- CSV: **`csv-parser`**（npm）を `Readable.from` 経由の薄いラッパで利用。RFC 4180 簡易（カンマ区切り、ダブルクォートでフィールド囲み・エスケープ、`\r\n` / `\n` 改行）

### build での扱い

- `dataSources` は **エントリループの前に 1 回**読み込み、全エントリで同一のマージ済み context を使う（`context` / `serverContext` と同様）

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
| `data_sources_on_client` | `renderClient` に `dataSources` |
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

## 後続候補（未実装）

- **TOC 専用ヘルパ**: 入れる方針。構文・詳細は後続

## 関連

- パイプライン: [pipeline.md](./pipeline.md)
- パス: [paths.md](./paths.md)
- セキュリティ: [security.md](./security.md)
- 未決: [need_decision.md](../need_decision.md)

---

以上