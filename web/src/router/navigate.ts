import { Effect } from 'effect'
import { cloneChildren, parseFragment, replaceContent } from './dom'
import { decodeMeta, fetchJson, fetchText } from './fetch'
import { extractArticleId } from './link'

let cachedIndex: DocumentFragment | null = null

export function cacheCurrentContent(): void {
  const content = document.getElementById('content')
  if (content) {
    cachedIndex = cloneChildren(content)
  }
}

const navigateToIndex = (content: Element) =>
  Effect.gen(function* () {
    if (cachedIndex) {
      replaceContent(content, cachedIndex)
    } else {
      const html = yield* fetchText('/')
      const doc = new DOMParser().parseFromString(html, 'text/html')
      const main = doc.getElementById('content')
      if (main) {
        cachedIndex = cloneChildren(main)
        replaceContent(content, cachedIndex)
      }
    }
    document.title = 'every.fail'
  })

const navigateToArticle = (content: Element, articleId: string) =>
  Effect.gen(function* () {
    const [html, raw] = yield* Effect.all([
      fetchText(`/${articleId}/index.html`),
      fetchJson(`/${articleId}/meta.json`),
    ], { concurrency: 2 })

    const doc = new DOMParser().parseFromString(html, 'text/html')
    const extracted = doc.getElementById('content')
    const frag = extracted
      ? cloneChildren(extracted)
      : parseFragment(html)
    content.replaceChildren(frag)

    const meta = yield* decodeMeta(raw)
    document.title = `${meta.title} - every.fail`
  })

const navigateTo = (pathname: string) =>
  Effect.gen(function* () {
    const content = document.getElementById('content')
    if (!content) return

    if (pathname === '/') {
      yield* navigateToIndex(content)
      return
    }

    const articleId = extractArticleId(pathname)
    if (!articleId) return

    yield* navigateToArticle(content, articleId)
  })

export const runNavigation = (pathname: string): void => {
  Effect.runPromise(
    navigateTo(pathname).pipe(
      Effect.catchAll(() => Effect.void)
    )
  )
}
