import { getAssetFromKV } from '@cloudflare/kv-asset-handler'

const DEBUG = false

const defaultOptions = {
  browserTTL: null,
  cacheControl: {
    browserTTL: 60 * 60 * 24 * 7, // 7 days browser cache
    edgeTTL: 60 * 60 * 24 * 30,   // 30 days edge cache
    bypassCache: false,
  },
}

const handleEvent = async (event) => {
  const url = new URL(event.request.url)
  try {
    let options = {}
    if (DEBUG) {
      options = {
        cacheControl: {
          bypassCache: true,
        },
      }
    }
    const page = await getAssetFromKV(event, { ...defaultOptions, ...options })
    const response = new Response(page.body, page)
    // Set security headers
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
    
    // Add caching headers for static assets
    if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
      response.headers.set('Cache-Control', 'public, max-age=31536000')
    }
    return response
  } catch (e) {
    // If an error is thrown try to serve the asset at 404.html
    if (!DEBUG) {
      try {
        const notFoundResponse = await getAssetFromKV(event, {
          mapRequestToAsset: (req) => new Request(`${new URL(req.url).origin}/404.html`, req),
        })
        return new Response(notFoundResponse.body, { ...notFoundResponse, status: 404 })
      } catch (e) {}
    }
    return new Response(e.message || e.toString(), { status: 500 })
  }
}

addEventListener('fetch', (event) => {
  event.respondWith(handleEvent(event))
})