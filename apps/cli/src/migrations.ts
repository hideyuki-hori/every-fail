import type { DatabaseSync } from 'node:sqlite'
import selectSchemaVersionSQL from './sql/select-schema-version.sql'
import updateSchemaVersionSQL from './sql/update-schema-version.sql'

const TARGET_VERSION = 1

const MIGRATIONS: Record<number, string> = {}

function getCurrentVersion(db: DatabaseSync): number {
  const row = db.prepare(selectSchemaVersionSQL).get()
  if (
    row !== null &&
    typeof row === 'object' &&
    'value' in row &&
    typeof row.value === 'string'
  ) {
    const n = parseInt(row.value, 10)
    return Number.isNaN(n) ? 0 : n
  }
  return 0
}

export function migrate(db: DatabaseSync): void {
  const current = getCurrentVersion(db)
  if (current >= TARGET_VERSION) return
  for (let v = current + 1; v <= TARGET_VERSION; v++) {
    const sql = MIGRATIONS[v]
    if (sql) {
      db.exec(sql)
    }
    db.prepare(updateSchemaVersionSQL).run(String(v))
  }
}
