import { Effect, Context, Layer } from 'effect'
import { querySelector } from './query-selector'
import { HtmlParser } from './html-parser'

export class ContentReplacer extends Context.Tag('ContentReplacer')<
  ContentReplacer,
  (html: string) => Effect.Effect<void>
>() {}

export const ContentReplacerLive = Layer.effect(
  ContentReplacer,
  Effect.gen(function* () {
    const content = yield* querySelector('.context')
    const parse = yield* HtmlParser
    return (s: string) => Effect.sync(() => {
      const nodes = parse(s)
      content.replaceChildren(...nodes)
    })
  })
)