# ドキュメントサイト（v0.10.0-docs.5〜docs.8）

利用者向けの公式ドキュメントサイト。**Playground を内包**する。  
ライブラリ本体（`@b4moss/hyogen-md`）の SemVer は上げない（docs トラック）。  
製品仕様の正は本書。ロードマップ割当は [roadmap.md](./roadmap.md)。運用は [repository.md](./repository.md)。

---

## ゴール

- 現時点の **公開 API すべて**と、備えている **テンプレート構文の網羅**を利用者向けに示す
- 現在の `playground/` を **サイト内へ移植**し、ドキュメントと同一サイトで試せるようにする
- **dark / light / OS 準拠**の画面輝度モード切替（サイト全体と Playground の両方）

## 非ゴール（本マイルストーン）

- ライブラリ新機能の追加（v0.11.0 以降）
- `dev-docs/specs/` 全文の機械的 mirror（メンテナー向け仕様の正は引き続き `dev-docs/`）
- npm パッケージへのサイト同梱

---

## スタック・配置

| 項目 | 方針 |
|------|------|
| パス | リポジトリ直下 **`docs-site/`**（新規） |
| フレームワーク | **Nuxt** + **Nuxt Content** |
| Playground | 既存 `playground/`（Vite + Vue）を **サイト内に移植**する。Vue コンポーネントとして統合。移植後の単独 `playground/` の扱いは実装時に決める（削除 / 薄いラッパ / 開発用エイリアス） |
| hyogen-md 参照 | 開発時は alias で `../app` ソースを読む（現行 Playground と同様） |
| ホスティング | **Netlify**。production branch は **`main`** |
| URL | 実装時に確定（例: 既存 `hyogen-md.netlify.app` をサイトに載せ替える、または docs 用ホストに Playground を統合）。README の導線を更新 |
| 言語 | 英語を正とし、日本語ページを併設（ルート方針は実装時。`/ja` 等） |
| npm | **含めない** |

---

## コンテンツ範囲（網羅要件）

「現時点」= **`@b4moss/hyogen-md@0.10.0`** で公開済みの面。正は [specs/](./specs/) と [api.md](./specs/api.md)。サイトは利用者向けの説明・例・索引。

### API（すべて）

少なくとも次をページまたは明確な節でカバーする（抜けなく索引できること）:

- `renderServer`
- `renderClient`（`@b4moss/hyogen-md/client`）
- `build`
- loader（`createNodeLoader` / `createFsLoader` 等、公開しているもの）
- `formatDiagnosticLog` および診断・エラーの利用者向け説明
- 公開型・オプション・エラーコードの要約（詳細は api.md / messages）

### テンプレート構文（網羅）

少なくとも次をカバーする（クックブック + リファレンス）:

- Front matter / 変数 / `{{ }}`（および v0.10 時点の式）
- `@hg` / `@endhg` と `@@` ショートハンド
- 宣言（`const` / `let` / 再代入）
- `include` / `component`（props）/ `extend` + `block`
- `if` / `else` / `each` 等の制御構造
- 許可メソッド（現状 `.toLocaleString` 等、dsl.md の正）
- パス解決・`_` partial・セキュリティ上の利用者向け注意（要約）

### その他ページ

- Install / Quick start
- Playground への導線（同一サイト内ルート）
- Changelog（`user-docs/changelog*` との関係を明示）
- GitHub / npm リンク

---

## Playground 移植

| 項目 | 方針 |
|------|------|
| 機能パリティ | 現行 [playground.md](./playground.md) の製品要件を維持（仮想 FS、ファイラー、CM6、自動 render、診断、Reset、**ペイン幅ドラッグ可変** 等） |
| 配置 | docs サイト内の専用ルート（例: `/playground`） |
| テーマ | サイトの **dark / light / system** 設定と **同じ切替・永続化**を共有する（下節） |
| 単独 Netlify サイト | 統合後は **docs サイトが正**。旧 `hyogen-md.netlify.app` はリダイレクトまたはホスト載せ替え |

詳細 UI 仕様は引き続き [playground.md](./playground.md)。本書は「サイト内に置く」こととテーマ統合を追加する。

---

## テーマ（dark / light / system）

| 項目 | 方針 |
|------|------|
| モード | **`light` / `dark` / `system`（OS 準拠）** の 3 択 |
| 適用範囲 | **ドキュメント UI 全体**と **埋め込み Playground** |
| 永続化 | `localStorage`（キー名は実装時）。system 時は `prefers-color-scheme` に追従 |
| UI | サイト共通の切替コントロール（ヘッダ等）。Playground 単独時も同等の切替を持つ |

---

## docs.n 割当（実装単位）

| 版 | 内容 |
|----|------|
| **docs.5** | `docs-site/` 骨格（Nuxt Content）、Netlify 接続、英日ルート骨組み、テーマ切替の土台 |
| **docs.6** | Playground をサイト内へ移植。テーマをサイトと共有。**ペイン幅のドラッグ可変**（サイドバー／ソース／プレビュー）。旧 Playground URL の扱いを決める |
| **docs.7** | API 全ページ + テンプレート構文網羅（コンテンツ本体） |
| **docs.8** | 仕上げ・README / user-docs 導線更新・完成判定。**これをもってドキュメントサイト完成 → v0.11.0 開発開始可** |

版番号は作業の区切り。実装順は 5→6→7→8 を原則とするが、同一 PR でまとめてよい。

---

## 完成判定（docs.8）

- [x] Nuxt Content の docs サイトが Netlify 上で公開されている
- [x] Playground が同一サイト内で現行相当に動作する（ペイン幅のドラッグ可変を含む）
- [x] dark / light / system 切替がサイトと Playground で動作する
- [x] 公開 API すべてとテンプレート構文が索引可能な状態で掲載されている
- [x] README（英・日）からサイトへ導線がある
- [x] ライブラリ `package.json` version は **0.10.0 のまま**（docs のみ）

---

## 参照

[roadmap.md](./roadmap.md) / [playground.md](./playground.md) / [repository.md](./repository.md) / [need_decision.md](./need_decision.md) / [specs/api.md](./specs/api.md)

---

以上
