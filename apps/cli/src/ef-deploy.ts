import { existsSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import type { DatabaseSync } from 'node:sqlite'
import { detectContentType } from './cloudflare/content-type.ts'
import { loadCredentials } from './cloudflare/credentials.ts'
import { createKVClient } from './cloudflare/kv.ts'
import { createR2Client } from './cloudflare/r2.ts'
import { getValue } from './config.ts'
import { expandTilde } from './dot-meta.ts'
import { walkFiles } from './walk.ts'

type DeployPlan = {
  kvPages: { key: string; local: string }[]
  sitemapPath: string | null
  r2Assets: { key: string; local: string }[]
}

function buildPlan(distDir: string): DeployPlan {
  const pagesDir = join(distDir, 'pages')
  if (!existsSync(pagesDir)) {
    console.error(`pages dir not found: ${pagesDir}. run "ef build" first`)
    process.exit(1)
  }

  const kvPages: { key: string; local: string }[] = []
  for (const f of walkFiles(pagesDir)) {
    const rel = relative(pagesDir, f).replaceAll('\\', '/')
    kvPages.push({ key: `pages/${rel}`, local: f })
  }

  const sitemapPath = join(distDir, 'sitemap.xml')

  const assetsDir = join(distDir, 'assets')
  const r2Assets: { key: string; local: string }[] = []
  if (existsSync(assetsDir)) {
    for (const f of walkFiles(assetsDir)) {
      const rel = relative(assetsDir, f).replaceAll('\\', '/')
      r2Assets.push({ key: `assets/${rel}`, local: f })
    }
  }

  return {
    kvPages,
    sitemapPath: existsSync(sitemapPath) ? sitemapPath : null,
    r2Assets,
  }
}

function printDryRun(plan: DeployPlan): void {
  console.log('=== dry-run (base) ===')
  console.log('')
  console.log('KV: delete prefix pages/ → put:')
  for (const e of plan.kvPages) {
    console.log(`  PUT ${e.key}`)
  }
  console.log('')
  if (plan.sitemapPath) {
    console.log('KV: DELETE sitemap.xml → PUT sitemap.xml')
  } else {
    console.log('KV: (sitemap.xml not found, skip)')
  }
  console.log('')
  console.log('R2: delete prefix assets/ → put:')
  if (plan.r2Assets.length === 0) {
    console.log('  (no assets)')
  } else {
    for (const e of plan.r2Assets) {
      console.log(`  PUT ${e.key}`)
    }
  }
  console.log('')
  console.log('Run with --apply to actually deploy.')
}

async function applyPlan(db: DatabaseSync, plan: DeployPlan): Promise<void> {
  const creds = loadCredentials(db)
  const kv = createKVClient({
    apiToken: creds.apiToken,
    accountId: creds.accountId,
    namespaceId: creds.kvNamespaceId,
  })
  const r2 = createR2Client({
    accountId: creds.accountId,
    accessKeyId: creds.r2AccessKeyId,
    secretAccessKey: creds.r2SecretAccessKey,
    bucket: creds.r2Bucket,
  })

  console.log('KV: listing pages/*')
  const pageKeys = await kv.list('pages/')
  for (const k of pageKeys) {
    console.log(`KV: DELETE ${k}`)
    await kv.delete(k)
  }
  for (const e of plan.kvPages) {
    console.log(`KV: PUT ${e.key}`)
    await kv.put(
      e.key,
      readFileSync(e.local, 'utf8'),
      detectContentType(e.local)
    )
  }

  console.log('KV: DELETE sitemap.xml')
  await kv.delete('sitemap.xml')
  if (plan.sitemapPath) {
    console.log('KV: PUT sitemap.xml')
    await kv.put(
      'sitemap.xml',
      readFileSync(plan.sitemapPath, 'utf8'),
      'application/xml; charset=utf-8'
    )
  }

  console.log('R2: listing assets/*')
  const assetKeys = await r2.list('assets/')
  for (const k of assetKeys) {
    console.log(`R2: DELETE ${k}`)
    await r2.delete(k)
  }
  for (const e of plan.r2Assets) {
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
