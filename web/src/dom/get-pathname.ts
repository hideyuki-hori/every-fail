import { Effect } from 'effect'

export const getPathname = Effect.sync(() => location.pathname)
