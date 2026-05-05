const API_BASE = 'https://api.cloudflare.com/client/v4'

export type KVClient = {
  put(key: string, value: string, contentType: string): Promise<void>
  delete(key: string): Promise<void>
  list(prefix: string): Promise<string[]>
}

type KVClientOptions = {
  apiToken: string
  accountId: string
  namespaceId: string
}

export function createKVClient(opts: KVClientOptions): KVClient {
  const baseUrl = `${API_BASE}/accounts/${opts.accountId}/storage/kv/namespaces/${opts.namespaceId}`
  const authHeader = `Bearer ${opts.apiToken}`

  async function put(
    key: string,
    value: string,
    contentType: string
  ): Promise<void> {
    const url = `${baseUrl}/values/${encodeURIComponent(key)}`
    const res = await fetch(url, {
      method: 'PUT',
      headers: { Authorization: authHeader, 'Content-Type': contentType },
      body: value,
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`KV PUT ${key} failed: ${res.status} ${text}`)
    }
  }

  async function deleteKey(key: string): Promise<void> {
    const url = `${baseUrl}/values/${encodeURIComponent(key)}`
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { Authorization: authHeader },
    })
    if (!res.ok && res.status !== 404) {
      const text = await res.text()
      throw new Error(`KV DELETE ${key} failed: ${res.status} ${text}`)
    }
  }

  async function list(prefix: string): Promise<string[]> {
    const keys: string[] = []
    let cursor: string | undefined
    do {
      const params = new URLSearchParams({ prefix, limit: '1000' })
      if (cursor) params.set('cursor', cursor)
      const url = `${baseUrl}/keys?${params.toString()}`
      const res = await fetch(url, {
        headers: { Authorization: authHeader },
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(`KV LIST failed: ${res.status} ${text}`)
      }
      const data: unknown = await res.json()
      if (
        !data ||
        typeof data !== 'object' ||
        !('result' in data) ||
        !Array.isArray(data.result)
      ) {
        throw new Error('KV LIST: invalid response shape')
      }
      for (const item of data.result) {
        if (
          item &&
          typeof item === 'object' &&
          'name' in item &&
          typeof item.name === 'string'
        ) {
          keys.push(item.name)
        }
      }
      cursor = undefined
      if (
        'result_info' in data &&
        data.result_info &&
        typeof data.result_info === 'object' &&
        'cursor' in data.result_info &&
        typeof data.result_info.cursor === 'string' &&
        data.result_info.cursor.length > 0
      ) {
        cursor = data.result_info.cursor
      }
    } while (cursor)
    return keys
  }

  return { put, delete: deleteKey, list }
}
