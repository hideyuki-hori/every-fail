import { Effect } from 'effect'

export const parseHtml = (html: string) =>
  Effect.sync(() =>
    new DOMParser().parseFromString(html, 'text/html'),
  )
