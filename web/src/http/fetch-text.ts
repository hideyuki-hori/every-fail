import { Effect } from 'effect'
import { FetchError } from './fetch-error'

export const fetchText = (url: string) =>
  Effect.tryPromise({
    try: async () => {
      const res = await fetch(url)
      if (!res.ok) throw res
      return res.text()
    },
    catch: () => new FetchError({ url }),
  })
