import { Console, Effect, pipe } from 'effect'
import { FetchHttpClient, HttpClient } from '@effect/platform'
import './styles/index.css'

const fetchDotHtml = (id: string) => Effect.gen(function* () {
  const client = yield* HttpClient.HttpClient
  const res = yield* client.get(`http://localhost:8788/api/dots/${id}`)
  return yield* res.text
})

const rootEffect = pipe(
  fetchDotHtml('a'),
  Effect.tap(Console.log),
  Effect.provide(FetchHttpClient.layer),
)

Effect.runPromise(rootEffect)