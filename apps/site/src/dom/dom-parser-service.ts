import { Context, Layer } from 'effect'

export class DOMParserService extends Context.Tag('DomParser')<
  DOMParserService,
  DOMParser
>() {}

export const DOMParserServiceLive = Layer.succeed(DOMParserService, new DOMParser())
