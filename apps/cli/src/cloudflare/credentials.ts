import type { DatabaseSync } from 'node:sqlite'
import { getValue } from '../config.ts'

export type CloudflareCredentials = {
  accountId: string
  r2Bucket: string
  r2AccessKeyId: string
  r2SecretAccessKey: string
}

function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v) {
    console.error(`${name} is not set`)
    process.exit(1)
  }
  return v
}

function requireConfig(db: DatabaseSync, key: string): string {
  const v = getValue(db, key)
  if (v === null) {
    console.error(`${key} is not set. run: ef config ${key} set <value>`)
    process.exit(1)
  }
  return v
}

export function loadCredentials(db: DatabaseSync): CloudflareCredentials {
  return {
    r2AccessKeyId: requireEnv('EF_CLOUDFLARE_R2_ACCESS_KEY_ID'),
    r2SecretAccessKey: requireEnv('EF_CLOUDFLARE_R2_SECRET_ACCESS_KEY'),
    accountId: requireConfig(db, 'cloudflare-account-id'),
    r2Bucket: requireConfig(db, 'cloudflare-r2-bucket'),
  }
}
