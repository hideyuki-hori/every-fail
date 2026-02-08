# every.fail を作り始めた

背景でWebGPUアートが途切れずに動き続けるブログシステムを作ることにした。

## なぜ作るのか

既存のブログシステムは、どれも似たような見た目になりがちだ。WebGPUを使えば、ブラウザ上でGPUを直接叩いてリアルタイムな背景アートを描画できる。

## 技術スタック

- **Rust**: CLIツール、Cloudflare Worker
- **TypeScript**: WebGPUレンダラー、SPAルーター
- **Markdown**: 記事執筆

フレームワークは使わない。すべて自前で組む。

## SPA + SSG の両立

SEOにはページごとの完全なHTMLが必要だが、SPAでないとWebGPU背景が途切れてしまう。

解決策として、ビルド時にSSG済みHTMLを生成しつつ、ブラウザではSPAとして動作させる。ページ遷移時はHTML断片をfetchしてDOMを差し替えるだけなので、canvasは常に生きている。
