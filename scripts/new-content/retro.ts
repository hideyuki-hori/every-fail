import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { uuidv7 } from 'uuidv7'
import {
  getField,
  getFieldString,
  getIssuesWithProjectData,
  type IssueWithProject,
} from '../lib/github.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..', '..')

const sprintArg = process.argv[2]
if (!sprintArg) {
  console.error('Usage: npm run new:retro <sprint-number>')
  process.exit(1)
}

const sprintNumber = Number(sprintArg)
if (Number.isNaN(sprintNumber)) {
  console.error(`Invalid sprint number: ${sprintArg}`)
  process.exit(1)
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

function today(): string {
  return formatDate(new Date())
}

function generateIndexMdx(sprint: number, start: string, end: string): string {
  return `---
kind: retro
at: ${today()}
start: ${start}
end: ${end}
sprint: ${sprint}
tags:
  - shard
  - retro
---

`
}

function generateIssueMdx(issue: IssueWithProject): string {
  const status = getFieldString(issue, 'Status', '')
  const start = getField(issue, '開始日')
  const end = getField(issue, '終了日')
  const estimated = getField(issue, '見積もり時間')
  const actual = getField(issue, '実働時間')

  return `---
issue: ${issue.number}
title: "${issue.title.replace(/"/g, '\\"')}"
url: "${issue.html_url}"
status: "${status}"
start: ${start ?? 'null'}
end: ${end ?? 'null'}
estimated: ${estimated ?? 'null'}
actual: ${actual ?? 'null'}
---

`
}

async function main() {
  const milestoneName = `s${sprintNumber}`

  console.log(`Milestone "${milestoneName}" からデータを取得中...`)

  const result = await getIssuesWithProjectData(milestoneName)
  if (!result) {
    console.error(`マイルストーン "${milestoneName}" が見つかりません`)
    process.exit(1)
  }

  const { milestone, issues } = result

  const uuid = uuidv7()
  const dir = join(ROOT, 'src/content', uuid)

  mkdirSync(dir, { recursive: true })

  const startDate = getStartDateFromIssues(issues)
  const endDate = getEndDateFromIssues(issues)

  const indexContent = generateIndexMdx(sprintNumber, startDate, endDate)
  writeFileSync(join(dir, 'index.mdx'), indexContent)
  console.log(`  作成: ${uuid}/index.mdx`)

  if (issues.length === 0) {
    console.warn('警告: issueが0件です')
  }

  for (const issue of issues) {
    const issueContent = generateIssueMdx(issue)
    const filename = `${issue.number}.mdx`
    writeFileSync(join(dir, filename), issueContent)
    console.log(`  作成: ${uuid}/${filename}`)
  }

  console.log(
    `\n完了: ${issues.length}件のissueを含むスプリント振り返りを生成しました`
  )
  console.log(`ディレクトリ: src/content/${uuid}/`)
}

function getStartDateFromIssues(issues: IssueWithProject[]): string {
  const dates = issues
    .map(i => getField(i, '開始日'))
    .filter((d): d is string => typeof d === 'string')
    .sort()
  return dates[0] ?? today()
}

function getEndDateFromIssues(issues: IssueWithProject[]): string {
  const dates = issues
    .map(i => getField(i, '終了日'))
    .filter((d): d is string => typeof d === 'string')
    .sort()
  return dates[dates.length - 1] ?? today()
}

main()
