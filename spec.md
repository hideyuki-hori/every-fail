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
  - 例外: `aws4fetch` (apps/cli の `ef dot deploy` で R2 アップロードに使用)。S3 互換 API の AWS Signature V4 を自作するとセキュリティ事故リスクが高いため。
- **wrangler は使用しない**。Cloudflare のデプロイは Cloudflare API を直接叩く方針 (apps/cli の `ef deploy` 等)。

# project 構成

monorepo は pnpm workspace で管理する。

- apps
  - cli: ビルドやデプロイを行うコマンド (`ef`)
  - server: 現時点では Cloudflare Worker で動くが、今後変えるかもしれない
  - web: web ブラウザで表示するもの
  - dot-sdk: 別 repo などで使用する dot の sdk (公開エンドポイント)
- packages
  - core: 基本ユーティリティ + pub/sub + 共通型 (最下層)
  - browser: ブラウザ環境の wrapper (`console.{log,info,error,warn,debug}`、`fetch` など)。apps/web から使う
  - design: design-token (`token('key')` で色コード等を取得)
  - dom: DOM 操作の wrapper
  - router: router 機能 (web / server 両方で使う)
  - gpu: WebGPU の wrapper
- dots: ブログ記事(別リポジトリで管理されるケースもある)

依存方向: `apps → packages` (ディレクトリ階層と一致)。packages 内部の依存方向 (例: `dom → core`) は各 `package.json` の `dependencies` で表現する。

## apps 間の依存

- 原則 apps 同士は依存しない
- 例外: `apps/dot-sdk` への **型のみ依存** (`import type { ... } from '@every-fail/dot-sdk'`) は OK
  - 例: `apps/web` が `DotContext` / `Unmount` / `Meta` 型を import
  - 値 (関数、定数) の依存は禁止
  - 理由: dot-sdk は別リポ向けの公開エンドポイント (apps の中では特別な性質)

## packages のルール

- 各 package の依存は `package.json` の `dependencies` で表現する
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

`yy-mm-dd-<title>` (`ef dot new` した日で固定、Finder 整理用ラベル)

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

## 型 (dot-sdk が提供)

```ts
type DotContext = {
  root: HTMLElement
}
type Unmount = () => void
```

- 最小から始める。GPU / RAF / Router 等は必要になったら追加。

## Meta

```ts
type Meta = {
  id: string
  title: string
  description: string
  tags: string[]
  createdAt: string
  updatedAt: string
  publishedAt?: string
  status: 'draft' | 'published'
  ogImage?: string
}
```

- `id`: NanoID 8文字。`ef dot add` 時に既存と衝突チェック
- `createdAt` / `updatedAt`: ISO 8601
- `createdAt` はフォルダ名の日付と一致 (`ef dot add` した日、不変)
- `publishedAt`: ISO 8601、任意。`status` を `published` にした時点の日時を入れる。`/dots` 一覧のソート基準 (降順、未公開はスキップ)
- `ogImage`: 任意。未指定ならサイト共通のデフォルト画像にフォールバック
- TODO: その他 SEO に必要なもの

# URL 設計

- `/dots/<id>` (id は Meta.id = NanoID 8文字)
- `/dots?q=<keyword>&tag=<tag>` (検索 query 付き、ブラウザ向け)
- `/api/search?q=<keyword>&tag=<tag>` (Worker API、検索結果 JSON を返す)

# SSG / 動的の方針

- 静的ページ (`/`, `/about`, `/dots` デフォルト, `/dots/<id>`, `/404`): 全 SSG → KV / R2 から配信
- 検索 (query 付き `/dots?q=...`): Worker → D1 → 結果 JSON → client 側で描画
- 検索結果ページ自体は SSR しない (SEO 流入は想定しない)

# 検索バックエンド

- Cloudflare D1 (SQLite ベース)
- 検索範囲(現時点): タイトル + tags + description
- 将来 SQLite FTS5 で本文全文検索を追加する余地を残す
- 正本は各 dot の meta.ts、D1 はビルド時に流し込む派生物

# dot リポジトリ

- dot は別リポジトリで管理されるケースがある
- 別リポは `git+ssh:` で `dot-sdk` を `devDependencies` に持つ
- 別リポからは dot-sdk 経由でしか packages を触れないため、dot-sdk は dom / router / gpu などを再エクスポートまたは独自 API で提供する
- TODO: dot-sdk の具体 API 設計(薄い再エクスポート vs 独自 API)

# CLI (ef)

## コマンド一覧

