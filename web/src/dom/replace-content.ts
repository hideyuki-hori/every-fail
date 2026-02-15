import { Effect } from 'effect'

export const replaceContent = (
  container: Element,
  source: DocumentFragment,
) =>
  Effect.sync(() => {
    container.replaceChildren(source.cloneNode(true))
  })
