export class StubElement {
  tagName: string
  childNodes: StubElement[] = []
  innerHTMLContent: string = ''

  constructor(tagName: string) {
    this.tagName = tagName.toLowerCase()
  }

  set innerHTML(value: string) {
    this.innerHTMLContent = value
    this.childNodes = []
  }

  get innerHTML(): string {
    if (this.childNodes.length === 0) return this.innerHTMLContent
    return this.childNodes.map(c => c.outerHTML).join('')
  }

  get outerHTML(): string {
    return `<${this.tagName}>${this.innerHTML}</${this.tagName}>`
  }

  appendChild(child: StubElement): StubElement {
    this.childNodes.push(child)
    return child
  }

  removeChild(child: StubElement): StubElement {
    const i = this.childNodes.indexOf(child)
    if (i >= 0) this.childNodes.splice(i, 1)
    return child
  }
}

export function setupDom(): void {
  Object.defineProperty(globalThis, 'document', {
    value: {
      createElement(tag: string): StubElement {
        return new StubElement(tag)
      },
    },
    configurable: true,
    writable: true,
  })
}

export function createRoot(): StubElement {
  return new StubElement('div')
}
