export function info(...args: unknown[]): void {
  globalThis.console.info(...args)
}

export function log(...args: unknown[]): void {
  globalThis.console.log(...args)
}

export function error(...args: unknown[]): void {
  globalThis.console.error(...args)
}

export function warn(...args: unknown[]): void {
  globalThis.console.warn(...args)
}

export function debug(...args: unknown[]): void {
  globalThis.console.debug(...args)
}

export function fetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  return globalThis.fetch(input, init)
}
