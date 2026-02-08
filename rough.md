# every.fail ラフ設計

## 目的

背景でWebGPUアートが途切れずに動き続けるブログシステム。

- SPA構成、Markdownで記事執筆
- レスポンシブ対応、SEO対策（SSG）
- Cloudflare Workers + Static Assets でホスティング
- 差分ビルド、できるだけ事前にbuild
- CLIデプロイ（GitHub連携なし）
- 言語: Rust（ブログシステム, CF Worker）、TypeScript（WebGPU）
- React/Solid/Astro等のフレームワーク不使用

---

## アーキテクチャ概要

```
ef build
  .pen        → CSS custom properties + web/generated/tokens.ts
  Markdown    → HTML断片 + メタデータJSON
  Templates   + HTML断片 → SSG済みHTML (SEO用)
  TypeScript  → JS bundle (esbuild)
  WGSL        → コピー
      ↓ dist/
Cloudflare Workers + Static Assets
  /index.html              一覧
  /{uuid-v7}/index.html    SSG済み記事HTML
  /articles/{uuid-v7}.*    HTML断片 + メタデータJSON (SPA用)
  /assets/                 JS, WGSL, CSS
  Worker (WASM)            静的配信 + 動的処理
      ↓
ブラウザ
  初回: SSG済みHTML → SPA化
  遷移: fetch(/articles/{id}.html) → DOM差し替え
  背景: WebGPU canvas (常時描画)
```

---

## SSG + SPA 両立戦略

### 問題

SEOにはページごとの完全なHTMLが必要だが、SPAでないとWebGPU背景が途切れる。

### 解決

1. ビルド時に各記事の**完全なHTML**を生成（`/{uuid-v7}/index.html`）
   - `<title>`, `<meta>`, OGP, 構造化データを含む
   - 記事本文をHTMLとして埋め込み
   - クローラーはこれを読む
2. ブラウザでJSが読み込まれると**SPAモード**に移行
   - `popstate` / リンクインターセプトでクライアントルーティング
   - 遷移時は `/articles/{id}.html`（HTML断片）をfetchしてDOMを差し替え
   - `<head>` 内の `<title>`, `<meta>` もJSで更新
3. WebGPU canvasは `index.html` シェルに固定、記事コンテンツ領域だけ差し替え

### ページ構造

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <title>{{title}}</title>
  <meta name="description" content="{{description}}">
  <!-- OGP tags -->
</head>
<body>
  <canvas id="gpu"></canvas>
  <div id="app">
    <header><!-- ナビゲーション --></header>
    <main id="content">
      {{content}}
    </main>
  </div>
  <script type="module" src="/assets/main.js"></script>
</body>
</html>
```

---

## ディレクトリ構成

```
every-fail/
├── .gitignore
├── design.pen              # design tokens マスターデータ (Pencil)
├── crates/
│   ├── Cargo.toml          # ワークスペース
│   ├── cli/                # ef コマンド
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── main.rs
│   │       ├── markdown.rs
│   │       ├── template.rs
│   │       ├── tokens.rs
│   │       ├── manifest.rs
│   │       └── sitemap.rs
│   └── worker/             # CF Worker (WASM)
│       ├── Cargo.toml
│       └── src/
│           └── lib.rs
├── articles/               # 記事データ
│   └── {uuid-v7}/
│       ├── index.md
│       ├── meta.toml
│       └── ...
├── templates/
│   ├── shell.html
│   ├── post.html
│   └── index.html
├── web/                    # TypeScript (WebGPU + ルーター)
│   ├── package.json
│   ├── main.ts
│   ├── router.ts
│   ├── generated/
│   │   └── tokens.ts
│   ├── gpu/
│   │   ├── renderer.ts
│   │   └── shaders/
│   ├── ui/
│   │   └── theme.ts
│   ├── mock/               # 開発用モックデータ (10記事)
│   │   ├── index.html
│   │   └── articles/
│   └── out/                # esbuild 出力
├── dist/                   # ビルド出力
└── rough.md
```

---

## URL設計

記事URLはルート直下に UUID v7 を配置する。slug なし。

```
/{uuid-v7}
```

例: `every.fail/01961a2c-0000-7000-8000-000000000001`

- slug 管理が不要（一意性チェック、リダイレクト管理なし）
- UUID v7 にタイムスタンプが含まれるので時系列が自明
- SNSシェア時は OGP の title/description で内容が伝わる

### ルーティング判定

- UUID v7 形式のパス → 記事
- それ以外 → 固定ページ (`/about` 等)

### SPA遷移時の fetch パス

```
/articles/{uuid-v7}.html   HTML断片
/articles/{uuid-v7}.json   メタデータ
```

### dist 構成

```
dist/
├── index.html                          一覧
├── {uuid-v7}/index.html                SSG済み記事HTML
├── articles/{uuid-v7}.html             HTML断片 (SPA用)
├── articles/{uuid-v7}.json             メタデータJSON (SPA用)
├── articles/{uuid-v7}/hero.png         記事画像
└── assets/                             JS, WGSL, CSS
```

---

## 記事データ構造

### articles/{uuid-v7}/

```
01961a2c-0000-7000-8000-000000000001/
├── index.md        # 本文 (frontmatterなし)
├── meta.toml       # メタデータ
└── hero.png        # 画像等 (任意)
```

### meta.toml

```toml
title = "記事タイトル"
date = 2025-01-01
description = "記事の概要"
tags = ["rust", "webgpu"]
draft = false
```

### index.md 内の画像参照

```markdown
![説明](./hero.png)
```

ビルド時に `dist/articles/{id}/hero.png` にコピーされる。

---

## ef CLI

### インストール

```bash
cargo install --path crates/cli
```

`~/.cargo/bin/ef` にバイナリが配置される。

### 設定ファイル

`~/.config/ef/main.toml` (パーミッション 600)

```toml
project_dir = "/Users/h/h/every-fail"

