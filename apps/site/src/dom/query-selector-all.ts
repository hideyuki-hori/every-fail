import { Effect } from 'effect'
import { NoSuchElementException } from 'effect/Cause'
import { DocumentService } from './document-service'

export type QuerySelectorAll = (q: string) => Effect.Effect<Element[], NoSuchElementException, DocumentService>

export const querySelectorAll: QuerySelectorAll = (q) => Effect.gen(function* () {
  const d = yield* DocumentService
  const e = d.querySelectorAll(q)

  if (e.length <= 0) {
    const cause = new NoSuchElementException(q)
    return yield* Effect.fail(cause)
  }

  return Array.from(e)
})

export type QuerySelectorAllOptional = (q: string) => Effect.Effect<Element[], never, DocumentService>

export const querySelectorAllOptional: QuerySelectorAllOptional = (q) => Effect.gen(function* () {
  const d = yield* DocumentService
  const e = d.querySelectorAll(q)
  return Array.from(e)
})
