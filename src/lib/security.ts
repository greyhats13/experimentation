import type { NextRequest } from 'next/server'

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_REQUESTS = 60

interface RateRecord {
  readonly count: number
  readonly windowStart: number
}

let rateLimitStore: ReadonlyMap<string, RateRecord> = new Map()

// TODO(security): Integrate OAuth 2.0 / OpenID Connect and MFA with Argon2id password hashing when multi-user accounts are introduced.
// TODO(security): Configure mTLS database authentication and virus/CDR scanning if external DB or file uploads are added in future iterations.

/**
 * Extracts a client identifier from incoming request headers for rate limiting.
 */
function getClientKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded !== null && forwarded.trim().length > 0) {
    const firstIp = forwarded.split(',')[0]
    return firstIp !== undefined ? firstIp.trim() : 'local-client'
  }
  return 'local-client'
}

/**
 * Checks whether the client is within the allowed request rate limit window.
 */
export function checkRateLimit(request: NextRequest): boolean {
  const key = getClientKey(request)
  const now = Date.now()
  const existing = rateLimitStore.get(key)

  if (existing === undefined || now - existing.windowStart > RATE_LIMIT_WINDOW_MS) {
    const nextMap = new Map(rateLimitStore)
    nextMap.set(key, { count: 1, windowStart: now })
    rateLimitStore = nextMap
    return true
  }

  if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false
  }

  const nextMap = new Map(rateLimitStore)
  nextMap.set(key, {
    count: existing.count + 1,
    windowStart: existing.windowStart,
  })
  rateLimitStore = nextMap
  return true
}

/**
 * Verifies CSRF custom header and same-origin requirements on state-changing requests.
 */
export function verifyCsrfAndOrigin(request: NextRequest): boolean {
  const requestedWith = request.headers.get('x-requested-with')
  if (requestedWith !== 'XMLHttpRequest') {
    return false
  }

  const origin = request.headers.get('origin')
  if (origin !== null) {
    const requestHost = request.nextUrl.origin
    if (origin !== requestHost) {
      return false
    }
  }

  return true
}

/**
 * Resets the in-memory rate limiter state between automated test runs.
 */
export function resetRateLimiterForTesting(): void {
  rateLimitStore = new Map()
}
