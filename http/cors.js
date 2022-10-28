const e = {
  WHITELISTED_CORS_DOMAINS: process.env.WHITELISTED_CORS_DOMAINS || '',
  FALLBACK_CORS_ORIGIN: process.env.FALLBACK_CORS_ORIGIN || 'https://app.neptunemutual.com'
}

/**
 *
 * @param {import("next/server").NextRequest} req
 */
export const getAllowed = (req) => {
  const { WHITELISTED_CORS_DOMAINS, FALLBACK_CORS_ORIGIN } = e
  const whitelistedDomains = WHITELISTED_CORS_DOMAINS ? WHITELISTED_CORS_DOMAINS.split(',').map(x => x.trim()) : []

  const caller = req.headers.get('origin') || req.headers.get('referer')
  if (caller) {
    const url = new URL(caller) || { hostname: '', origin: '' }
    const { hostname, origin } = url

    for (const domain of whitelistedDomains) {
      if (hostname.endsWith(domain)) {
        return origin
      }
    }
  }

  return FALLBACK_CORS_ORIGIN
}
