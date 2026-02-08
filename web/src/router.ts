const UUID_V7_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

let cachedIndex: DocumentFragment | null = null

function cloneChildren(el: Element): DocumentFragment {
  const frag = document.createDocumentFragment()
  for (const child of Array.from(el.childNodes)) {
    frag.appendChild(child.cloneNode(true))
  }
  return frag
}

function replaceContent(
  container: Element,
  source: DocumentFragment,
): void {
  container.replaceChildren(source.cloneNode(true))
}

function parseFragment(html: string): DocumentFragment {
  const tpl = document.createElement('template')
  tpl.innerHTML = html
  return tpl.content
}

function isInternalLink(anchor: HTMLAnchorElement): boolean {
  return (
    anchor.origin === location.origin
    && !anchor.hasAttribute('download')
    && anchor.target !== '_blank'
  )
}

function extractArticleId(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean)
  if (
    segments.length === 1
    && UUID_V7_RE.test(segments[0])
  ) {
    return segments[0]
  }
  return null
}

async function navigateTo(pathname: string): Promise<void> {
  const content = document.getElementById('content')
  if (!content) return

  if (pathname === '/') {
    if (cachedIndex) {
      replaceContent(content, cachedIndex)
    } else {
      const res = await fetch('/')
      const html = await res.text()
      const doc = new DOMParser().parseFromString(html, 'text/html')
      const indexContent = doc.getElementById('content')
      if (indexContent) {
        cachedIndex = cloneChildren(indexContent)
        replaceContent(content, cachedIndex)
      }
    }
    document.title = 'every.fail'
    return
  }

  const articleId = extractArticleId(pathname)
  if (!articleId) return

  const [htmlRes, jsonRes] = await Promise.all([
    fetch(`/${articleId}/index.html`),
    fetch(`/${articleId}/meta.json`),
  ])

  if (htmlRes.ok) {
    const html = await htmlRes.text()
    const doc = new DOMParser().parseFromString(html, 'text/html')
    const extracted = doc.getElementById('content')
    const frag = extracted
      ? cloneChildren(extracted)
      : parseFragment(html)
    content.replaceChildren(frag)
  }

  if (jsonRes.ok) {
    const meta: { title: string; description: string } = await jsonRes.json()
    document.title = `${meta.title} - every.fail`
  }
}

export function initRouter(): void {
  const content = document.getElementById('content')
  if (content) {
    cachedIndex = cloneChildren(content)
  }

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
    navigateTo(pathname)
  })

  window.addEventListener('popstate', () => {
    navigateTo(location.pathname)
  })
}
