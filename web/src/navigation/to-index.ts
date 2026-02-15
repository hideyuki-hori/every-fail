import { Effect } from 'effect'
import { cloneChildren } from '../dom/clone-children'
import { parseHtml } from '../dom/parse-html'
import { replaceContent } from '../dom/replace-content'
import { setTitle } from '../dom/set-title'
import { fetchText } from '../http/fetch-text'
import { indexCache } from './index-cache'

export const navigateToIndex = (content: Element) =>
  Effect.gen(function* () {
    if (indexCache.current) {
      yield* replaceContent(content, indexCache.current)
    } else {
      const html = yield* fetchText('/')
      const doc = yield* parseHtml(html)
      const main = doc.getElementById('content')
      if (main) {
        indexCache.current = yield* cloneChildren(main)
        yield* replaceContent(content, indexCache.current)
      }
    }
    yield* setTitle('every.fail')
  })
