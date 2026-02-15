interface SetHTMLOptions {
  readonly sanitizer?: Sanitizer
}

interface Sanitizer {}

interface Element {
  setHTML(input: string, options?: SetHTMLOptions): void
}
