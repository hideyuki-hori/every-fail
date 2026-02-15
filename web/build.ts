import { rmSync, writeFileSync } from 'node:fs'
import * as esbuild from 'esbuild'

rmSync('out', { recursive: true, force: true })

const result = await esbuild.build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  outdir: 'out',
  format: 'esm',
  minify: true,
  entryNames: '[name]-[hash]',
  metafile: true,
})

for (const [outPath] of Object.entries(result.metafile.outputs)) {
  if (outPath.endsWith('.js')) {
    const filename = outPath.replace(/^out\//, '')
    writeFileSync(
      'out/manifest.json',
      JSON.stringify({ 'main.js': filename }) + '\n',
    )
    console.log(`Built: ${filename}`)
    break
  }
}
