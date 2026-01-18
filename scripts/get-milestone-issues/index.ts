import { execSync } from 'node:child_process'
import {
  getFieldString,
  getIssuesWithProjectData,
  type IssueWithProject,
} from '../lib/github.ts'

const milestone = process.argv[2]
if (!milestone) {
  console.error(
    'Usage: node --experimental-strip-types scripts/get-milestone-issues/index.ts <milestone>'
  )
  process.exit(1)
}

function getStartDate(issue: IssueWithProject): string {
  return getFieldString(issue, '開始日', '')
}

async function main() {
  const result = await getIssuesWithProjectData(milestone)
  if (!result) {
    console.error(`マイルストーン "${milestone}" が見つかりません`)
    process.exit(1)
  }

  const { issues } = result

  if (issues.length === 0) {
    console.log(`マイルストーン "${milestone}" に紐づくissueはありません`)
    process.exit(0)
  }

  issues.sort((a, b) => {
    const dateA = getStartDate(a)
    const dateB = getStartDate(b)
    if (!dateA && !dateB) return 0
    if (!dateA) return 1
    if (!dateB) return -1
    return dateA.localeCompare(dateB)
  })

  const lines: string[] = []
  let totalEstimate = 0
  let totalActual = 0

  for (const issue of issues) {
    const status = getFieldString(issue, 'Status')
    const startDate = getFieldString(issue, '開始日')
    const endDate = getFieldString(issue, '終了日')
    const estimate = getFieldString(issue, '見積もり時間')
    const actual = getFieldString(issue, '実働時間')

    if (estimate !== '-') {
      totalEstimate += Number(estimate)
    }
    if (actual !== '-') {
      totalActual += Number(actual)
    }

    lines.push(`- [${issue.title}](${issue.html_url})`)
    lines.push(`  - ${status}`)
    lines.push(`  - ${startDate} ~ ${endDate}`)
    lines.push(`  - 見積: ${estimate}h, 実績: ${actual}h`)
  }

  lines.push('')
  lines.push(`合計: 見積 ${totalEstimate}h, 実績 ${totalActual}h`)

  const output = lines.join('\n')
  execSync('pbcopy', { input: output })
  console.log(
    `${issues.length}件のissueをクリップボードにコピーしました（見積: ${totalEstimate}h, 実績: ${totalActual}h）`
  )
}

main()
