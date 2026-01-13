interface Env {
  HIT_API_SECRET: string
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, next, waitUntil, env } = context

  // Extract relevant information
  const url = new URL(request.url)
  const userAgent = request.headers.get('User-Agent') || 'Unknown'
  const referer = request.headers.get('Referer') || ''
  const ip = request.headers.get('CF-Connecting-IP') || 'Unknown'
  const country = request.headers.get('CF-IPCountry') || 'Unknown'

  const payload = {
    path: url.pathname,
    search: url.search,
    method: request.method,
    userAgent,
    referer,
    ip,
    country,
    timestamp: new Date().toISOString(),
  }

  if (request.headers.get('Accept')?.includes('text/html')) {
    waitUntil(
      fetch('https://hitapi.kobeerauw.com/hit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': env.HIT_API_SECRET,
        },
        body: JSON.stringify(payload),
      })
        .then((res) => {
          if (!res.ok) {
            console.error(`Hit API returned error status: ${res.status} ${res.statusText}`)
          }
        })
        .catch((err) => {
          console.error('Failed to send hit data:', err)
        }),
    )
  }

  return next()
}
