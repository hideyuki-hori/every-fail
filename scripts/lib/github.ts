import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..', '..')

const OWNER = 'hideyuki-hori'
const REPO_NAME = 'shard-meta'
const REPO = `${OWNER}/${REPO_NAME}`
const API_BASE = 'https://api.github.com'
const GRAPHQL_API = 'https://api.github.com/graphql'

function loadEnv(): Record<string, string> {
  const envPath = join(ROOT, '.env')
  try {
    const content = readFileSync(envPath, 'utf-8')
    const env: Record<string, string> = {}
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIndex = trimmed.indexOf('=')
      if (eqIndex === -1) continue
      const key = trimmed.slice(0, eqIndex)
      const value = trimmed.slice(eqIndex + 1).replace(/^["']|["']$/g, '')
      env[key] = value
    }
    return env
  } catch {
    return {}
  }
}

const env = loadEnv()
const GITHUB_TOKEN = env.GITHUB_TOKEN || process.env.GITHUB_TOKEN

export interface Milestone {
  number: number
  title: string
  due_on: string | null
  created_at: string
}

export interface Label {
  name: string
}

export interface Issue {
  number: number
  title: string
  state: string
  html_url: string
  labels: Label[]
}

export interface ProjectField {
  name: string
  value: string | number | null
}

export interface ProjectItemData {
  issueNumber: number
  fields: ProjectField[]
}

export interface IssueWithProject extends Issue {
  projectFields: Map<string, string | number | null>
}

export async function getMilestones(): Promise<Milestone[]> {
  const res = await fetch(`${API_BASE}/repos/${REPO}/milestones?state=all`)
  if (!res.ok) {
    throw new Error(`Failed to fetch milestones: ${res.status}`)
  }
  return res.json()
}

export async function getMilestoneByName(
  name: string
): Promise<Milestone | null> {
  const milestones = await getMilestones()
  return milestones.find(m => m.title === name) ?? null
}

export async function getIssuesByMilestone(
  milestoneNumber: number
): Promise<Issue[]> {
  const res = await fetch(
    `${API_BASE}/repos/${REPO}/issues?milestone=${milestoneNumber}&state=all&per_page=100`
  )
  if (!res.ok) {
    throw new Error(`Failed to fetch issues: ${res.status}`)
  }
  return res.json()
}

export async function getProjectItems(): Promise<Map<number, ProjectItemData>> {
  if (!GITHUB_TOKEN) {
    return new Map()
  }

  const query = readFileSync(
    join(__dirname, '..', 'get-milestone-issues', 'query.gql'),
    'utf-8'
  )

  const res = await fetch(GRAPHQL_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: { owner: OWNER, repo: REPO_NAME },
    }),
  })

  if (!res.ok) {
    throw new Error(`GraphQL API error: ${res.status}`)
  }

  const data = await res.json()
  const result = new Map<number, ProjectItemData>()

  const projects = data.data?.repository?.projectsV2?.nodes || []
  for (const project of projects) {
    const items = project.items?.nodes || []
    for (const item of items) {
      const issueNumber = item.content?.number
      if (!issueNumber) continue

      const fields: ProjectField[] = []
      const fieldValues = item.fieldValues?.nodes || []
      for (const fv of fieldValues) {
        const fieldName = fv.field?.name
        if (!fieldName) continue
        const value = fv.text ?? fv.number ?? fv.name ?? fv.date ?? null
        if (value !== null) {
          fields.push({ name: fieldName, value })
        }
      }

      result.set(issueNumber, { issueNumber, fields })
    }
  }

  return result
}

export async function getIssuesWithProjectData(
  milestoneName: string
): Promise<{ milestone: Milestone; issues: IssueWithProject[] } | null> {
  const milestone = await getMilestoneByName(milestoneName)
  if (!milestone) {
    return null
  }

  const [issues, projectItems] = await Promise.all([
    getIssuesByMilestone(milestone.number),
    getProjectItems(),
  ])

  const issuesWithProject: IssueWithProject[] = issues.map(issue => {
    const projectData = projectItems.get(issue.number)
    const projectFields = new Map<string, string | number | null>()
    if (projectData) {
      for (const field of projectData.fields) {
        projectFields.set(field.name, field.value)
      }
    }
    return { ...issue, projectFields }
  })

  return { milestone, issues: issuesWithProject }
}

export function getField(
  issue: IssueWithProject,
  fieldName: string
): string | number | null {
  return issue.projectFields.get(fieldName) ?? null
}

export function getFieldString(
  issue: IssueWithProject,
  fieldName: string,
  defaultValue = '-'
): string {
  const value = issue.projectFields.get(fieldName)
  return value?.toString() ?? defaultValue
}
