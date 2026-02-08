import * as esbuild from 'esbuild'

const ctx = await esbuild.context({
  entryPoints: ['src/main.ts'],
  bundle: true,
  outdir: 'mock/assets',
  format: 'esm',
  sourcemap: true,
})

await ctx.watch()

const { host, port } = await ctx.serve({
  servedir: 'mock',
})

console.log(`Dev server: http://localhost:${port}`)
