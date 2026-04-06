interface Env {
  ASSETS: Fetcher
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': '*',
        },
      })
    }

    const url = new URL(request.url)
    const path = url.pathname

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
    }

    const dotsMatch = path.match(/^\/api\/dots\/([^/]+)$/)
    if (dotsMatch) {
      const name = dotsMatch[1]
      const res = await env.ASSETS.fetch(new URL(`/${name}/index.html`, url.origin))
      return new Response(res.body, { ...res, headers: { ...Object.fromEntries(res.headers), ...corsHeaders } })
    }

    const assetMatch = path.match(/^\/api\/dots\/([^/]+)\/(.+)$/)
    if (assetMatch) {
      const name = assetMatch[1]
      const file = assetMatch[2]
      const res = await env.ASSETS.fetch(new URL(`/${name}/${file}`, url.origin))
      return new Response(res.body, { ...res, headers: { ...Object.fromEntries(res.headers), ...corsHeaders } })
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders })
  },
}