```
ef                                    引数省略時は対話メニュー (config / dot)
ef config <key> <action> [<value>]    設定操作 (get / set / unset / list)
ef build                              基盤 (web / /dots 一覧 / sitemap) を build
ef deploy [--apply]                   基盤を Cloudflare に deploy (default dry-run)
ef dot add <title>                    新規 dot を作成
ef dot rm <folder>                    dot を削除 (フォルダ + dots テーブル)
ef dot dev                            ブログ開発 (preview)
ef dot build                          dot フォルダの内容を build
ef dot deploy [--apply]               dot フォルダの内容を deploy (default dry-run)
ef dot deploy --all [--apply]         全 dot を順次 deploy
```

- 共通フラグ: `--apply` を付けない限り deploy 系は dry-run (PUT/DELETE 対象を出力するだけ)
- TODO: 各 dot コマンドの詳細仕様

## ~/.ef/ ディレクトリ

- 設定 DB: `~/.ef/db` (sqlite)
- 将来 `~/.ef/` 配下にテンプレ画像等を配置する余地
- 初回操作で `~/.ef/` が無ければ自動作成

## sqlite ライブラリ

- `node:sqlite` (Node 24+ で stable)

## settings テーブル

```sql
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TRIGGER settings_updated_at
AFTER UPDATE ON settings
BEGIN
  UPDATE settings SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    WHERE key = NEW.key;
END;
```

- `value` は TEXT 固定。整数を入れる場合も文字列保存し、CLI 側で `parseInt`
- キー命名規則: kebab-case

## dots テーブル

dot の id 衝突チェック・一覧管理用。

```sql
CREATE TABLE dots (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TRIGGER dots_updated_at
AFTER UPDATE ON dots
BEGIN
  UPDATE dots SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    WHERE id = NEW.id;
END;
```

- `id` は NanoID 8文字、各 dot の `meta.ts` の `id` と一致
- `ef dot new` 時に衝突チェック (`SELECT 1 FROM dots WHERE id = ?`)、衝突したら再生成
- 最小スキーマ。将来 title / folder_path / repo_path 等を追加する余地

## 設定キーのホワイトリスト

| key | 管理者 | 用途 |
|---|---|---|
| `every-fail-root-path` | ユーザー | monorepo の dots/ パス |
| `cloudflare-account-id` | ユーザー | Cloudflare Account ID |
| `cloudflare-kv-namespace-id` | ユーザー | KV namespace ID (HTML 用) |
| `cloudflare-r2-bucket` | ユーザー | R2 bucket name (assets 用) |
| `schema-version` | CLI | スキーマバージョン (integer、1 → 2 → 3 ...) |

- `ef config <key>` で操作できるのはユーザー管理キーのみ
- CLI 自動管理キーは `ef config` の操作対象外
- `ef config list` では全キーを表示(デバッグ用)
- 未知キーへの `set` は exit 1

### secret は環境変数

| 環境変数 | 用途 |
|---|---|
| `EF_CLOUDFLARE_API_TOKEN` | Cloudflare API token (KV 操作用) |
| `EF_CLOUDFLARE_R2_ACCESS_KEY_ID` | R2 用 Access Key ID (S3 互換 API) |
| `EF_CLOUDFLARE_R2_SECRET_ACCESS_KEY` | R2 用 Secret Access Key (S3 互換 API) |

- secret は `~/.ef/db` に保管しない (id 系は db、token / key 系は env)
- R2 は KV と認証が分かれている (Cloudflare R2 → Manage R2 API Tokens で発行)

## ef config コマンド

- 形式: `ef config <key> <action> [<value>]`
- アクション: `get` / `set` / `unset` / `list`
- `set` のバリデーション: path 系キーは `stat` で path 存在確認、失敗で exit 1
- 未設定で必要操作 → exit 1 (明示的 `init` は作らない)
- 例:
  - `ef config every-fail-root-path set ~/h/every-fail`
  - `ef config every-fail-root-path get`
  - `ef config every-fail-root-path unset`
  - `ef config list`

## マイグレーション

- マイグレーション SQL を CLI 内に静的に持つ (`001_to_002.sql` 形式)
- CLI 起動時に `schema-version` を読み、期待値より小さければ順次実行
- 完了後 `UPDATE settings SET value = N WHERE key = 'schema-version'`
- 初期: `schema-version = 1`

## 引数省略時の対話メニュー

- `ef` → `config / dot / build / deploy` を選択
- `ef dot` → `add / rm / dev / build / deploy` を選択
- 入力方式: ホットキー (1-9) + 移動 (jk) + Enter で決定 + Esc/Ctrl-C で中止
- 実装: `node:readline` の keypress イベント
- 非 TTY 時 (CI / パイプ等): exit 1 + ヘルプ表示

