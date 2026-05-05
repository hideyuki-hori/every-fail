import { AwsClient } from 'aws4fetch'

export type R2Client = {
  put(key: string, body: Uint8Array, contentType: string): Promise<void>
  delete(key: string): Promise<void>
  list(prefix: string): Promise<string[]>
}

type R2ClientOptions = {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
  bucket: string
}

export function createR2Client(opts: R2ClientOptions): R2Client {
  const aws = new AwsClient({
    accessKeyId: opts.accessKeyId,
    secretAccessKey: opts.secretAccessKey,
    service: 's3',
    region: 'auto',
  })
  const baseUrl = `https://${opts.accountId}.r2.cloudflarestorage.com/${opts.bucket}`

  function objectUrl(key: string): string {
    const segments = key.split('/').map(s => encodeURIComponent(s))
    return `${baseUrl}/${segments.join('/')}`
  }

  async function put(
    key: string,
    body: Uint8Array,
    contentType: string
  ): Promise<void> {
    const res = await aws.fetch(objectUrl(key), {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body,
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`R2 PUT ${key} failed: ${res.status} ${text}`)
    }
  }

  async function deleteKey(key: string): Promise<void> {
    const res = await aws.fetch(objectUrl(key), { method: 'DELETE' })
    if (!res.ok && res.status !== 404) {
      const text = await res.text()
      throw new Error(`R2 DELETE ${key} failed: ${res.status} ${text}`)
    }
  }

  async function list(prefix: string): Promise<string[]> {
    const keys: string[] = []
    let token: string | undefined
    do {
      const params = new URLSearchParams({ 'list-type': '2', prefix })
      if (token) params.set('continuation-token', token)
      const url = `${baseUrl}?${params.toString()}`
      const res = await aws.fetch(url, { method: 'GET' })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(`R2 LIST failed: ${res.status} ${text}`)
      }
      const xml = await res.text()
      for (const m of xml.matchAll(/<Key>([^<]+)<\/Key>/g)) {
        keys.push(m[1])
      }
      const truncated = /<IsTruncated>true<\/IsTruncated>/.test(xml)
      const tokenMatch = xml.match(
        /<NextContinuationToken>([^<]+)<\/NextContinuationToken>/
      )
      token = truncated ? tokenMatch?.[1] : undefined
    } while (token)
    return keys
  }

  return { put, delete: deleteKey, list }
}
