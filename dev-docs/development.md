# 開発方針

機能仕様は [specs/](./specs/) が正。本書は **実装の進め方** を定める。  
ブランチ・CI/CD・公開運用は [repository.md](./repository.md)。  
ドキュメントサイトは [docs-site.md](./docs-site.md)（docs.5〜8）。

---

## TDD 実装

**1 関数・1 メソッドごと**に、必ず単体テストと結合テストを書く。

サイクルは **Red → Green → Refactor**。実装コードより先にテスト仕様書を書く。

### 手順

1. **テスト仕様書**を書く（下記テンプレート）
2. 仕様書に基づき **テストコード**を書く → **Red**（失敗を確認）
3. **最小実装**でテストを通す → **Green**
4. **Refactor**（仕様・テストは変えずに整理）
5. 単体・結合の両方が Green になってから次の関数へ

### テスト仕様書の置き場所

**バージョンごとに 1 ファイル**（[roadmap.md](./roadmap.md) の `v0.n.0` に対応）:

```
app/test/specs/v0.1.0.md
app/test/specs/v0.2.0.md
…
```

各ファイル内で、関数・メソッドごとに見出し（`### formatMessage` 等）を立て、テンプレートに従って記述する。

対応するテストコード:

```
app/test/{モジュール}/{関数・メソッド名}.test.ts       … 単体
app/test/{モジュール}/{関数・メソッド名}.integration.test.ts … 結合
```

- **単体**: 依存をスタブ・モックし、当該関数の入出力と分岐を検証する
- **結合**: 隣接モジュール（パーサ + パイプライン段など）を実物で繋ぎ、仕様上の振る舞いを検証する
- 1 関数に対し、単体・結合それぞれ **正常系おおよそ 3 件**、**異常系 3〜5 件** を目安とする

### テスト仕様書テンプレート

`app/test/specs/v0.{n}.0.md` 内の **関数・メソッド見出し**（`### {名前}`）ごとに、次の形式で書く。

```markdown
### {関数・メソッド名}

- 大まかな処理の内容を自然言語で1
- その2
- その3

#### テスト: 正常系

- 期待される正常テストの結果1
- 期待される正常テストの結果2
- 期待される正常テストの結果3

#### テスト: 異常系

- 期待される異常テストの結果1
- 期待される異常テストの結果2
- 期待される異常テストの結果3
- 期待される異常テストの結果4
- 期待される異常テストの結果5
```

### 記載のコツ

- 見出し直下の箇条書き（3 行）は **処理概要**（何を入力に何を返すか、副作用の有無）
- 「テスト: 正常系 / 異常系」は **Given / When / Then を意識した期待結果**（入力・条件・出力・エラーコードまで具体に）
- 異常系は 5 行すべてを埋める必要はない。**3〜5 件**が目安
- 仕様 [specs/](./specs/) と矛盾したら **spec を先に更新**してからテスト仕様書を直す

### 実行

ルートから:

```bash
make help          # ターゲット一覧
make test          # app テスト (vitest run)
make test-pg       # playground テスト
make test-all      # 両方
make test-watch    # app 監視モード
make build         # app/dist（minify あり）
make size          # dist / gzip / npm pack 容量
make pack          # npm pack --dry-run
make check         # 公開前: typecheck + test + build + pack
make dev-pg        # playground 開発サーバ
```

`app/` 直下でも同様:

```bash
npm test
npm run test:watch
npm run build
```

---

## 関連

- [roadmap.md](./roadmap.md) … バージョンごとの機能塊
- [specs/](./specs/) … 製品仕様
- [need_decision.md](./need_decision.md) … 未決事項

---

以上