[cloudflare]
api_token = "xxx"
account_id = "xxx"
worker_name = "every-fail"
```

ef はこのファイルから project_dir を読み、articles/ や templates/ 等のパスを解決する。

### ヘルプ出力

```
$ ef -h
every-fail blog system

Usage: ef <COMMAND>

Commands:
  build   Build the site
  serve   Start local development server
  new     Create a new article
  deploy  Deploy to Cloudflare Workers
  help    Print this message or help about a subcommand

Options:
  -h, --help     Print help
  -V, --version  Print version
```

```
$ ef build -h
Build the site

Usage: ef build [OPTIONS]

Options:
      --full    Full rebuild (ignore manifest)
  -h, --help    Print help
```

```
$ ef serve -h
Start local development server

Usage: ef serve [OPTIONS]

Options:
  -p, --port <PORT>    Port to listen on [default: 3000]
  -h, --help           Print help
```

```
$ ef new -h
Create a new article

Usage: ef new [OPTIONS]

Options:
  -t, --title <TITLE>    Article title
  -h, --help             Print help
```

```
$ ef deploy -h
Deploy to Cloudflare Workers

Usage: ef deploy [OPTIONS]

Options:
      --dry-run    Show what would be deployed without deploying
  -h, --help       Print help
```

### サブコマンド詳細

#### ef build

- articles/ を走査して dist/ に静的サイトを生成
- web/out/ のビルド済みJSを dist/assets/ にコピー
- デフォルトは差分ビルド、`--full` でフルビルド
- 処理: tokens抽出 → 記事パース → テンプレート展開 → web/out/ コピー → sitemap等

#### ef build の生成物

- `dist/{uuid-v7}/index.html` — SSG済み記事HTML
- `dist/articles/{uuid-v7}.html` — HTML断片 (SPA用)
- `dist/articles/{uuid-v7}.json` — メタデータJSON (SPA用)
- `dist/articles/{uuid-v7}/` — 記事画像等
- `dist/index.html` — 一覧ページ
- `dist/assets/main.js` — JSバンドル
- `dist/assets/shaders/` — WGSL
- `dist/sitemap.xml`
- `dist/robots.txt`
- `dist/.manifest.json` — 差分ビルド用

#### ef serve

- dist/ を配信するローカル開発サーバー
- ファイル監視 (notify クレート): articles/, templates/ の変更を検知 → 自動再ビルド
- live reload: WebSocket でブラウザに接続、再ビルド完了時にリロード信号送信

#### ef new

- UUID v7 ディレクトリを生成
- index.md + meta.toml のスキャフォールド

#### ef deploy

- CF Workers API を直接呼び出し、WASM + dist/ をまとめてデプロイ (Workers + Static Assets)
- 認証情報は設定ファイルから読む

### ビルド処理フロー

1. **design tokens抽出**: `design.pen`（JSON）をパース
   - variables セクションから色・フォント等のトークンを抽出
   - CSS custom properties を生成 → テンプレートに埋め込み
   - `web/generated/tokens.ts` を生成 → WebGPUで使用
2. **記事パース**: `articles/{uuid-v7}/` を走査
   - `meta.toml` からメタデータ抽出
   - `index.md` を `pulldown-cmark` でHTML変換
   - HTML断片を生成 → `dist/articles/{id}.html`
   - メタデータJSON → `dist/articles/{id}.json`
   - 画像等を `dist/articles/{id}/` にコピー
3. **テンプレート展開**: 各記事のSSG用完全HTML生成
   - `templates/post.html` にメタデータと本文を埋め込み
   - → `dist/{uuid-v7}/index.html`
4. **一覧ページ生成**: 記事メタデータから一覧HTML生成
   - → `dist/index.html`
5. **フロントエンドコピー**: web/out/ のビルド済みJSを dist/assets/ にコピー
6. **sitemap.xml / robots.txt** 生成
7. **マニフェスト更新**: ファイルハッシュを記録

### 差分ビルド

- `dist/.manifest.json` にファイルパスとSHA-256ハッシュを記録
- ビルド時にソースファイルのハッシュと比較
- 変更があったファイルのみ再生成
- `--full` で全ファイル再生成

---

## web/ 開発

web/ はフロントエンド単体で開発する。ef とは独立。

```bash
cd web && pnpm dev    # esbuild watch + dev server (mock データ使用)
cd web && pnpm build  # 本番ビルド → out/
```

- `pnpm dev`: esbuild --serve で mock/ を servedir にして配信。SPA遷移やWebGPUの単体テストが可能
- `pnpm build`: minify 済み JS を out/ に出力。ef build はこれを dist/assets/ にコピー
- `mock/`: 10記事分の固定モックデータ (HTML断片 + メタデータJSON + 一覧HTML)。リポジトリにコミット

### クライアントルーター (`web/router.ts`)

1. 初期化時に全リンクの `click` イベントをインターセプト
2. 内部リンクなら `e.preventDefault()` → `history.pushState`
3. `/articles/{id}.html` をfetch → `#content` のinnerHTMLを差し替え
4. `/articles/{id}.json` をfetch → `<title>`, `<meta>` を更新
5. `popstate` イベントで戻る/進むに対応

