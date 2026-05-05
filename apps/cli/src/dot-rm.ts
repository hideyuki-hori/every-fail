import { existsSync, readFileSync, rmSync, statSync } from 'node:fs'
import { join } from 'node:path'
import type { DatabaseSync } from 'node:sqlite'
import { getValue } from './config.ts'
import deleteDotSQL from './sql/delete-dot.sql'

function expandTilde(p: string): string {
  if (p.startsWith('~')) {
    return (process.env.HOME ?? '') + p.slice(1)
  }
  return p
}

function extractIdFromMeta(metaPath: string): string | null {
  const raw = readFileSync(metaPath, 'utf8')
  const m = raw.match(/id:\s*'([^']+)'/)
  return m ? m[1] : null
}

export function dotRm(db: DatabaseSync, args: string[]): void {
  const folder = args[0]
  if (!folder) {
    console.error('Usage: pnpm ef dot rm <folder>')
    process.exit(1)
  }

  const rootPath = getValue(db, 'every-fail-root-path')
  if (rootPath === null) {
    console.error(
      'every-fail-root-path is not set. run: ef config every-fail-root-path set <path>'
    )
    process.exit(1)
  }
  const expandedRoot = expandTilde(rootPath)
  const dotPath = join(expandedRoot, 'dots', folder)

  if (!existsSync(dotPath)) {
    console.error(`folder not found: ${dotPath}`)
    process.exit(1)
  }
  if (!statSync(dotPath).isDirectory()) {
    console.error(`not a directory: ${dotPath}`)
    process.exit(1)
  }

  const metaPath = join(dotPath, 'meta.ts')
  if (!existsSync(metaPath)) {
    console.error(`meta.ts not found in ${dotPath}`)
    process.exit(1)
  }
  const id = extractIdFromMeta(metaPath)
  if (id === null) {
    console.error(`failed to extract id from ${metaPath}`)
    process.exit(1)
  }

  const result = db.prepare(deleteDotSQL).run(id)
  rmSync(dotPath, { recursive: true, force: true })

  console.log(`removed: ${dotPath}`)
  console.log(`id: ${id}`)
  if (result.changes === 0) {
    console.log('warning: id was not in dots table (orphan folder removed)')
  }
}
