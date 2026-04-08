# 概要

個人ブログを以下の構成で作る。
llms.txtは各技術について初回の技術的質問があった時点でDownloadすること。デフォルトは通常版を使用し、詳細が必要な場合のみfull版を使用する。

- vite
  - デフォルト: https://vite.dev/llms.txt
  - 詳細が必要な場合: https://vite.dev/llms-full.txt
- Effect.ts
  - デフォルト: https://effect.website/llms.txt
  - 詳細が必要な場合: https://effect.website/llms-full.txt
- Cloudflare
  - デフォルト: https://developers.cloudflare.com/workers/llms.txt
  - 詳細が必要な場合: https://developers.cloudflare.com/workers/llms-full.txt

## 構成

monorepoはpnpm workspaceで管理する。

- apps
  - cli: ef コマンド。ビルド・デプロイ・記事管理を行う。Effect.tsを使用する。
  - site: ブラウザで動作する。Effect.tsを使用する。
  - worker: Cloudflare Workerで動作する。Effect.tsを使用しない。ライブラリは使用しない(セキュリティ要件があれば使用する)。packages/schemaは参照しない。worker内で必要な型は独自に定義する。
- packages
  - schema: Effect.ts Schemaで定義する。siteとcliが使用する。workerは使用しない。
  - その他あれば順次追加する
- dots
  - dot-001: ブログ記事1
    - index.html
    - main.ts
      - 以下をexportする
        - mount(c: DotContext): Unmount
        - meta: Meta
  - dot-002: ブログ記事2
  - ...

## CLI (ef)

デプロイはwranglerではなくCloudflare APIを直接使用する。

- ef -- helpを表示
- ef deploy -- every.fail自体のdeploy
- ef dots -- ブログ一覧(title)表示
- ef dots build -- /dotsで使用する一覧ページ、sitemap.xmlを生成
- ef dots deploy
- ef dot new -- 今のdirに新規dotを作成する
- ef dot dev -- ブログ開発
- ef dot build -- 今のdotフォルダの内容をbuild
- ef dot deploy -- 今のdotフォルダの内容をdeploy
- ef dots migrate -- 全dotリポジトリに対してcodemodeを実行する

## dot-sdk

- packages/dot-sdkとして管理する。npmには公開しない。
- DotContext、Meta、Unmount等の型定義を提供する。
- 各dotリポジトリはdevDependenciesにgit+ssh:でdot-sdkを参照する。
- ef dot newがテンプレート生成時にこの依存設定を自動生成する。
- every-fail側でAPIが変わると全dotリポジトリでtscエラーが出る。

## dotリポジトリ管理

- dotは別リポジトリで管理する。
- every-fail側にdotリポジトリの一覧（git URL等）を管理するファイルを持つ。
- ef dots migrateは一覧をもとに全dotをclone/pullし、codemod（ts-morph等でAST変換）を実行し、型チェックを通し、PRを自動作成する。

## メタデータ仕様 (Meta)

各dotのmain.tsからexportされるmeta。
```ts
type Meta = {
  title: string
  description: string
  tags: string[]
  createdAt: string   // ISO 8601
  updatedAt: string   // ISO 8601
  status: 'draft' | 'published'
  ogImage: string     // OGP画像パス (dot内の相対パス)
}
```

- authorは不要(単著)
- slugは不要(番号がslugを兼ねる)
- categoryは不要(tagsで十分)
- assets定義はmetaに持たない。ビルド時にdotディレクトリ内のファイルを自動収集する。alt textはHTML側に記述する。

## サイト構成

- /
  - indexページ
  - apps/siteに定義する
- /about
  - X/GitHub/Zennへのアクセスなど簡単な自己紹介ページ
  - apps/siteに定義する
- /dots
  - ブログ記事一覧
  - 検索可能
  - queryパラメータによって検索条件を設定できる
  - apps/siteに定義する
