// Shared request-handling helpers for the Vercel functions (contact, apply,
// send-whitepaper): origin/CSRF check, string sanitizing and a best-effort
// rate limiter. Nothing here holds state across modules — see createRateLimiter.

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[A-Za-z]{2,}$/;

// Best-effort abuse brake. Call this once per module so each endpoint keeps
// its own independent counters — instances are short-lived and not shared,
// so this only slows bursts; add a CAPTCHA or a shared store for stronger
// protection.
function createRateLimiter() {
  const hits = new Map();
  return function overLimit(key, max, windowMs) {
    const now = Date.now();
    const recent = (hits.get(key) || []).filter(t => now - t < windowMs);
    recent.push(now);
    hits.set(key, recent);
    if (hits.size > 5000) hits.clear();
    return recent.length > max;
  };
}

function allowedOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return false;
  let host;
  try { host = new URL(origin).host; } catch (e) { return false; }
  if (host === req.headers.host || host === req.headers['x-forwarded-host']) return true;
  return String(process.env.ALLOWED_ORIGINS || '')
    .split(',').map(o => o.trim().replace(/\/+$/, '')).filter(Boolean)
    .includes(origin.replace(/\/+$/, ''));
}

function esc(v) {
  return String(v).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function clean(v, max) {
  return String(v == null ? '' : v).replace(/[\r\n\t]+/g, ' ').trim().slice(0, max);
}

module.exports = { EMAIL_RE, createRateLimiter, allowedOrigin, esc, clean };
