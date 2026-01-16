import type { JSX } from 'solid-js'

interface Props {
  children: JSX.Element
}

export function Container(props: Props) {
  return <main class='mx-auto max-w-3xl px-4 py-8'>{props.children}</main>
}