### ルーティング規則

| パス | 表示内容 | 判定 |
|------|----------|------|
| `/` | 記事一覧 | |
| `/{uuid-v7}` | 記事詳細 | UUID v7 形式 |
| `/about` 等 | 固定ページ | それ以外 |

### WebGPU (`web/gpu/`)

- `<canvas id="gpu">` はbody直下、`position: fixed` で背景配置
- `#app` は `position: relative` で上に重ねる
- レンダラーは `requestAnimationFrame` で常時描画
- ページ遷移に影響されない（DOMが差し替わるのは `#content` のみ）
- WebGPU非対応ブラウザではcanvasを非表示にしCSS背景にフォールバック

---

## Cloudflare Workers + Static Assets (`crates/worker`)

Workers + Static Assets で静的配信と動的処理を一本化。

### 役割

- dist/ の静的ファイル配信
- リダイレクト処理
- OGP画像の動的生成
- APIエンドポイント（将来拡張用）

### ビルド

`workers-rs` を使用してRust → WASMにコンパイル。

---

## Design Tokens

### マスターデータ

`design.pen`（Pencil で管理）が単一ソース。実体はJSONで、Rust CLI が直接パースする。

### 生成物

| 生成先 | 用途 |
|--------|------|
| CSS custom properties | HTMLテンプレートに埋め込み、UIスタイリング |
| `web/generated/tokens.ts` | WebGPUシェーダーへの色渡し、TS側のテーマ参照 |

### 生成される tokens.ts の例

```typescript
export const colors = {
  bg: [0.04, 0.04, 0.04, 1.0],
  text: [0.88, 0.88, 0.88, 1.0],
  accent: [1.0, 0.42, 0.21, 1.0],
} as const;
```

WebGPU シェーダーには `vec4<f32>` として渡せる形式で出力。

---

## 依存クレート

| クレート | 用途 |
|---------|------|
| `pulldown-cmark` | Markdown→HTMLパース |
| `serde` / `serde_json` | メタデータ / マニフェスト |
| `toml` | meta.toml パース |
| `sha2` | 差分ビルド用ハッシュ |
| `glob` | ファイル走査 |
| `clap` | CLIパーサー |
| `notify` | ファイル監視 (ef serve) |
| `reqwest` | CF API 呼び出し (デプロイ) |
| `workers-rs` | CF Worker (WASM) |

## npm依存 (web/package.json)

| パッケージ | 用途 |
|-----------|------|
| `esbuild` | TSバンドル |

---

## レスポンシブ

- CSSのみで対応（メディアクエリ）
- モバイル: 記事全幅、ナビゲーションはハンバーガーメニュー
- デスクトップ: コンテンツ中央寄せ（`max-width: 768px`）
- WebGPUキャンバスはビューポート全体に追従（`100vw × 100vh`）

## SEO

- 各記事に固有の `<title>`, `<meta description>`, OGPタグ
- `sitemap.xml` 自動生成
- `robots.txt` 配置
- SSG済みHTMLでクローラーが完全なコンテンツを取得可能
- 構造化データ（JSON-LD）で記事情報をマークアップ

---

## ブログ執筆ワークフロー

