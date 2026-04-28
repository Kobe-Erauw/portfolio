interface Env {
  GITHUB_TOKEN: string
}

// Proxies /api/github/* to https://api.github.com/* with a server-side PAT
// so the browser never sees the token and we get the authenticated rate limit.
export const onRequest: PagesFunction<Env> = async ({ request, params, env }) => {
  const path = Array.isArray(params.path) ? params.path.join('/') : (params.path ?? '')
  const url = new URL(request.url)
  const target = `https://api.github.com/${path}${url.search}`

  const headers = new Headers()
  headers.set('User-Agent', 'kobe-erauw-portfolio')
  headers.set('Accept', request.headers.get('Accept') ?? 'application/vnd.github+json')
  if (env.GITHUB_TOKEN) {
    headers.set('Authorization', `Bearer ${env.GITHUB_TOKEN}`)
  }

  const upstream = await fetch(target, { method: request.method, headers })

  // Strip hop-by-hop headers and pass body through
  const responseHeaders = new Headers(upstream.headers)
  responseHeaders.delete('content-encoding')
  responseHeaders.delete('content-length')
  // Cache successful responses briefly at the edge to soften the rate limit
  if (upstream.ok) {
    responseHeaders.set('Cache-Control', 'public, max-age=60, s-maxage=300')
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  })
}
