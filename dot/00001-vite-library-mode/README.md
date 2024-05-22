## 目的

library mode の調査。

# 結論

- 基本的に画像はインライン化される
- library mode で `assetsInlineLimit: 0` は効かない

## vite

最初の選択肢は Others を使用する。

```sh
npm create vite@
latest
✔ Project name: … library
✔ Select a framework: › Others
✔ Select a variant: › create-vite-extra ↗
✔ Select a template: › library
✔ Select a variant: › TypeScript

Scaffolding project in /Users/h/h/repos/every-fail/dot/00001-vite-library-mode/library...

Done. Now run:

  cd library
  npm install
  npm run dev
```
