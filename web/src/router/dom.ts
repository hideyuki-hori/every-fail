export function cloneChildren(el: Element): DocumentFragment {
  const frag = document.createDocumentFragment()
  for (const child of Array.from(el.childNodes)) {
    frag.appendChild(child.cloneNode(true))
  }
  return frag
}

export function replaceContent(
  container: Element,
  source: DocumentFragment,
): void {
  container.replaceChildren(source.cloneNode(true))
}

export function parseFragment(html: string): DocumentFragment {
  const tpl = document.createElement('template')
  tpl.innerHTML = html
  return tpl.content
}
