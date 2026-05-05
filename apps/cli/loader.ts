import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

type ResolveContext = {
  parentURL?: string
  conditions: string[]
  importAttributes: object
}

type ResolveResult = {
  url: string
  format?: string
  shortCircuit?: boolean
}

type LoadContext = {
  format?: string
  conditions: string[]
  importAttributes: object
}

type LoadResult = {
  format: string
  source: string
  shortCircuit?: boolean
}

export const resolve = async (
  specifier: string,
  context: ResolveContext,
  nextResolve: (s: string, c: ResolveContext) => Promise<ResolveResult>
): Promise<ResolveResult> => {
  if (specifier.endsWith('.sql')) {
    const url = context.parentURL
      ? new URL(specifier, context.parentURL).href
      : specifier
    return { url, format: 'sql', shortCircuit: true }
  }
  return nextResolve(specifier, context)
}

export const load = async (
  url: string,
  context: LoadContext,
  nextLoad: (u: string, c: LoadContext) => Promise<LoadResult>
): Promise<LoadResult> => {
  if (url.endsWith('.sql')) {
    const filePath = fileURLToPath(url)
    const content = await readFile(filePath, 'utf8')
    const source = `export default ${JSON.stringify(content)}`
    return { format: 'module', source, shortCircuit: true }
  }
  return nextLoad(url, context)
}
