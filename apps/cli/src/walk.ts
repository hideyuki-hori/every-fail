import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

export function walkFiles(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry)
    const s = statSync(p)
    if (s.isDirectory()) {
      out.push(...walkFiles(p))
    } else if (s.isFile()) {
      out.push(p)
    }
  }
  return out
}
