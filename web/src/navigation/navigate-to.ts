import { Effect } from 'effect'
import { getElementById } from '../dom/get-element-by-id'
import { extractArticleId } from './extract-article-id'
import { navigateToArticle } from './to-article'
import { navigateToIndex } from './to-index'

export const navigateTo = (pathname: string) =>
  Effect.gen(function* () {
    const content = yield* getElementById('content')
    if (!content) return

    if (pathname === '/') {
      yield* navigateToIndex(content)
      return
    }

    const articleId = extractArticleId(pathname)
    if (!articleId) return

    yield* navigateToArticle(content, articleId)
  })
