/* Shared in-memory rate limiter + abuse helpers for /api/* routes
   Survives one Vercel function instance lifetime (~5–15 min idle).
   For stronger guarantees, swap to Upstash Redis later — same interface. */

const buckets = new Map(); // key -> array of timestamps

export function getClientIp(req) {
  const fwd = req.headers['x-forwarded-for'] || '';
  const first = fwd.split(',')[0].trim();
  return first || req.socket?.remoteAddress || 'unknown';
}

/**
 * Token-bucket style limiter. Returns { ok: true } or { ok: false, retryAfter: seconds }.
 * key: usually IP. limit: max events per window. windowMs: window in ms.
 */
export function takeToken(key, limit, windowMs) {
  const now = Date.now();
  const arr = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (arr.length >= limit) {
    const retryAfter = Math.ceil((arr[0] + windowMs - now) / 1000);
    buckets.set(key, arr);
    return { ok: false, retryAfter };
  }
  arr.push(now);
  buckets.set(key, arr);
  return { ok: true };
}

/**
 * Block obvious bots / scrapers by User-Agent.
 * Returns true if request looks suspicious.
 */
export function looksLikeBot(req) {
  const ua = (req.headers['user-agent'] || '').toLowerCase();
  if (!ua) return true; // empty UA is almost always a script
  const blocklist = [
    'curl/', 'wget/', 'python-requests', 'python-urllib', 'go-http-client',
    'scrapy', 'httpx', 'okhttp', 'java/', 'libwww', 'apache-httpclient',
    'postmanruntime', 'insomnia',
  ];
  return blocklist.some((bad) => ua.includes(bad));
}

/**
 * Check JSON body size. Returns true if request body is too large.
 * Vercel sets req.headers['content-length'] reliably for JSON POSTs.
 */
export function tooLarge(req, maxBytes) {
  const len = parseInt(req.headers['content-length'] || '0', 10);
  return Number.isFinite(len) && len > maxBytes;
}
