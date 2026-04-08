import { HttpClient } from '@effect/platform'
import { Config, Effect } from 'effect'

export const loadDotHtml = (id: string) => Effect.gen(function* () {
  const client = (yield* HttpClient.HttpClient).pipe(HttpClient.filterStatusOk)
  const api = yield* Config.string('api')
  const res = yield* client.get(`${api}/dots/${id}`)
  return yield* res.text
})