- /dots/n
  - ブログ記事
  - 0埋めしない
  - ディレクトリはdots/dot-NNN(0埋め3桁)。URLパス /dots/1 がディレクトリ dots/dot-001 に対応する。
  - 別リポジトリで管理するかもしれない。
- /404
  - notfound
  - apps/siteに定義する

## ビルドについて

dot-NNNのhtmlはcontent部分のみ。
```html
<article>
  <h2>001</h2>
  <p>内容</p>
  <canvas class="1"></canvas>
  <canvas class="2"></canvas>
  <img src="/assets/dot-001/image.png" alt="説明">
</article>
```

ビルドステップでcontent.htmlとfull.htmlが出力される。
今のところKVに保存する予定だが、R2にするかもしれない。

## ブラウザの動作について

ブラウザから初回アクセスされたときはfull.htmlが返される。
その時apps/siteが初期化される。
以後ページが切り替わる度にcontent.htmlを返し、siteの機能を使用してページを切り替える。

- ページ遷移はHistory API (pushState/popState)で管理する。
- ブラウザバック/フォワード時はpopStateイベントで対応するcontent.htmlを取得し差し替える。
- prefetch戦略は未定。必要になった時点で決める。

workerはブラウザからのアクセス(https://every.fail/xx)かapi経由のアクセス(https://every.fail/api/xx)で応答を切り替える。

## 背景canvasについて

背景に画面幅のcanvas要素をposition: fixedで配置する。canvas要素とGPUDeviceはapps/site(シェル)が所有する。

### 描画ループ

- requestAnimationFrameはシェルが実行する
- 各dot・各機能はEffect.tsのpub/subを介してフレームごとの処理を登録する
- 依存性はEffect.Layerで解決する

### dot遷移とトランジション

- dot間の切り替えは即時ではなくトランジションで行う
- トランジションの具体的な方式は未定

### 背景の選択

- dotが独自の背景シェーダーを持つ場合はそれを使う
- 背景なしのdotの場合、シェルが持つデフォルト背景を表示する
- indexページの背景もシェル側で定義する

### ライフサイクル

- 各dotのmount/unmountはEffectを返す方針。詳細は未定。

### WebGPU非対応時

- 背景canvasには何も描画しない
- 各ページ内のcanvas(記事中に埋め込まれたもの)にはシェルからフォールバック機能が渡され、静的画像などを表示する

### z-index

- 背景canvas → コンテンツ → UIの順で前面に重なる

# Agentに期待すること

- Agentはコーチングに徹する。
- Agentはコードを書かない。ただしレビュー指摘やコード片での説明は行ってよい。

## 回答の姿勢

### 情報ソースの優先順位

1. llms.txt / 公式ドキュメント
2. 公式のGitHubリポジトリ(issue, discussion, CHANGELOG)
3. ライブラリ作者本人のブログや発言
4. それ以外は参考程度。根拠として使わない

### やるべきこと

- Effectを使用する箇所では最もEffectらしい実装を最優先にする。
- 根拠を示す。「こうすべき」と言うなら、なぜそうなのかを必ず添える
- 非推奨・deprecated・experimentalなAPIは明示する
- 知らない・確信がない場合は正直にそう言う。推測で断定しない
- llms.txtに記載がない場合はその旨を伝える

### やらないこと

- 「よくあるやり方」「一般的には」を根拠にしない
- Stack OverflowやQiitaの古い記事ベースの回答をしない
- バージョンを確認せずにAPIの存在を前提にしない
- 規模やコストを理由に技術選択を判断しない

### 禁止事項

- anyを提案しない
- as型アサーションを提案しない
- Effect.tsを使用するレイヤー(site, cli)でPromiseベースの提案をしない

### コンテキストに応じた提案

- apps/site, apps/cli: Effect.tsのパターンを前提とする。Promiseベースの提案はしない
- apps/worker: 素のWeb標準APIを前提とする。Effect.tsのパターンを持ち込まない