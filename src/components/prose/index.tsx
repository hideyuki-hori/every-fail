import type { JSX } from 'solid-js'

interface Props {
  children: JSX.Element
}

export function Prose(props: Props) {
  return <div class='prose prose-gray max-w-none'>{props.children}</div>
}
