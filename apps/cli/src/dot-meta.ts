import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export type DotMeta = {
  id: string
  title: string
  description: string
  status: 'draft' | 'published'
  publishedAt: string | null
}

export function readMeta(metaPath: string): DotMeta | null {
  const raw = readFileSync(metaPath, 'utf8')
  const id = raw.match(/id:\s*'([^']+)'/)?.[1]
  const title = raw.match(/title:\s*'([^']+)'/)?.[1]
  const description = raw.match(/description:\s*'([^']*)'/)?.[1] ?? ''
  const statusMatch = raw.match(/status:\s*'(draft|published)'/)?.[1]
  const publishedAtMatch = raw.match(/publishedAt:\s*'([^']+)'/)?.[1] ?? null
  if (!id || !title) return null
  const status = statusMatch === 'published' ? 'published' : 'draft'
  return { id, title, description, status, publishedAt: publishedAtMatch }
}

export function ensureDotFolder(cwd: string): DotMeta {
  const required = ['meta.ts', 'main.ts', 'package.json']
  for (const f of required) {
    if (!existsSync(join(cwd, f))) {
      console.error(`not a dot folder (missing ${f}): ${cwd}`)
      process.exit(1)
    }
  }
  const meta = readMeta(join(cwd, 'meta.ts'))
  if (meta === null) {
    console.error(`failed to read meta from ${join(cwd, 'meta.ts')}`)
    process.exit(1)
  }
  return meta
}

export function expandTilde(p: string): string {
  if (p.startsWith('~')) {
    return (process.env.HOME ?? '') + p.slice(1)
  }
  return p
}
