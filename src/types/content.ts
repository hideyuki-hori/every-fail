import type { ContentKind } from './content-kind'
import type { DateString } from './date-string'
import type { Tag } from './tag'

export interface Content<T = ContentKind> {
  kind: T
  publishDate: DateString
  tags: Tag[]
}
