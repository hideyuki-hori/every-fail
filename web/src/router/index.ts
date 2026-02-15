import { isInternalLink } from './link'
import { cacheCurrentContent, runNavigation } from './navigate'

export function initRouter(): void {
  cacheCurrentContent()

  document.addEventListener('click', e => {
    const target = (e.target instanceof Element)
      ? e.target.closest('a')
      : null
    if (!target) return
    if (!(target instanceof HTMLAnchorElement)) return
    if (!isInternalLink(target)) return

    e.preventDefault()
    const pathname = target.pathname
    if (pathname === location.pathname) return

    history.pushState(null, '', pathname)
    runNavigation(pathname)
  })

  window.addEventListener('popstate', () => {
    runNavigation(location.pathname)
  })

  if (location.pathname !== '/') {
    runNavigation(location.pathname)
  }
}
