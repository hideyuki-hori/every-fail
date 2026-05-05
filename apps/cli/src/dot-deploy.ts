import { existsSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import type { DatabaseSync } from 'node:sqlite'
import { detectContentType } from './cloudflare/content-type.ts'
import { loadCredentials } from './cloudflare/credentials.ts'
import { createKVClient } from './cloudflare/kv.ts'
import { createR2Client } from './cloudflare/r2.ts'
import { getValue } from './config.ts'
import { ensureDotFolder, expandTilde } from './dot-meta.ts'
import { walkFiles } from './walk.ts'

type DeployPlan = {
  id: string
  distDir: string
  kvKeyIndex: string
  kvKeyPartial: string
  assets: { local: string; key: string }[]
  kvDeletePrefix: string
  r2DeletePrefix: string
}

function buildPlan(distDir: string, id: string): DeployPlan {
  const indexPath = join(distDir, 'index.html')
  const partialPath = join(distDir, 'partial.html')
  if (!existsSync(indexPath) || !existsSync(partialPath)) {
    console.error(
      `index.html or partial.html not found under ${distDir}. run "ef dot build" first`
    )
    process.exit(1)
  }
  const assetsDir = join(distDir, 'assets')
  const assets: { local: string; key: string }[] = []
  if (existsSync(assetsDir)) {
    const files = walkFiles(assetsDir)
    for (const f of files) {
      const rel = relative(assetsDir, f)
      assets.push({ local: f, key: `dots/${id}/assets/${rel}` })
    }
  }
  return {
    id,
    distDir,
    kvKeyIndex: `dots/${id}/index.html`,
    kvKeyPartial: `dots/${id}/partial.html`,
    assets,
    kvDeletePrefix: `dots/${id}/`,
    r2DeletePrefix: `dots/${id}/`,
  }
}

function printDryRun(plan: DeployPlan): void {
  console.log(`=== dry-run (id: ${plan.id}) ===`)
  console.log('')
  console.log(`KV: delete prefix ${plan.kvDeletePrefix} → put:`)
  console.log(`  PUT ${plan.kvKeyIndex}`)
  console.log(`  PUT ${plan.kvKeyPartial}`)
  console.log('')
  console.log(`R2: delete prefix ${plan.r2DeletePrefix} → put:`)
  if (plan.assets.length === 0) {
    console.log('  (no assets)')
  } else {
    for (const a of plan.assets) {
      console.log(`  PUT ${a.key}`)
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

  console.log(`KV: listing ${plan.kvDeletePrefix}*`)
  const kvKeys = await kv.list(plan.kvDeletePrefix)
  for (const k of kvKeys) {
    console.log(`KV: DELETE ${k}`)
    await kv.delete(k)
  }
  console.log(`KV: PUT ${plan.kvKeyIndex}`)
  await kv.put(
    plan.kvKeyIndex,
    readFileSync(join(plan.distDir, 'index.html'), 'utf8'),
    'text/html; charset=utf-8'
  )
  console.log(`KV: PUT ${plan.kvKeyPartial}`)
  await kv.put(
    plan.kvKeyPartial,
    readFileSync(join(plan.distDir, 'partial.html'), 'utf8'),
    'text/html; charset=utf-8'
  )

  console.log(`R2: listing ${plan.r2DeletePrefix}*`)
  const r2Keys = await r2.list(plan.r2DeletePrefix)
  for (const k of r2Keys) {
    console.log(`R2: DELETE ${k}`)
    await r2.delete(k)
  }
  for (const a of plan.assets) {
    console.log(`R2: PUT ${a.key}`)
    await r2.put(a.key, readFileSync(a.local), detectContentType(a.local))
  }

  console.log('')
  console.log(`deployed: ${plan.id}`)
}

export async function dotDeploy(
  db: DatabaseSync,
  args: string[]
): Promise<void> {
  const apply = args.includes('--apply')

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
  if (!existsSync(distDir)) {
    console.error(`dist not found: ${distDir}. run "ef dot build" first`)
    process.exit(1)
  }

  const plan = buildPlan(distDir, meta.id)

  if (!apply) {
    printDryRun(plan)
    return
  }
  await applyPlan(db, plan)
}
