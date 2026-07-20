# parseFrontMatter

- ソース文字列先頭の YAML front matter を切り出してパースする
- パース結果を context 用オブジェクトとして返す
- front matter 以外の本文は strip 前の文字列として別途返す（呼び出し側で後段処理）

## テスト: 正常系

- `---` で囲まれた YAML があるとき、キー・値が context に入る
- front matter が無いとき、context は空オブジェクト、本文はソース全体
- 複数行の YAML 値を正しく読み取れる

## テスト: 異常系

- front matter ソースが 64KB を超えると `frontmatter_too_large` で中断する
- `---` のみで YAML 本体が無いとき `parse_error` になる
- 不正な YAML 構文のとき `parse_error` になる
