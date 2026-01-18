import { copyFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { uuidv7 } from 'uuidv7'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..', '..')

const arg = process.argv[2]
const kind = ensureKind(arg)

const uuid = uuidv7()
const template = join(root, `scripts/new-content/templates/${kind}.mdx`)
const dest = join(root, `src/content/${uuid}.mdx`)

copyFileSync(template, dest)

function ensureKind(s: string) {
  switch (s) {
    case 'blog':
    case 'plan':
    case 'retro':
      return s
  }

  throw new Error(`Unknown content type: ${s}`)
}
