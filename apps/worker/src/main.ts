interface Env {
  ASSETS: Fetcher
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const path = url.pathname

    const dotsMatch = path.match(/^\/api\/dots\/([^/]+)$/)
    if (dotsMatch) {
      const name = dotsMatch[1]
      return env.ASSETS.fetch(new URL(`/${name}/index.html`, url.origin))
    }

    const assetMatch = path.match(/^\/api\/dots\/([^/]+)\/(.+)$/)
    if (assetMatch) {
      const name = assetMatch[1]
      const file = assetMatch[2]
      return env.ASSETS.fetch(new URL(`/${name}/${file}`, url.origin))
    }

    return new Response('Not Found', { status: 404 })
  },
}
