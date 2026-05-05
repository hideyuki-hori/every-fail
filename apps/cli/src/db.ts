import { existsSync, mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import initSQL from './sql/init.sql'
import initSchemaVersionSQL from './sql/init-schema-version.sql'

const efDir = join(homedir(), '.ef')
const dbPath = join(efDir, 'db')

let db: DatabaseSync | null = null

const ensureEfDir = () => {
  if (!existsSync(efDir)) {
    mkdirSync(efDir, { recursive: true })
  }
}

export const getDb = () => {
  if (!db) {
    ensureEfDir()
    db = new DatabaseSync(dbPath)
    db.exec(initSQL)
    db.exec(initSchemaVersionSQL)
  }
  return db
}

export const closeDb = () => {
  if (db) {
    db.close()
    db = null
  }
}
