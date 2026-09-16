// Minimal Odoo external-API client (JSON-RPC over HTTPS), shared by the
// careers endpoints. The API key lives only in Vercel's environment variables:
//
//   ODOO_URL       https://d-tech-live-database.odoo.com
//   ODOO_DB        odoo-ps-psin-dtech-master-6996813
//   ODOO_USERNAME  login of the website user (recruitment access only)
//   ODOO_API_KEY   API key generated for that user
//
// Nothing here is ever sent to the browser.

const TIMEOUT_MS = 20000;

function config() {
  const { ODOO_URL, ODOO_DB, ODOO_USERNAME, ODOO_API_KEY } = process.env;
  if (!ODOO_URL || !ODOO_DB || !ODOO_USERNAME || !ODOO_API_KEY) return null;
  return { url: ODOO_URL.replace(/\/+$/, ''), db: ODOO_DB, user: ODOO_USERNAME, key: ODOO_API_KEY };
}

async function rpc(cfg, service, method, args) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let res;
  try {
    res = await fetch(`${cfg.url}/jsonrpc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'call', params: { service, method, args } }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) throw new Error(`Odoo HTTP ${res.status}`);
  const data = await res.json();
  if (data.error) {
    const message = data.error?.data?.message || data.error.message || 'Odoo error';
    throw new Error(String(message).slice(0, 300));
  }
  return data.result;
}

// uid is cached for the life of the warm function instance.
let cachedUid = null;

async function login(cfg) {
  if (cachedUid) return cachedUid;
  const uid = await rpc(cfg, 'common', 'authenticate', [cfg.db, cfg.user, cfg.key, {}]);
  if (!uid) throw new Error('Odoo authentication failed: check ODOO_DB, ODOO_USERNAME and ODOO_API_KEY');
  cachedUid = uid;
  return uid;
}

async function call(model, method, args = [], kwargs = {}) {
  const cfg = config();
  if (!cfg) throw new Error('Odoo is not configured');
  const uid = await login(cfg);
  return rpc(cfg, 'object', 'execute_kw', [cfg.db, uid, cfg.key, model, method, args, kwargs]);
}

// Which "published" field this database uses (Odoo renamed it across versions).
let publishedField = null;

async function publishedFieldName() {
  if (publishedField) return publishedField;
  const fields = await call('hr.job', 'fields_get', [[], ['string']]);
  publishedField = 'is_published' in fields ? 'is_published' : 'website_published';
  return publishedField;
}

function stripHtml(value) {
  if (!value || typeof value !== 'string') return '';
  return value
    .replace(/<\s*(br|\/p|\/li|\/div|\/h[1-6])\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

module.exports = { config, call, publishedFieldName, stripHtml, isConfigured: () => !!config() };
