import type { DotContext, Unmount } from '@every-fail/dot-sdk'

export { meta } from './meta'

export const mount = (c: DotContext): Unmount => {
  const article = document.createElement('article')
  article.innerHTML = '<h2>hello</h2><p>first dot</p>'
  c.root.appendChild(article)
  return () => {
    c.root.removeChild(article)
  }
}
