import { Effect } from 'effect'
import { Doc } from '../service/doc'

export const getElementById = (id: string) =>
  Effect.flatMap(Doc, doc =>
    Effect.sync(() => doc.getElementById(id)),
  )
