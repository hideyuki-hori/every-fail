# bun

hono ではよく bun を見かけるので bun を使う。

# create

`bunx create-hono <project>` で選択できるもの。

```sh
❯ aws-lambda
  bun
  cloudflare-pages
  cloudflare-workers
  deno
  fastly
  lambda-edge
```

cloudflare-* だけ試す。

# cloudflare-pages

```json
{
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "wrangler pages dev",
    "deploy": "$npm_execpath run build && wrangler pages deploy"
  },
  "dependencies": {
    "hono": "^4.4.2"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20240529.0",
    "@hono/vite-cloudflare-pages": "^0.4.0",
    "@hono/vite-dev-server": "^0.12.1",
    "vite": "^5.2.12",
    "wrangler": "^3.57.2"
  }
}
```

vite の上で開発する。
`$npm_execpath` には package manager の名前が入る。
`npm run deploy` なら `$npm_execpath = npm` のような感じ。

# cloudflare-workers

```json
{
  "scripts": {
    "dev": "wrangler dev src/index.ts",
    "deploy": "wrangler deploy --minify src/index.ts"
  },
  "dependencies": {
    "hono": "^4.4.2"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20240529.0",
    "wrangler": "^3.57.2"
  }
}
```