import { Context, Effect, Layer } from 'effect'
import { HtmlParser } from './html-parser'
import { querySelector } from './query-selector'

export class ContentReplacer extends Context.Tag('ContentReplacer')<
  ContentReplacer,
  (html: string) => Effect.Effect<void>
>() {}

export const ContentReplacerLive = Layer.effect(
  ContentReplacer,
  Effect.gen(function* () {
    const content = yield* querySelector('.content')
    const parse = yield* HtmlParser
    return (s: string) =>
      Effect.sync(() => {
        const nodes = parse(s)
        content.replaceChildren(...nodes)
      })
  })
)
