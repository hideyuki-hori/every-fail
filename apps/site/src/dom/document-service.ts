import { Context, Layer } from 'effect'

export class DocumentService extends Context.Tag('DocumentService')<
  DocumentService,
  Document
>() {}

export const DocumentServiceLive = Layer.succeed(
  DocumentService,
  globalThis.document
)
