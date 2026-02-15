import { Effect } from 'effect'
import { Doc } from '../service/doc'

export const setTitle = (title: string) =>
  Effect.flatMap(Doc, doc =>
    Effect.sync(() => {
      doc.title = title
    }),
  )
