import { existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import type { DatabaseSync } from 'node:sqlite'
import { getValue } from './config.ts'
import { dotBuild } from './dot-build.ts'
import { dotDeploy } from './dot-deploy.ts'
import { expandTilde, readMeta } from './dot-meta.ts'

type Target = {
  dir: string
  id: string
  title: string
  status: 'draft' | 'published'
}

function listTargets(dotsDir: string, includeDrafts: boolean): Target[] {
  const targets: Target[] = []
  const names = readdirSync(dotsDir).sort()
  for (const name of names) {
    const dir = join(dotsDir, name)
    if (!statSync(dir).isDirectory()) continue
    const metaPath = join(dir, 'meta.ts')
    if (!existsSync(metaPath)) continue
    const meta = readMeta(metaPath)
    if (meta === null) continue
    if (!includeDrafts && meta.status === 'draft') continue
    targets.push({
      dir,
      id: meta.id,
      title: meta.title,
      status: meta.status,
    })
  }
  return targets
}

export async function dotDeployAll(
  db: DatabaseSync,
  args: string[]
): Promise<void> {
  const apply = args.includes('--apply')
  const includeDrafts = args.includes('--include-drafts')

  const rootPath = getValue(db, 'every-fail-root-path')
  if (rootPath === null) {
    console.error(
      'every-fail-root-path is not set. run: ef config every-fail-root-path set <path>'
    )
    process.exit(1)
  }
  const expandedRoot = expandTilde(rootPath)
  const dotsDir = join(expandedRoot, 'dots')
  if (!existsSync(dotsDir)) {
    console.error(`dots dir not found: ${dotsDir}`)
    process.exit(1)
  }

  const targets = listTargets(dotsDir, includeDrafts)
  if (targets.length === 0) {
    console.log(`no targets (drafts ${includeDrafts ? 'included' : 'skipped'})`)
    return
  }

  const mode = apply ? 'apply' : 'dry-run'
  console.log(`=== ${mode}: ${targets.length} dot(s) ===`)
  for (const t of targets) {
    console.log(`  - ${t.id} (${t.title}) [${t.status}]`)
  }
  console.log('')

  const original = process.cwd()
  for (const t of targets) {
    console.log('')
    console.log(`--- ${t.id} (${t.title}) [${t.status}] ---`)
    process.chdir(t.dir)
    try {
      await dotBuild(db)
      await dotDeploy(db, apply ? ['--apply'] : [])
    } finally {
      process.chdir(original)
    }
  }
  console.log('')
  console.log(
    `done: ${targets.length} dot(s) ${mode === 'apply' ? 'deployed' : 'planned'}`
  )
}
