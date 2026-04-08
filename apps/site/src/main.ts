import { Effect, Layer, Stream } from 'effect'
import { querySelector } from './dom/query-selector'
import { downloadHtml } from './http/download-html'
import { DocumentServiceLive } from './dom/document-service'
import { ConfigProviderLive } from './config/provider'
import { SucceedOnly } from './http/clients'
import './styles/index.css'

const MainLive = Layer.mergeAll(
  DocumentServiceLive,
  SucceedOnly,
  ConfigProviderLive,
)

const root = Effect.gen(function* () {
  const content = yield* querySelector('.content')
  const button = yield* querySelector('.switch')
  yield* Stream.fromEventListener(button, 'click').pipe(
    Stream.scan('a', prev => prev === 'a' ? 'b' : 'a'),
    Stream.drop(1),
    Stream.runForEach(page => Effect.gen(function* () {
      const html = yield* downloadHtml(page)
      content.replaceChildren(...html)
    }).pipe(Effect.catchAll(e => Effect.log(e))))
  )
})

Effect.runFork(root.pipe(Effect.provide(MainLive)))