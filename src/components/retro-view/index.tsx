import { For, type JSX } from 'solid-js'

interface Issue {
  issue: number
  title: string
  url: string
  status: string
  start: string | null
  end: string | null
  estimated: number | null
  actual: number | null
}

interface RetroMeta {
  title: string
  sprint: number
  start: string
  end: string
}

interface Props {
  meta: RetroMeta
  issues: Issue[]
  children?: JSX.Element
}

function StatusBadge(props: { status: string }) {
  const colorClass = () => {
    switch (props.status) {
      case 'やった':
        return 'bg-green-100 text-green-800'
      case 'やめた':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  return (
    <span class={`rounded px-2 py-1 font-medium text-xs ${colorClass()}`}>
      {props.status}
    </span>
  )
}

function IssueCard(props: { issue: Issue }) {
  return (
    <div class='rounded-lg border border-gray-200 bg-white p-4'>
      <div class='flex items-start justify-between gap-2'>
        <a
          href={props.issue.url}
          target='_blank'
          rel='noopener noreferrer'
          class='font-medium text-blue-600 hover:underline'
        >
          #{props.issue.issue} {props.issue.title}
        </a>
        <StatusBadge status={props.issue.status} />
      </div>
      <div class='mt-2 flex gap-4 text-gray-600 text-sm'>
        {props.issue.start && props.issue.end && (
          <span>
            {props.issue.start} → {props.issue.end}
          </span>
        )}
        {props.issue.estimated !== null && props.issue.actual !== null && (
          <span>
            見積: {props.issue.estimated}h / 実績: {props.issue.actual}h
          </span>
        )}
      </div>
    </div>
  )
}

export function RetroView(props: Props) {
  const totalEstimated = () =>
    props.issues.reduce((sum, i) => sum + (i.estimated ?? 0), 0)
  const totalActual = () =>
    props.issues.reduce((sum, i) => sum + (i.actual ?? 0), 0)

  return (
    <div>
      <header class='mb-8'>
        <h1 class='mb-2 font-bold text-3xl'>振り返り</h1>
        <p class='text-gray-600'>
          {props.meta.start} → {props.meta.end}
        </p>
      </header>

      <section class='mb-8'>
        <h2 class='mb-4 font-semibold text-xl'>サマリー</h2>
        <div class='grid grid-cols-3 gap-4'>
          <div class='rounded-lg border border-gray-200 bg-white p-4 text-center'>
            <div class='font-bold text-2xl'>{props.issues.length}</div>
            <div class='text-gray-600 text-sm'>Issue数</div>
          </div>
          <div class='rounded-lg border border-gray-200 bg-white p-4 text-center'>
            <div class='font-bold text-2xl'>{totalEstimated()}h</div>
            <div class='text-gray-600 text-sm'>見積合計</div>
          </div>
          <div class='rounded-lg border border-gray-200 bg-white p-4 text-center'>
            <div class='font-bold text-2xl'>{totalActual()}h</div>
            <div class='text-gray-600 text-sm'>実績合計</div>
          </div>
        </div>
      </section>

      {props.children && <section class='mb-8'>{props.children}</section>}

      <section>
        <h2 class='mb-4 font-semibold text-xl'>Issue一覧</h2>
        <div class='space-y-3'>
          <For each={props.issues}>{issue => <IssueCard issue={issue} />}</For>
        </div>
      </section>
    </div>
  )
}
