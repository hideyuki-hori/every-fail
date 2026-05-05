import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join } from 'node:path'
import type { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'
import { getValue } from './config.ts'
import { expandTilde, readMeta } from './dot-meta.ts'

const here = dirname(fileURLToPath(import.meta.url))
const SITE_BASE = 'https://every.fail'

type DotEntry = {
  id: string
  title: string
  description: string
  publishedAt: string
}

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

function listPublishedDots(rootPath: string): DotEntry[] {
  const dotsDir = join(rootPath, 'dots')
  if (!existsSync(dotsDir)) return []
  const entries: DotEntry[] = []
  for (const name of readdirSync(dotsDir).sort()) {
    const dir = join(dotsDir, name)
    if (!statSync(dir).isDirectory()) continue
    const metaPath = join(dir, 'meta.ts')
    if (!existsSync(metaPath)) continue
    const meta = readMeta(metaPath)
    if (meta === null) continue
    if (meta.status !== 'published') continue
    if (meta.publishedAt === null) continue
    entries.push({
      id: meta.id,
      title: meta.title,
      description: meta.description,
      publishedAt: meta.publishedAt,
    })
  }
  return entries.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
}

function renderDotsItems(entries: DotEntry[]): string {
  if (entries.length === 0) {
    return '<li class="empty">まだ公開された dot はありません</li>'
  }
  return entries
    .map(
      e =>
        `  <li>
    <a href="/dots/${e.id}">${escapeHtml(e.title)}</a>
    <p>${escapeHtml(e.description)}</p>
    <time datetime="${e.publishedAt}">${e.publishedAt}</time>
  </li>`
    )
    .join('\n')
}

function renderSitemapUrls(entries: DotEntry[]): string {
  const lines = [
    `  <url><loc>${SITE_BASE}/</loc></url>`,
    `  <url><loc>${SITE_BASE}/dots</loc></url>`,
  ]
  for (const e of entries) {
    lines.push(
      `  <url><loc>${SITE_BASE}/dots/${e.id}</loc><lastmod>${e.publishedAt}</lastmod></url>`
    )
  }
  return lines.join('\n')
}

export function efBuild(db: DatabaseSync): void {
  const rootPath = getValue(db, 'every-fail-root-path')
  if (rootPath === null) {
    console.error(
      'every-fail-root-path is not set. run: ef config every-fail-root-path set <path>'
    )
    process.exit(1)
  }
  const expandedRoot = expandTilde(rootPath)
  const distDir = join(expandedRoot, 'dist')

  mkdirSync(distDir, { recursive: true })
  writeFileSync(
    join(distDir, 'index.html'),
    renderTemplate('page-index.html.tmpl', {})
  )

  const entries = listPublishedDots(expandedRoot)
  mkdirSync(join(distDir, 'dots'), { recursive: true })
  writeFileSync(
    join(distDir, 'dots', 'index.html'),
    renderTemplate('page-dots.html.tmpl', {
      items: renderDotsItems(entries),
      count: String(entries.length),
    })
  )

  writeFileSync(
    join(distDir, '404.html'),
    renderTemplate('page-404.html.tmpl', {})
  )

  writeFileSync(
    join(distDir, 'sitemap.xml'),
    renderTemplate('sitemap.xml.tmpl', {
      urls: renderSitemapUrls(entries),
    })
  )

  console.log(`built: ${distDir}`)
  console.log('  index.html')
  console.log(`  dots/index.html (${entries.length} dot(s))`)
  console.log('  404.html')
  console.log('  sitemap.xml')
}
