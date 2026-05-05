import { randomBytes } from 'node:crypto'

const ALPHABET =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-'

export const nanoId = (size = 8): string => {
  const bytes = randomBytes(size)
  let id = ''
  for (let i = 0; i < size; i++) {
    id += ALPHABET[bytes[i] & 63]
  }
  return id
}
