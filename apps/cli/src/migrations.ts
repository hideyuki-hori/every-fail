import type { DatabaseSync } from 'node:sqlite'

const TARGET_VERSION = 1

const MIGRATIONS: Record<number, string> = {}

const getCurrentVersion = (db: DatabaseSync): number => {
  const row = db
    .prepare('SELECT value FROM settings WHERE key = ?')
    .get('schema-version')
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

export const migrate = (db: DatabaseSync) => {
  const current = getCurrentVersion(db)
  if (current >= TARGET_VERSION) return
  for (let v = current + 1; v <= TARGET_VERSION; v++) {
    const sql = MIGRATIONS[v]
    if (sql) {
      db.exec(sql)
    }
    db.prepare('UPDATE settings SET value = ? WHERE key = ?').run(
      String(v),
      'schema-version'
    )
  }
}
