import { Effect } from 'effect'
import { decodeMeta } from '../article/decode-meta'
import { cloneChildren } from '../dom/clone-children'
import { parseFragment } from '../dom/parse-fragment'
import { parseHtml } from '../dom/parse-html'
import { setChildren } from '../dom/set-children'
import { setTitle } from '../dom/set-title'
import { fetchJson } from '../http/fetch-json'
import { fetchText } from '../http/fetch-text'

export const navigateToArticle = (content: Element, articleId: string) =>
  Effect.gen(function* () {
    const [html, raw] = yield* Effect.all([
      fetchText(`/${articleId}/index.html`),
      fetchJson(`/${articleId}/meta.json`),
    ], { concurrency: 2 })

    const doc = yield* parseHtml(html)
    const extracted = doc.getElementById('content')
    const frag = extracted
      ? yield* cloneChildren(extracted)
      : yield* parseFragment(html)
    yield* setChildren(content, frag)

    const meta = yield* decodeMeta(raw)
    yield* setTitle(`${meta.title} - every.fail`)
  })
