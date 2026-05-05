import { existsSync, mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

const efDir = join(homedir(), '.ef')
const dbPath = join(efDir, 'db')

const SCHEMA = `
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TRIGGER IF NOT EXISTS settings_updated_at
AFTER UPDATE ON settings
BEGIN
  UPDATE settings SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    WHERE key = NEW.key;
END;

CREATE TABLE IF NOT EXISTS dots (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TRIGGER IF NOT EXISTS dots_updated_at
AFTER UPDATE ON dots
BEGIN
  UPDATE dots SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    WHERE id = NEW.id;
END;
`

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
    db.exec(SCHEMA)
    db.exec(
      "INSERT OR IGNORE INTO settings (key, value) VALUES ('schema-version', '1')"
    )
  }
  return db
}

export const closeDb = () => {
  if (db) {
    db.close()
    db = null
  }
}
