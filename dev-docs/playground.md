# プレイグラウンド（v0.9.0〜）

同リポジトリ内の動作確認 UI。  
**ローカル**および **Netlify** で公開（現状は単独サイト）。**v0.10.0-docs.6** で **ドキュメントサイト内へ移植**する（[docs-site.md](./docs-site.md)）。  
**npm パッケージ（`@b4moss/hyogen-md`）には含めない**。

ライブラリ側の初回 npm 公開は **v0.10.0 済み**。ブランチ・CD・公開運用の正は [repository.md](./repository.md)。  
方針の要約は [need_decision.md](./need_decision.md) / [roadmap.md](./roadmap.md)。  
ライブラリ本体の API は [specs/api.md](./specs/api.md)（`renderClient` / loader）が正。

バージョン割当（抜粋）:

| バージョン | 内容 |
|------------|------|
| **v0.9.0** | 基盤（完了）→ [_archive/roadmap/v0.9.0.md](./_archive/roadmap/v0.9.0.md) |
| **v0.9.1** | outDir の `_` 除外（完了）→ [_archive/roadmap/v0.9.1.md](./_archive/roadmap/v0.9.1.md) |
| **v0.10.0** | アクションメニュー、`@hg` / `@@` シンタックスハイライト（完了）→ [_archive/roadmap/v0.10.0.md](./_archive/roadmap/v0.10.0.md) |
| **v0.10.0-docs.1〜4** | Netlify・リポジトリ運用（完了）→ [_archive/roadmap/v0.10.0-docs.md](./_archive/roadmap/v0.10.0-docs.md) |
| **v0.10.0-docs.5〜8** | ドキュメントサイト内移植・テーマ統合 → [docs-site.md](./docs-site.md) |

（出力の空行改善 **v0.9.2** はライブラリ本体。[pipeline.md](./specs/pipeline.md)）

---

## 配置・スタック

| 項目 | 方針 |
|------|------|
| パス（現状） | リポジトリ直下 `playground/` |
| パス（docs.6 以降） | **`docs-site/` 内**に移植（ルート例: `/playground`）。単独 `playground/` の残置方針は実装時 |
| フレームワーク | Vite + Vue（TypeScript）。サイト移植後も Vue コンポーネントとして維持 |
| エディタ | CodeMirror 6 |
| hyogen-md 参照 | 開発時は alias で `../app` の **ソース**を直接読む |
| 起動 | ローカルおよび Netlify。docs.6 以降はドキュメントサイトと同一デプロイ |
| 公開（現状） | **https://hyogen-md.netlify.app**（[repository.md](./repository.md)） |
| 公開（docs.6 以降） | ドキュメントサイトの一部。旧 URL はリダイレクトまたは載せ替え |

## 仮想 FS

| 項目 | 方針 |
|------|------|
| 実ディスク | **操作しない**。ブラウザ上のバーチャル FS のみ |
| 領域 | `src` と `outDir` を分離 |
| `src` | 編集可。新規作成・削除・リネーム・フォルダ作成可。`_` partial も **置ける**（include / component 参照用） |
| `outDir` | **読み取り専用**（展開結果の閲覧） |
| `_` partial と outDir | SSG / SSR のエントリ除外に **揃える**（[pipeline.md](./specs/pipeline.md)）。`_` で始まるファイル名、またはパス上いずれかのディレクトリ名が `_` 始まりのファイルは **outDir に書かない**／ツリーにも出さない。開いてプレビューすること自体は可（CSR 的な確認用） |
| 永続化 | `localStorage`（ブラウザ内のみ） |
| Reset | 「Reset to demo」でデモシードに戻し、localStorage も上書き |

## UI

| 項目 | 方針 |
|------|------|
| ファイラー | 左ペイン・縦方向。ディレクトリネスト可。`src` / `outDir` を区別して表示 |
| ファイル操作 UI | create / rename / delete は **アクションメニュー**。`src` 見出し・各フォルダ名・各ファイル名の **右側にスリードット（⋯）** |
| ペイン幅 | **サイドバー（ファイラー）／ソース（エディタ）／プレビュー** の区切りを **ドラッグで幅可変**にする（実装割当: **v0.10.0-docs.6**。サイト移植と同時） |
| シンタックスハイライト | `@hg` … `@endhg` および `@@` 内の DSL を色分け（Playground 限定）。詳細は下節 |
| テーマ | **dark / light / system（OS 準拠）**。docs.5〜 でサイトと共有（[docs-site.md](./docs-site.md)）。単独 Playground にも同等の切替を実装する |
| プレビュー | **展開後 Markdown ソース**と **HTML 見た目**の両方（タブまたは分割） |
| HTML 化 | playground 側の責務（例: marked）。hyogen-md は Markdown 出力のみ |
| render タイミング | 入力のたびに自動（デバウンスあり） |
| outDir 更新 | **いま開いている 1 ファイルだけ**展開して対応パスへ書く。`_` partial は **書かない** |
| 診断 | プレビュー付近にパネル。本物のエラーは赤系、警告は一覧。非エントリ向け ParseError は **note**。Preview はソース Markdown |
| context | UI なし。シード／コード内の固定 context のみ |

### `@hg` / `@@` シンタックスハイライト

| 項目 | 方針 |
|------|------|
| 範囲 | **Playground（CodeMirror 6）のみ**。ライブラリ本体の責務ではない |
| 対象 | `@hg` … `@endhg`、および `@@` ショートハンド内。必要なら `{{ }}` も見やすくする |
| 深さ | 初版は **JS 近似**（入れ子言語）で十分 |
| 非対象（当面） | VS Code / 他エディタ向けプラグイン化（[wishlist.md](./wishlist.md)） |
| 仕様との整合 | コードフェンス内の hyogen ブロックはハイライト対象外（[dsl.md](./specs/dsl.md)） |

### 出力の空白・改行について

展開後 Markdown の余分な空行は **プレイグラウンド側の CSS / 表示補正では直さない**。ライブラリ本体の出力を手書き Markdown に寄せる（[pipeline.md](./specs/pipeline.md)）。

## 初期シード

- **デモ寄り**: extend / if / each / component 等を一通り触れる小さなプロジェクト

## テスト方針

- 仮想 FS・loader・src→outDir 写像・永続化／Reset など **純ロジックを単体テスト**
- UI は手動確認（シンタックスハイライト・アクションメニュー・テーマ切替含む）
- テスト仕様書: [app/test/specs/v0.9.0.md](../app/test/specs/v0.9.0.md)（基盤） / [app/test/specs/v0.10.0.md](../app/test/specs/v0.10.0.md)（UX）

### ペイン幅の可変（docs.6）

| 項目 | 方針 |
|------|------|
| 対象 | サイドバー・ソース・プレビュー間の **セパレータをドラッグ**して幅を変える |
| 下限 | 各ペインが潰れて操作不能にならないよう最小幅を設ける（値は実装時） |
| 永続化 | 任意。`localStorage` に幅を保存してよい |
| 実装時期 | **v0.10.0-docs.6**（サイト内移植・テーマ共有と同時） |

## 実装時にお任せ（細部）

- 3 ペイン配置の初期比率／タブ切替の見た目
- セパレータの見た目・ヒット領域
- MD→HTML ライブラリの選定
- デバウンス ms
- `playground/` / docs-site 内のディレクトリ構成
- ハイライトの色テーマ・JS 近似のどのトークンまで色を付けるか
- テーマ CSS 変数の詳細

---

以上
