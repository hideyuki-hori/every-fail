import { Effect } from 'effect'

export const setHtml = (el: Element, html: string) =>
  Effect.sync(() => {
    el.setHTML(html)
  })
