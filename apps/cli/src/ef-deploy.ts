import { existsSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import type { DatabaseSync } from 'node:sqlite'
import { detectContentType } from './cloudflare/content-type.ts'
import { loadCredentials } from './cloudflare/credentials.ts'
import { createR2Client } from './cloudflare/r2.ts'
import { getValue } from './config.ts'
import { expandTilde } from './dot-meta.ts'
import { walkFiles } from './walk.ts'

type DeployPlan = {
  pages: { key: string; local: string }[]
  sitemapPath: string | null
  assets: { key: string; local: string }[]
}

const BASE_PAGE_KEYS = ['index.html', 'dots/index.html', '404.html']

function buildPlan(distDir: string): DeployPlan {
  const pages: { key: string; local: string }[] = []
  for (const key of BASE_PAGE_KEYS) {
    const local = join(distDir, key)
    if (!existsSync(local)) {
      console.error(`missing build output: ${local}. run "ef build" first`)
      process.exit(1)
    }
    pages.push({ key, local })
  }

  const sitemapPath = join(distDir, 'sitemap.xml')

  const assetsDir = join(distDir, 'assets')
  const assets: { key: string; local: string }[] = []
  if (existsSync(assetsDir)) {
    for (const f of walkFiles(assetsDir)) {
      const rel = relative(assetsDir, f).replaceAll('\\', '/')
      assets.push({ key: `assets/${rel}`, local: f })
    }
  }

  return {
    pages,
    sitemapPath: existsSync(sitemapPath) ? sitemapPath : null,
    assets,
  }
}

function printDryRun(plan: DeployPlan): void {
  console.log('=== dry-run (base) ===')
  console.log('')
  console.log('R2: delete + put base pages:')
  for (const e of plan.pages) {
    console.log(`  DELETE ${e.key}`)
    console.log(`  PUT    ${e.key}`)
  }
  console.log('')
  if (plan.sitemapPath) {
    console.log('R2: DELETE sitemap.xml → PUT sitemap.xml')
  } else {
    console.log('R2: (sitemap.xml not found, skip)')
  }
  console.log('')
  console.log('R2: delete prefix assets/ → put:')
  if (plan.assets.length === 0) {
    console.log('  (no assets)')
  } else {
    for (const e of plan.assets) {
      console.log(`  PUT ${e.key}`)
    }
  }
  console.log('')
  console.log('Run with --apply to actually deploy.')
}

async function applyPlan(db: DatabaseSync, plan: DeployPlan): Promise<void> {
  const creds = loadCredentials(db)
  const r2 = createR2Client({
    accountId: creds.accountId,
    accessKeyId: creds.r2AccessKeyId,
    secretAccessKey: creds.r2SecretAccessKey,
    bucket: creds.r2Bucket,
  })

  for (const e of plan.pages) {
    console.log(`R2: DELETE ${e.key}`)
    await r2.delete(e.key)
    console.log(`R2: PUT ${e.key}`)
    await r2.put(e.key, readFileSync(e.local), detectContentType(e.local))
  }

  console.log('R2: DELETE sitemap.xml')
  await r2.delete('sitemap.xml')
  if (plan.sitemapPath) {
    console.log('R2: PUT sitemap.xml')
    await r2.put(
      'sitemap.xml',
      readFileSync(plan.sitemapPath),
      'application/xml; charset=utf-8'
    )
  }

  console.log('R2: listing assets/*')
  const assetKeys = await r2.list('assets/')
  for (const k of assetKeys) {
    console.log(`R2: DELETE ${k}`)
    await r2.delete(k)
  }
  for (const e of plan.assets) {
    console.log(`R2: PUT ${e.key}`)
    await r2.put(e.key, readFileSync(e.local), detectContentType(e.local))
  }

  console.log('')
  console.log('deployed: base')
}

export async function efDeploy(
  db: DatabaseSync,
  args: string[]
): Promise<void> {
  const apply = args.includes('--apply')

  const rootPath = getValue(db, 'every-fail-root-path')
  if (rootPath === null) {
    console.error(
      'every-fail-root-path is not set. run: ef config every-fail-root-path set <path>'
    )
    process.exit(1)
  }
  const expandedRoot = expandTilde(rootPath)
  const distDir = join(expandedRoot, 'dist')
  if (!existsSync(distDir)) {
    console.error(`dist not found: ${distDir}. run "ef build" first`)
    process.exit(1)
  }

  const plan = buildPlan(distDir)

  if (!apply) {
    printDryRun(plan)
    return
  }
  await applyPlan(db, plan)
}