```bash
$ ef new -t "RustでWebGPUを触ってみた"
Created: articles/01961a2c-3f00-7abc-8000-def123456789/
  → index.md
  → meta.toml

$ vim articles/01961a2c-3f00-7abc-8000-def123456789/index.md
$ cp ~/Downloads/arch.png articles/01961a2c-3f00-7abc-8000-def123456789/

$ ef serve
Built 1 article (3 assets)
Listening on http://localhost:3000
Watching for changes...
```

ファイルを保存すると自動で再ビルド → ブラウザが live reload される。

```bash
$ ef deploy
Deploying to Cloudflare Workers...
Done: https://every.fail
```

---

## 全機能一覧

### ef CLI (crates/cli)

- [ ] `ef build`: フルビルド
- [ ] `ef build`: 差分ビルド (マニフェスト + SHA-256 比較)
- [ ] `ef build`: design tokens 抽出 (.pen → CSS custom properties + web/generated/tokens.ts)
- [ ] `ef build`: meta.toml パース
- [ ] `ef build`: Markdown → HTML 変換 (pulldown-cmark)
- [ ] `ef build`: 画像等アセットのコピー
- [ ] `ef build`: テンプレート展開 → SSG済みHTML生成
- [ ] `ef build`: 一覧ページ生成
- [ ] `ef build`: web/out/ コピー
- [ ] `ef build`: WGSL シェーダーコピー
- [ ] `ef build`: sitemap.xml 生成
- [ ] `ef build`: robots.txt 生成
- [ ] `ef build`: JSON-LD 構造化データ埋め込み
- [ ] `ef serve`: ローカル開発サーバー + ファイル監視 (notify) + live reload (WebSocket)
- [ ] `ef new`: 記事スキャフォールド (UUID v7 ディレクトリ + meta.toml + index.md 生成)
- [ ] `ef deploy`: CF Workers + Static Assets デプロイ (CF API 直接呼び出し、WASM + dist/ を一括)

### 記事データ (articles/)

- [ ] `articles/{uuid-v7}/index.md` + `meta.toml` + 画像等
- [ ] meta.toml スキーマ (title, date, description, tags, draft)
- [ ] index.md 内の相対パス画像参照

### テンプレート (templates/)

- [ ] shell.html: SPAシェル / SSGベーステンプレート
- [ ] post.html: 記事ページテンプレート
- [ ] index.html: 一覧ページテンプレート

### フロントエンド (web/)

- [ ] クライアントルーター (pushState + popstate + リンクインターセプト)
- [ ] SPA遷移: HTML断片 fetch → DOM差し替え
- [ ] SPA遷移: メタデータJSON fetch → title/meta 更新
- [ ] WebGPU レンダラー初期化
- [ ] WebGPU シェーダー (WGSL)
- [ ] WebGPU 非対応ブラウザのフォールバック (CSS背景)
- [ ] design tokens 参照 (generated/tokens.ts → WebGPU色定義)
- [ ] 最低限のCSS
- [ ] レスポンシブ対応 (メディアクエリ)
- [ ] モックデータ (10記事)

### SEO

- [ ] 各記事の `<title>` + `<meta description>`
- [ ] OGP タグ
- [ ] sitemap.xml
- [ ] robots.txt
- [ ] JSON-LD 構造化データ

### Cloudflare Workers + Static Assets (crates/worker)

- [ ] dist/ の静的ファイル配信
- [ ] リダイレクト処理
- [ ] OGP画像の動的生成
- [ ] APIエンドポイント (将来拡張用)

### インフラ / 設定

- [ ] crates/Cargo.toml ワークスペース設定
- [ ] web/package.json (esbuild)
- [ ] ~/.config/ef/main.toml
- [ ] design.pen (Pencil でトークン管理)

---

## フェーズ計画

### Phase 0: 開発環境構築

- crates/ ワークスペース (Cargo.toml)
- crates/cli/ スキャフォールド
- crates/worker/ スキャフォールド
- web/package.json (esbuild)
- .gitignore
- articles/ ディレクトリ
- templates/ ディレクトリ

### Phase 1: ローカル開発で記事が読める

スコープ: 記事を書いてビルドしてブラウザで確認できる

- ef build: meta.toml パース + Markdown → HTML + テンプレート展開 + web/out/ コピー
- ef serve: ローカル開発サーバー + watch + live reload
- ef new: 記事スキャフォールド
- 記事データ: articles/{uuid-v7}/index.md + meta.toml + 画像
- 一覧ページ生成
- クライアントルーター (SPA遷移)
- 最低限のCSS
- web/ モックデータ

#### Phase 1 で外すもの

- WebGPU アート
- design tokens (.pen) → CSS直書き
- 差分ビルド → フルビルド
- SEO → `<title>` のみ
- CF Workers + Static Assets → phase 1 ではデプロイしない
- レスポンシブ → デスクトップのみ

### Phase 2: TBD

### Phase 3: TBD

---

## 未決事項

- ef serve の SPA フォールバック挙動
