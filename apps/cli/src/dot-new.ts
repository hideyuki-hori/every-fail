import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import type { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'
import { getValue } from './config.ts'
import { nanoId } from './nano-id.ts'
import insertDotSQL from './sql/insert-dot.sql'
import selectDotByIdSQL from './sql/select-dot-by-id.sql'

const here = dirname(fileURLToPath(import.meta.url))

const expandTilde = (p: string) => {
  if (p.startsWith('~')) {
    return (process.env.HOME ?? '') + p.slice(1)
  }
  return p
}

const sanitizeTitle = (title: string): string =>
  title
    .trim()
    .replace(/[/\\:*?"<>|]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

const formatYyMmDd = (d: Date): string => {
  const yy = String(d.getFullYear() % 100).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

const formatIsoDate = (d: Date): string => {
  const yyyy = String(d.getFullYear())
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const dotIdExists = (db: DatabaseSync, id: string): boolean => {
  const row = db.prepare(selectDotByIdSQL).get(id)
  return row !== null && row !== undefined
}

const generateUniqueId = (db: DatabaseSync): string => {
  for (let i = 0; i < 16; i++) {
    const id = nanoId(8)
    if (!dotIdExists(db, id)) return id
  }
  console.error('failed to generate unique nano id after 16 attempts')
  process.exit(1)
}

const renderTemplate = (name: string, vars: Record<string, string>): string => {
  const tmplPath = join(here, 'templates', name)
  const raw = readFileSync(tmplPath, 'utf8')
  return raw.replace(/{{(\w+)}}/g, (_, key) => vars[key] ?? '')
}

export const dotNew = (db: DatabaseSync, args: string[]) => {
  const rawTitle = args[0]
  if (!rawTitle) {
    console.error('Usage: pnpm ef dot new <title>')
    process.exit(1)
  }
  const sanitized = sanitizeTitle(rawTitle)
  if (sanitized === '') {
    console.error('title resolves to empty after sanitization')
    process.exit(1)
  }

  const rootPath = getValue(db, 'every-fail-root-path')
  if (rootPath === null) {
    console.error(
      'every-fail-root-path is not set. run: ef config every-fail-root-path set <path>'
    )
    process.exit(1)
  }
  const expandedRoot = expandTilde(rootPath)
  if (!existsSync(expandedRoot)) {
    console.error(`every-fail-root-path does not exist: ${expandedRoot}`)
    process.exit(1)
  }

  const id = generateUniqueId(db)
  const now = new Date()
  const yyMmDd = formatYyMmDd(now)
  const isoDate = formatIsoDate(now)
  const folderName = `${yyMmDd}-${sanitized}`
  const dotPath = join(expandedRoot, 'dots', folderName)

  if (existsSync(dotPath)) {
    console.error(`folder already exists: ${dotPath}`)
    process.exit(1)
  }

  mkdirSync(dotPath, { recursive: true })

  const vars = { id, title: rawTitle, date: isoDate }
  writeFileSync(join(dotPath, 'meta.ts'), renderTemplate('meta.ts.tmpl', vars))
  writeFileSync(join(dotPath, 'main.ts'), renderTemplate('main.ts.tmpl', vars))
  writeFileSync(
    join(dotPath, 'package.json'),
    renderTemplate('package.json.tmpl', vars)
  )

  db.prepare(insertDotSQL).run(id)

  console.log(`created: ${dotPath}`)
  console.log(`id: ${id}`)
}
