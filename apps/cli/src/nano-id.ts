import { randomBytes } from 'node:crypto'

const ALPHABET =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const LIMIT = 62 * 4

export function nanoId(size = 8): string {
  let id = ''
  while (id.length < size) {
    const bytes = randomBytes(size * 2)
    for (let i = 0; i < bytes.length && id.length < size; i++) {
      const b = bytes[i]
      if (b < LIMIT) id += ALPHABET[b % 62]
    }
  }
  return id
}
