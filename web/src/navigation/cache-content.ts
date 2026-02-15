import { Effect } from 'effect'
import { cloneChildren } from '../dom/clone-children'
import { getElementById } from '../dom/get-element-by-id'
import { indexCache } from './index-cache'

export const cacheCurrentContent = Effect.gen(function* () {
  const content = yield* getElementById('content')
  if (content) {
    indexCache.current = yield* cloneChildren(content)
  }
})
