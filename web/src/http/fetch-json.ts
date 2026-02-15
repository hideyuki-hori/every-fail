import { Effect } from 'effect'
import { FetchError } from './fetch-error'

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
