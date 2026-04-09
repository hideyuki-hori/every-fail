import { Effect } from 'effect'
import { NoSuchElementException } from 'effect/Cause'
import { DocumentService } from './document-service'

export type QuerySelector = (
  q: string
) => Effect.Effect<Element, NoSuchElementException, DocumentService>

export const querySelector: QuerySelector = q =>
  Effect.gen(function* () {
    const d = yield* DocumentService
    const e = d.querySelector(q)

    if (!e) {
      const cause = new NoSuchElementException(q)
      return yield* Effect.fail(cause)
    }

    return e
  })
