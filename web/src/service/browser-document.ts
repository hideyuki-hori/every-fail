import { Layer } from 'effect'
import { Doc } from './doc'

export const BrowserDocument = Layer.succeed(Doc, document)
