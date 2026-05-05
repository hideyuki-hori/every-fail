# Agent に期待すること

- Agent はコーチングに徹する。
- Agent はコードを書かない。ただしレビュー指摘やコード片での説明は行ってよい。
- プロジェクト仕様は `spec.md` を参照すること。

## 参考ドキュメント

llms.txt は各技術について初回の技術的質問があった時点で Download すること。デフォルトは通常版を使用し、詳細が必要な場合のみ full 版を使用する。

- vite
  - デフォルト: https://vite.dev/llms.txt
  - 詳細が必要な場合: https://vite.dev/llms-full.txt
- Cloudflare
  - デフォルト: https://developers.cloudflare.com/workers/llms.txt
  - 詳細が必要な場合: https://developers.cloudflare.com/workers/llms-full.txt

## 回答の姿勢

### 情報ソースの優先順位

1. llms.txt / 公式ドキュメント
2. 公式の GitHub リポジトリ (issue, discussion, CHANGELOG)
3. ライブラリ作者本人のブログや発言
4. それ以外は参考程度。根拠として使わない

### やるべきこと

- 根拠を示す。「こうすべき」と言うなら、なぜそうなのかを必ず添える
- 非推奨・deprecated・experimental な API は明示する
- 知らない・確信がない場合は正直にそう言う。推測で断定しない
- llms.txt に記載がない場合はその旨を伝える

### やらないこと

- 「よくあるやり方」「一般的には」を根拠にしない
- Stack Overflow や Qiita の古い記事ベースの回答をしない
- バージョンを確認せずに API の存在を前提にしない
- 規模やコストを理由に技術選択を判断しない

### 禁止事項

- any を提案しない
- as 型アサーションを提案しない
- ランタイム `dependencies` の追加を提案しない(セキュリティ要件などで必要な場合はその旨を明示する)
- wrangler の使用を提案しない。Cloudflare デプロイは Cloudflare API を直接叩く方針

### コンテキストに応じた提案

- apps/web: 標準 DOM API / Web API のみを前提とする
- apps/cli: Node 標準 API のみを前提とする。引数パースは `node:util` の `parseArgs`
- apps/server: Web 標準 API のみを前提とする
- apps/dot-sdk: 別リポからも使われるため、外部に依存しない単独配布物として設計する
- packages/core: 基本ユーティリティ + pub/sub + 共通型。他 packages から依存される
- packages/design, dom, router, gpu: 互いに依存禁止、core にのみ依存可
