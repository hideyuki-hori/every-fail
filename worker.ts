export default {
  async fetch(request: Request, env: Record<string, unknown>) {
    const response = await env.ASSETS.fetch(request)
    const ct = response.headers.get('content-type') ?? ''
    if (
      ct.startsWith('text/html')
      && !ct.includes('charset')
    ) {
      const headers = new Headers(response.headers)
      headers.set('content-type', 'text/html; charset=utf-8')
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      })
    }
    return response
  },
} satisfies ExportedHandler
