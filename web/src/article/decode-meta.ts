import { Schema } from 'effect'
import { ArticleMeta } from './meta'

export const decodeMeta = Schema.decodeUnknown(ArticleMeta)
