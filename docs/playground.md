# プレイグラウンド（v0.9.0）

同リポジトリ内の **ローカル向け** 動作確認 UI。ドキュメントサイトではない。npm 公開は前提にしない。

方針の要約は [need_decision.md](./need_decision.md) / [roadmap.md](./roadmap.md)。  
ライブラリ本体の API は [specs/api.md](./specs/api.md)（`renderClient` / loader）が正。

---

## 配置・スタック

| 項目 | 方針 |
|------|------|
| パス | リポジトリ直下 `playground/` |
| フレームワーク | Vite + Vue（TypeScript） |
| エディタ | CodeMirror 6 |
| hyogen-md 参照 | 開発時は Vite alias で `../app` の **ソース**を直接読む（npm 未公開） |
| 起動 | ローカルで `npm` / Vite により確認できれば十分 |

## 仮想 FS

| 項目 | 方針 |
|------|------|
| 実ディスク | **操作しない**。ブラウザ上のバーチャル FS のみ |
| 領域 | `src` と `outDir` を分離 |
| `src` | 編集可。新規作成・削除・リネーム・フォルダ作成可 |
| `outDir` | **読み取り専用**（展開結果の閲覧） |
| 永続化 | `localStorage`（ブラウザ内のみ） |
| Reset | 「Reset to demo」でデモシードに戻し、localStorage も上書き |

## UI

| 項目 | 方針 |
|------|------|
| ファイラー | 左ペイン・縦方向。ディレクトリネスト可。`src` / `outDir` を区別して表示 |
| プレビュー | **展開後 Markdown ソース**と **HTML 見た目**の両方（タブまたは分割） |
| HTML 化 | playground 側の責務（例: marked）。hyogen-md は Markdown 出力のみ |
| render タイミング | 入力のたびに自動（デバウンスあり） |
| outDir 更新 | **いま開いている 1 ファイルだけ**展開して対応パスへ書く（後から一括に変更しうる） |
| 診断 | プレビュー付近にパネル。エラーは目立たせ、警告は一覧 |
| context | UI なし。シード／コード内の固定 context のみ |

## 初期シード

- **デモ寄り**: extend / if / each / component 等を一通り触れる小さなプロジェクト

## テスト方針

- 仮想 FS・loader・src→outDir 写像・永続化／Reset など **純ロジックを単体テスト**
- UI は手動確認
- テスト仕様書: [app/test/specs/v0.9.0.md](../app/test/specs/v0.9.0.md)

## 実装時にお任せ（細部）

- 3 ペイン配置のピクセル／タブ切替の見た目
- MD→HTML ライブラリの選定
- デバウンス ms
- `playground/` 内のディレクトリ構成

---

以上
