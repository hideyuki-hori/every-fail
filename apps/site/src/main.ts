import { Effect, Layer, Stream } from 'effect'
import { querySelector } from './dom/query-selector'
import { loadDotHtml } from './http/load-dot-html'
import { DocumentServiceLive } from './dom/document-service'
import { FetchHttpClient } from '@effect/platform'
import { ConfigProviderLive } from './config/provider'
import './styles/index.css'

const MainLive = Layer.mergeAll(
  DocumentServiceLive,
  FetchHttpClient.layer,
  ConfigProviderLive,
)

const root = Effect.gen(function* () {
  const el = yield* querySelector('.content')
  const button = yield* querySelector('.switch')
  yield* Stream.fromEventListener(button, 'click').pipe(
    Stream.scan('a', prev => prev === 'a' ? 'b' : 'a'),
    Stream.drop(1),
    Stream.runForEach(page => Effect.gen(function* () {
      const html = yield* loadDotHtml(page)
      el.innerHTML = html
    }))
  )
})

Effect.runFork(root.pipe(Effect.provide(MainLive)))