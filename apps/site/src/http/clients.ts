import { FetchHttpClient, HttpClient } from '@effect/platform'
import { Effect, Layer } from 'effect'

export const SucceedOnly = Layer.effect(
  HttpClient.HttpClient,
  Effect.gen(function* () {
    const client = yield* HttpClient.HttpClient
    return client.pipe(HttpClient.filterStatusOk)
  })
).pipe(Layer.provide(FetchHttpClient.layer))