# サイト構成

- `/` index ページ
- `/about` 自己紹介
- `/dots` 一覧、検索、query パラメータで条件設定
- `/dots/<id>` 記事
- `/404` notfound
- TODO: 各ページの詳細

# ビルド

## 用語

- `index.html`: 完全な HTML (head + body 一式、初回アクセス用 / SEO 用)
- `partial.html`: `<article>` 部分のみ (SPA 遷移時に fetch して差し替える)

## dot の build 出力

`<every-fail-root-path>/dist/dots/<id>/` 以下に:

```
index.html        dot の完全 HTML (テンプレ展開済)
partial.html      dot 本体 (mount() で root に追加された innerHTML)
assets/           dot の assets/ をコピー
```

## 基盤 (`ef build`) の出力

```
<root>/dist/pages/index/index.html       /
<root>/dist/pages/about/index.html       /about
<root>/dist/pages/dots/index.html        /dots (一覧)
<root>/dist/pages/404.html               /404
<root>/dist/sitemap.xml                  サイトマップ
<root>/dist/assets/                      基盤側の共通アセット
```

## 保存先

- HTML (index.html / partial.html / 404.html / sitemap.xml): Cloudflare KV
- assets (画像 / shader / 動画など): Cloudflare R2

## TODO

- アセット管理 (dot 内のファイルを自動収集する仕組み)
- D1 への meta 流し込み (#14)

# Cloudflare デプロイ

## 方針

- `wrangler` は使わない、Cloudflare API を直接叩く
- credential はハイブリッド管理: token は環境変数、id 系は `~/.ef/db`
- すべての deploy 系コマンドは **default dry-run**、`--apply` で実際に PUT/DELETE する
- アップロードは **scoped delete + upload** (差分はとらない、毎回全部 upload)

## KV キー設計

```
dots/<id>/index.html            個別記事 (完全 HTML)
dots/<id>/partial.html          個別記事 (article 部分のみ)
pages/index/index.html          /
pages/about/index.html          /about
pages/dots/index.html           /dots (一覧)
pages/404.html                  /404
sitemap.xml                     サイトマップ
```

## R2 キー設計

```
dots/<id>/assets/<path>         dot の assets
assets/<path>                   基盤側の共通アセット (ロゴ等)
```

## scoped delete + upload

deploy ごとに自分の prefix を全削除 → upload する。差分はとらない。

| コマンド | 削除する prefix |
|---|---|
| `ef dot deploy <id>` | KV: `dots/<id>/*` / R2: `dots/<id>/*` |
| `ef deploy` | KV: `pages/*`, `sitemap.xml` / R2: `assets/*` (`dots/*` は除外) |

短いウィンドウで該当 URL が 404 になる可能性あり (Cloudflare の eventual consistency、数秒〜)。個人ブログ運用なので許容。

## dry-run / apply

- default: dry-run。PUT/DELETE 対象のキー一覧を表示するだけ
- `--apply`: 実際に Cloudflare API を叩く
- 失敗時はエラー出力 + exit 1 (ローカル build 出力は残るのでリトライ可能)

## 必要な認証情報

| 種別 | 場所 | キー |
|---|---|---|
| Cloudflare API token (KV 用) | env | `EF_CLOUDFLARE_API_TOKEN` |
| R2 Access Key ID | env | `EF_CLOUDFLARE_R2_ACCESS_KEY_ID` |
| R2 Secret Access Key | env | `EF_CLOUDFLARE_R2_SECRET_ACCESS_KEY` |
| Account ID | `~/.ef/db` | `cloudflare-account-id` |
| KV namespace ID | `~/.ef/db` | `cloudflare-kv-namespace-id` |
| R2 bucket name | `~/.ef/db` | `cloudflare-r2-bucket` |

## 削除した dot を Cloudflare から消す

`ef dot rm` はローカル削除のみ。Cloudflare 側の削除は別途 (TODO):
- `ef dot deploy --delete <id>` (upload せずに削除のみ) を予定

# ブラウザ動作

- TODO: 初回 index.html、以降 partial.html
- TODO: History API (pushState / popState) でページ遷移
- TODO: prefetch 戦略

# 背景 canvas

- 後回し
- TODO: 全般(canvas 所有 / 描画ループ / dot 遷移トランジション / ライフサイクル / WebGPU 非対応時 / z-index)

# dot リポジトリ管理

- TODO: dot リポジトリ一覧(git URL 等)を管理するファイル
- TODO: `ef dots migrate` の codemod 実装(ts-morph 等で AST 変換)
- TODO: 型チェック・PR 自動作成
