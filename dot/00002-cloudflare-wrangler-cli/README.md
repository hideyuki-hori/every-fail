## wrangler(引数なし)

`-h` をつけてもつけなくても help が表示される。
以下 ChatGPT を通して日本語化した。

```sh
Commands:
wrangler docs [command..]            📚 wrangler のドキュメントをブラウザで開きます
wrangler init [name]                 📥 wrangler.toml ファイルを含む基本的な Worker プロジェクトを初期化します
wrangler generate [name] [template]  ✨ 既存の Worker テンプレートから新しい Worker プロジェクトを生成します。https://github.com/cloudflare/templates を参照してください
wrangler dev [script]                👂 Worker を開発するためのローカルサーバーを起動します
wrangler deploy [script]             🆙 Worker を Cloudflare にデプロイします。[エイリアス: publish]
wrangler delete [script]             🗑  Cloudflare から Worker を削除します。
wrangler tail [worker]               🦚 公開された Worker のログテイリングセッションを開始します。
wrangler secret                      🤫 Worker で参照できるシークレットを生成します
wrangler secret:bulk [json]          🗄️  Worker のシークレットを一括アップロードします
wrangler kv:namespace                🗂️  Workers KV の名前空間を操作します
wrangler kv:key                      🔑 Workers KV のキーバリューペアを個別に管理します
wrangler kv:bulk                     💪 複数の Workers KV のキーバリューペアを一度に操作します
wrangler pages                       ⚡️ Cloudflare Pages を設定します
wrangler queues                      🇶 Workers Queues を設定します
wrangler r2                          📦 R2 ストアを操作します
wrangler dispatch-namespace          📦 ディスパッチ名前空間を操作します
wrangler d1                          🗄  D1 データベースを操作します
wrangler hyperdrive                  🚀 Hyperdrive データベースを設定します
wrangler ai                          🤖 AI モデルを操作します
wrangler constellation               🤖 Constellation モデルを操作します
wrangler vectorize                   🧮 Vectorize インデックスを操作します
wrangler pubsub                      📮 Pub/Sub ブローカーを操作および管理します
wrangler mtls-certificate            🪪 mTLS 接続に使用される証明書を管理します
wrangler login                       🔓 Cloudflare にログインします
wrangler logout                      🚪 Cloudflare からログアウトします
wrangler whoami                      🕵️  ユーザー情報を取得し、認証設定をテストします
wrangler types                       📝 設定ファイルのバインディングとモジュールルールから型を生成します
wrangler deployments                 🚢 デプロイメントの一覧表示と詳細表示を行います
wrangler rollback [deployment-id]    🔙 デプロイメントをロールバックします
Flags:
-j, --experimental-json-config  実験的: wrangler.json をサポートします [boolean]
-c, --config                    .toml 設定ファイルへのパス [string]
-e, --env                       操作と .env ファイルに使用する環境 [string]
-h, --help                      ヘルプを表示します [boolean]
-v, --version                   バージョン番号を表示します [boolean]
```