interface Env {
  ASSETS: Fetcher
  IMPRESSIONS: R2Bucket
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname === '/api/correct' && request.method === 'POST') {
      return handleCorrect(request, env)
    }
    return env.ASSETS.fetch(request)
  },
} satisfies ExportedHandler<Env>

async function handleCorrect(request: Request, env: Env): Promise<Response> {
  let body: Record<string, unknown> = {}
  try {
    body = await request.json()
  } catch {
    return new Response(null, { status: 204 })
  }

  const cf = request.cf
  const h = request.headers
  const now = new Date()

  const impression = {
    ts: now.toISOString(),
    client: body,
    geo: {
      colo: cf?.colo,
      continent: cf?.continent,
      country: cf?.country,
      region: cf?.region,
      regionCode: cf?.regionCode,
      city: cf?.city,
      metroCode: cf?.metroCode,
      timezone: cf?.timezone,
    },
    network: {
      asn: cf?.asn,
      asOrganization: cf?.asOrganization,
      httpProtocol: cf?.httpProtocol,
      tlsVersion: cf?.tlsVersion,
    },
    request: {
      userAgent: h.get('user-agent'),
      acceptLanguage: h.get('accept-language'),
      referer: h.get('referer'),
      url: request.url,
      method: request.method,
    },
  }

  const key = `impressions/${now.toISOString().slice(0, 10)}/${now.getTime()}-${crypto.randomUUID()}.json`
  await env.IMPRESSIONS.put(key, JSON.stringify(impression))

  return new Response(null, { status: 204 })
}
