import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join } from 'node:path'
import type { DatabaseSync } from 'node:sqlite'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { getValue } from './config.ts'
import { createRoot, setupDom } from './dom-stub.ts'
import { ensureDotFolder, expandTilde } from './dot-meta.ts'

const here = dirname(fileURLToPath(import.meta.url))

function renderTemplate(name: string, vars: Record<string, string>): string {
  const tmplPath = join(here, 'templates', name)
  const raw = readFileSync(tmplPath, 'utf8')
  return raw.replace(/{{(\w+)}}/g, (_, key) => vars[key] ?? '')
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

async function renderPartial(cwd: string): Promise<string> {
  setupDom()
  const mainPath = join(cwd, 'main.ts')
  const mod = await import(pathToFileURL(mainPath).href)
  if (typeof mod.mount !== 'function') {
    console.error(`mount export not found in ${mainPath}`)
    process.exit(1)
  }
  const root = createRoot()
  mod.mount({ root })
  return root.innerHTML
}

export async function dotBuild(db: DatabaseSync): Promise<void> {
  const cwd = process.cwd()
  const meta = ensureDotFolder(cwd)

  const rootPath = getValue(db, 'every-fail-root-path')
  if (rootPath === null) {
    console.error(
      'every-fail-root-path is not set. run: ef config every-fail-root-path set <path>'
    )
    process.exit(1)
  }
  const expandedRoot = expandTilde(rootPath)
  const distDir = join(expandedRoot, 'dist', 'dots', meta.id)
  mkdirSync(distDir, { recursive: true })

  const partial = await renderPartial(cwd)
  writeFileSync(join(distDir, 'partial.html'), `${partial}\n`)

  const html = renderTemplate('index.html.tmpl', {
    title: escapeHtml(meta.title),
    description: escapeHtml(meta.description),
    partial,
  })
  writeFileSync(join(distDir, 'index.html'), html)

  const assetsSrc = join(cwd, 'assets')
  if (existsSync(assetsSrc)) {
    cpSync(assetsSrc, join(distDir, 'assets'), { recursive: true })
  }

  console.log(`built: ${distDir}`)
  console.log(`id: ${meta.id}`)
}
