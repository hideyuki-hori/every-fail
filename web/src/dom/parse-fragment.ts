import { Effect } from 'effect'
import { Doc } from '../service/doc'

export const parseFragment = (html: string) =>
  Effect.flatMap(Doc, doc =>
    Effect.sync(() => {
      const tpl = doc.createElement('template')
      tpl.innerHTML = html
      return tpl.content
    }),
  )
