import { Effect, Layer, Stream } from 'effect'
import { querySelector } from './dom/query-selector'
import { downloadHtml } from './http/download-html'
import { DocumentServiceLive } from './dom/document-service'
import { ConfigProviderLive } from './config/provider'
import { SucceedOnly } from './http/clients'
import { ContentReplacer, ContentReplacerLive } from './dom/content-replacer'
import { HtmlParserLive } from './dom/html-parser'
import { DOMParserServiceLive } from './dom/dom-parser-service'
import './styles/index.css'

const MainLive = ContentReplacerLive.pipe(
  Layer.provide(HtmlParserLive),
  Layer.provide(DOMParserServiceLive),
  Layer.provideMerge(DocumentServiceLive),
  Layer.merge(SucceedOnly),
  Layer.merge(ConfigProviderLive),
)

const root = Effect.gen(function* () {
  const replace = yield* ContentReplacer
  const button = yield* querySelector('.switch')
  yield* Stream.fromEventListener(button, 'click').pipe(
    Stream.scan('a', prev => prev === 'a' ? 'b' : 'a'),
    Stream.drop(1),
    Stream.runForEach(page => Effect.gen(function* () {
      const html = yield* downloadHtml(page)
      yield* replace(html)
    }).pipe(Effect.catchAll(e => Effect.log(e))))
  )
})

Effect.runFork(root.pipe(Effect.provide(MainLive)))