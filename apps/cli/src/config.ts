import { existsSync, statSync } from 'node:fs'
import type { DatabaseSync } from 'node:sqlite'
import deleteSettingSQL from './sql/delete-setting.sql'
import selectAllSettingsSQL from './sql/select-all-settings.sql'
import selectSettingByKeySQL from './sql/select-setting-by-key.sql'
import upsertSettingSQL from './sql/upsert-setting.sql'

const USER_KEYS = new Set([
  'every-fail-root-path',
  'cloudflare-account-id',
  'cloudflare-kv-namespace-id',
  'cloudflare-r2-bucket',
])
const PATH_KEYS = new Set(['every-fail-root-path'])

function expandTilde(p: string): string {
  if (p.startsWith('~')) {
    return (process.env.HOME ?? '') + p.slice(1)
  }
  return p
}

function validate(key: string, value: string): void {
  if (PATH_KEYS.has(key)) {
    const expanded = expandTilde(value)
    if (!existsSync(expanded)) {
      console.error(`path does not exist: ${expanded}`)
      process.exit(1)
    }
    if (!statSync(expanded).isDirectory()) {
      console.error(`path is not a directory: ${expanded}`)
      process.exit(1)
    }
  }
}

export function getValue(db: DatabaseSync, key: string): string | null {
  const row = db.prepare(selectSettingByKeySQL).get(key)
  if (
    row !== null &&
    typeof row === 'object' &&
    'value' in row &&
    typeof row.value === 'string'
  ) {
    return row.value
  }
  return null
}

function setValue(db: DatabaseSync, key: string, value: string): void {
  db.prepare(upsertSettingSQL).run(key, value)
}

function unsetValue(db: DatabaseSync, key: string): void {
  db.prepare(deleteSettingSQL).run(key)
}

function listAll(db: DatabaseSync): void {
  const rows = db.prepare(selectAllSettingsSQL).all()
  for (const row of rows) {
    if (
      row !== null &&
      typeof row === 'object' &&
      'key' in row &&
      typeof row.key === 'string' &&
      'value' in row &&
      typeof row.value === 'string'
    ) {
      console.log(`${row.key}=${row.value}`)
    }
  }
}

export function handleConfig(db: DatabaseSync, args: string[]): void {
  const [first, second, third] = args

  if (first === 'list') {
    listAll(db)
    return
  }

  if (!first || !second) {
    console.error('Usage: ef config <key> <action> [<value>]')
    process.exit(1)
  }

  const key = first
  const action = second

  if (!USER_KEYS.has(key)) {
    console.error(`unknown or read-only key: ${key}`)
    process.exit(1)
  }

  switch (action) {
    case 'get': {
      const v = getValue(db, key)
      if (v === null) {
        process.exit(1)
      }
      console.log(v)
      break
    }
    case 'set': {
      if (!third) {
        console.error('value required')
        process.exit(1)
      }
      validate(key, third)
      setValue(db, key, third)
      break
    }
    case 'unset': {
      unsetValue(db, key)
      break
    }
    default:
      console.error(`unknown action: ${action}`)
      process.exit(1)
  }
}
