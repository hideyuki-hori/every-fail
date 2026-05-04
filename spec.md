# 概要

個人ブログを作る。
ライブラリは使用しない。
できるだけSSGする。
WebGPU/WebGL/Audio など使用する。
1記事を dot と呼ぶ。
今後 html, css, js は独自言語で書けるようにする予定。

# 依存方針

- ランタイム `dependencies` は 0。
- `devDependencies` のみ使用する (vite, typescript, vitest, biome 等)。
- セキュリティ要件などでランタイム依存が必要になった場合は個別に議論する。

# project 構成

monorepo は pnpm workspace で管理する。

- apps
  - cli: ビルドやデプロイを行うコマンド (`ef`)
  - server: 現時点では Cloudflare Worker で動くが、今後変えるかもしれない
  - web: web ブラウザで表示するもの
  - dot-sdk: 別 repo などで使用する dot の sdk
- packages
  - core: 基本ユーティリティ + pub/sub + 共通型
  - design: design-token (`token('key')` で色コード等を取得)
  - dom: DOM 操作の wrapper
  - router: router 機能 (web / server 両方で使う)
  - gpu: WebGPU の wrapper
- dots: ブログ記事(別リポジトリで管理されるケースもある)

## packages のルール

- packages 同士は依存禁止。ただし `core` は例外で他 packages から依存可能。
- 公開 API は `index.ts` の export のみ。`package.json` の `exports` フィールドで強制する:

```json
{
  "exports": {
    ".": "./src/index.ts"
  }
}
```

# dots

## フォルダ命名

`yyyy-mm-dd-<title>` (`ef dot new` した日で固定、Finder 整理用ラベル)

## 内部構成

- `meta.ts`
- `main.ts`
  - 以下を export する
    - `mount(c: DotContext): Unmount`
    - `meta: Meta`
- 記事は default で markdown、html でも ok
- ビルド方法を指定すればライブラリも使用可能(dot 内に限る)
- worker 側の専用アクションも定義可能
  - TODO: 実装方法を考える

## Meta

```ts
type Meta = {
  id: string
  title: string
  description: string
  tags: string[]
  createdAt: string
  updatedAt: string
  status: 'draft' | 'published'
  ogImage?: string
}
```

- `id`: NanoID 8文字。`ef dot new` 時に既存と衝突チェック
- `createdAt` / `updatedAt`: ISO 8601
- `createdAt` はフォルダ名の日付と一致 (`ef dot new` した日、不変)
- `ogImage`: 任意。未指定ならサイト共通のデフォルト画像にフォールバック
- TODO: `publishedAt` を追加するか(`/dots` 一覧のソート基準を決める時に再検討)
- TODO: その他 SEO に必要なもの

# URL 設計

- `/dots/<id>` (id は Meta.id = NanoID 8文字)

# dot リポジトリ

- dot は別リポジトリで管理されるケースがある
- 別リポは `git+ssh:` で `dot-sdk` を `devDependencies` に持つ
- 別リポからは dot-sdk 経由でしか packages を触れないため、dot-sdk は dom / router / gpu などを再エクスポートまたは独自 API で提供する
- TODO: dot-sdk の具体 API 設計(薄い再エクスポート vs 独自 API)

# CLI (ef)

```
ef                helpを表示
ef deploy         every.fail 自体の deploy
ef dots           ブログ一覧 (title) 表示
ef dots build     /dots で使用する一覧ページ、sitemap.xml を生成
ef dots deploy
ef dot new        今の dir に新規 dot を作成する
ef dot dev        ブログ開発
ef dot build      今の dot フォルダの内容を build
ef dot deploy     今の dot フォルダの内容を deploy
ef dots migrate   全 dot リポジトリに対して codemod を実行する
```

- TODO: 各コマンドの詳細仕様

# サイト構成

- `/` index ページ
- `/about` 自己紹介
- `/dots` 一覧、検索、query パラメータで条件設定
- `/dots/<id>` 記事
- `/404` notfound
- TODO: 各ページの詳細

# ビルド

- TODO: content.html / full.html の生成方針
- TODO: 保存先 (KV / R2 のどちらにするか)
- TODO: アセット管理(dot 内のファイルを自動収集する仕組み)

# ブラウザ動作

- TODO: 初回 full.html、以降 content.html
- TODO: History API (pushState / popState) でページ遷移
- TODO: prefetch 戦略

# 背景 canvas

- 後回し
- TODO: 全般(canvas 所有 / 描画ループ / dot 遷移トランジション / ライフサイクル / WebGPU 非対応時 / z-index)

# dot リポジトリ管理

- TODO: dot リポジトリ一覧(git URL 等)を管理するファイル
- TODO: `ef dots migrate` の codemod 実装(ts-morph 等で AST 変換)
- TODO: 型チェック・PR 自動作成
