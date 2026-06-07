import { cpSync, mkdirSync, readdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const root = import.meta.dirname
const dist = join(root, 'dist')

function buildPage(srcDir: string, htmlOut: string) {
  const src = join(root, srcDir)
  for (const entry of readdirSync(src)) {
    if (entry === 'index.html') {
      const html = readFileSync(join(src, entry), 'utf8')
      const based = html.replace('<head>', `<head>\n    <base href="/${srcDir}/">`)
      writeFileSync(join(dist, htmlOut), based)
    } else {
      mkdirSync(join(dist, srcDir), { recursive: true })
      cpSync(join(src, entry), join(dist, srcDir, entry), { recursive: true })
    }
  }
}

rmSync(dist, { recursive: true, force: true })
mkdirSync(dist, { recursive: true })

buildPage('index', 'index.html')
buildPage('not-found', '404.html')
cpSync(join(root, 'dots'), join(dist, 'dots'), { recursive: true })
cpSync(join(root, 'correct.js'), join(dist, 'correct.js'))

console.log('built dist/')
