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

interface Props {
  issues: Issue[]
}

export function RetroSummary(props: Props) {
  const totalEstimated = () =>
    props.issues.reduce((sum, i) => sum + (i.estimated ?? 0), 0)
  const totalActual = () =>
    props.issues.reduce((sum, i) => sum + (i.actual ?? 0), 0)

  return (
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
  )
}
