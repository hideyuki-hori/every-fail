import { Context, Effect, Layer } from 'effect'
import { DOMParserService } from './dom-parser-service'

export class HtmlParser extends Context.Tag('HtmlParser')<
  HtmlParser,
  (html: string) => ChildNode[]
>() {}

export const HtmlParserLive = Layer.effect(
  HtmlParser,
  Effect.gen(function* () {
    const parser = yield* DOMParserService
    return (html: string) => {
      const doc = parser.parseFromString(html, 'text/html')
      return Array.from(doc.body.childNodes)
    }
  })
)
