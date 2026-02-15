import { Effect } from 'effect'
import type { ArticleMeta } from './meta'
import { DecodeError } from './decode-error'

export const decodeMeta = (
  raw: unknown,
): Effect.Effect<ArticleMeta, DecodeError> => {
  if (
    typeof raw !== 'object'
    || raw === null
    || !('title' in raw)
    || !('description' in raw)
  ) {
    return Effect.fail(new DecodeError({ message: 'invalid meta.json' }))
  }
  const { title, description } = raw
  if (typeof title !== 'string' || typeof description !== 'string') {
    return Effect.fail(
      new DecodeError({ message: 'invalid meta.json fields' }),
    )
  }
  return Effect.succeed({ title, description })
}
