import { Effect } from 'effect'

export const setChildren = (
  container: Element,
  source: DocumentFragment,
) =>
  Effect.sync(() => {
    container.replaceChildren(source)
  })
