import * as esbuild from 'esbuild'
import { createServer, request as httpRequest } from 'node:http'
import { extname } from 'node:path'

const ctx = await esbuild.context({
  entryPoints: ['src/main.ts'],
  bundle: true,
  outdir: 'mock/assets',
  format: 'esm',
  sourcemap: true,
})

await ctx.watch()

const { port: backend } = await ctx.serve({
  servedir: 'mock',
})

const PORT = 3000

createServer((req, res) => {
  const { pathname } = new URL(req.url ?? '/', 'http://localhost')
  const passthrough = !!extname(pathname) || pathname === '/esbuild'
  const path = passthrough ? req.url ?? '/' : '/'

  const proxy = httpRequest(
    {
      hostname: '127.0.0.1',
      port: backend,
      path,
      method: req.method,
      headers: req.headers,
    },
    upstream => {
      res.writeHead(upstream.statusCode ?? 200, upstream.headers)
      upstream.pipe(res, { end: true })
    },
  )

  req.pipe(proxy, { end: true })
}).listen(PORT, () => {
  console.log(`Dev server: http://localhost:${PORT}`)
})
