type RouteListener = (pathname: string) => void

let listeners: RouteListener[] = []

const emit = (pathname: string) => {
  for (const l of listeners) l(pathname)
}

export const onRoute = (l: RouteListener) => {
  listeners.push(l)
  l(location.pathname)
  return () => {
    listeners = listeners.filter(x => x !== l)
  }
}

export const navigate = (pathname: string) => {
  history.pushState(null, '', pathname)
  emit(pathname)
}

window.addEventListener('popstate', () => {
  emit(location.pathname)
})
