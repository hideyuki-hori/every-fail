import { Effect } from 'effect'
import { DecodeError, FetchError } from './errors'

export interface ArticleMeta {
  readonly title: string
  readonly description: string
}

export const fetchText = (url: string) =>
  Effect.tryPromise({
    try: async () => {
      const res = await fetch(url)
      if (!res.ok) throw res
      return res.text()
    },
    catch: () => new FetchError({ url }),
  })

export const fetchJson = (url: string) =>
  Effect.tryPromise({
    try: async () => {
      const res = await fetch(url)
      if (!res.ok) throw res
      const json: unknown = await res.json()
      return json
    },
    catch: () => new FetchError({ url }),
  })

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
