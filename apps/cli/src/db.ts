import { existsSync, mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import initSQL from './sql/init.sql'
import initSchemaVersionSQL from './sql/init-schema-version.sql'

const efDir = join(homedir(), '.ef')
const dbPath = join(efDir, 'db')

let db: DatabaseSync | null = null

function ensureEfDir(): void {
  if (!existsSync(efDir)) {
    mkdirSync(efDir, { recursive: true })
  }
}

export function getDb(): DatabaseSync {
  if (!db) {
    ensureEfDir()
    db = new DatabaseSync(dbPath)
    db.exec(initSQL)
    db.exec(initSchemaVersionSQL)
  }
  return db
}

export function closeDb(): void {
  if (db) {
    db.close()
    db = null
  }
}
