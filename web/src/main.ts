import { Effect, Stream } from 'effect'
import { getPathname } from './dom/get-pathname'
import { cacheCurrentContent } from './navigation/cache-content'
import { clickNavigations } from './navigation/click'
import { navigateTo } from './navigation/navigate-to'
import { popstateNavigations } from './navigation/popstate'
import { BrowserDocument } from './service/browser-document'

Effect.runFork(
  cacheCurrentContent.pipe(
    Effect.andThen(
      Stream.fromEffect(getPathname).pipe(
        Stream.filter(p => p !== '/'),
        Stream.merge(clickNavigations),
        Stream.merge(popstateNavigations),
        Stream.mapEffect(pathname =>
          navigateTo(pathname).pipe(
            Effect.catchAll(() => Effect.void),
          ),
        ),
        Stream.runDrain,
      ),
    ),
    Effect.provide(BrowserDocument),
  ),
)
