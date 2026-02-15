import { Effect } from 'effect'
import { Doc } from '../service/doc'

export const cloneChildren = (el: Element) =>
  Effect.flatMap(Doc, doc =>
    Effect.sync(() => {
      const frag = doc.createDocumentFragment()
      for (const child of Array.from(el.childNodes)) {
        frag.appendChild(child.cloneNode(true))
      }
      return frag
    }),
  )
