import { Config, Effect } from 'effect'
import { HttpClient } from '@effect/platform'

export const downloadHtml = (id: string) => Effect.gen(function* () {
  const client = yield* HttpClient.HttpClient
  const api = yield* Config.string('api')
  const res = yield* client.get(`${api}/dots/${id}`)
  const html = yield* res.text
  return html
})