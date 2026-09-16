// POST /api/apply
// Creates a candidate in Odoo Recruitment (hr.applicant) from the careers page
// form, with the CV stored as an attachment on that record, so HR sees the
// application in the same pipeline as applications made on the Odoo site.
//
// Body (JSON):
//   { jobId, name, email, phone, message, cv: { filename, type, dataBase64 }, website }
//   "website" is a hidden bot-trap field and must stay empty.
//
// Needs ODOO_URL, ODOO_DB, ODOO_USERNAME and ODOO_API_KEY (see _odoo.js).

const { call, isConfigured } = require('./_odoo');

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[A-Za-z]{2,}$/;
const MAX_CV_BYTES = 3 * 1024 * 1024; // Vercel caps the request body at 4.5 MB
const ALLOWED_CV = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
};

const hits = new Map();

function overLimit(key, max, windowMs) {
  const now = Date.now();
  const recent = (hits.get(key) || []).filter(t => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > max;
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

function clean(value, max) {
  return String(value == null ? '' : value).replace(/[\r\n\t]+/g, ' ').trim().slice(0, max);
}

function esc(v) {
  return String(v).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function safeFilename(name, mime) {
  const ext = ALLOWED_CV[mime];
  const base = String(name || 'cv').replace(/[^A-Za-z0-9 ._-]/g, '').replace(/\.[A-Za-z0-9]+$/, '').trim().slice(0, 60) || 'cv';
  return `${base}.${ext}`;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  if (!allowedOrigin(req)) return res.status(403).json({ ok: false, error: 'Forbidden' });
  if (!/^application\/json\b/i.test(String(req.headers['content-type'] || ''))) {
    return res.status(415).json({ ok: false, error: 'Unsupported content type' });
  }
  if (!isConfigured()) {
    console.error('Odoo environment variables are missing');
    return res.status(503).json({ ok: false, error: 'Applications are temporarily unavailable. Please email sales@dtechindia.com.' });
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  body = body || {};
  if (body.website) return res.status(200).json({ ok: true }); // bot trap

  const applicant = {
    name: clean(body.name, 120),
    email: clean(body.email, 254),
    phone: clean(body.phone, 40),
    message: String(body.message == null ? '' : body.message).trim().slice(0, 3000),
  };
  const jobId = Number(body.jobId);

  if (!applicant.name) return res.status(400).json({ ok: false, error: 'Please enter your name.' });
  if (!EMAIL_RE.test(applicant.email)) return res.status(400).json({ ok: false, error: 'Please enter a valid email address.' });
  if (!Number.isInteger(jobId) || jobId <= 0) return res.status(400).json({ ok: false, error: 'Please choose a role to apply for.' });

  const ip = String(req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (overLimit('ip:' + ip, 5, 60 * 60 * 1000) || overLimit('mail:' + applicant.email.toLowerCase(), 3, 24 * 60 * 60 * 1000)) {
    return res.status(429).json({ ok: false, error: 'Too many applications from here. Please try again later.' });
  }

  // CV is optional, but when present it must be a PDF or Word file within the size limit.
  let cv = null;
  if (body.cv && body.cv.dataBase64) {
    const mime = String(body.cv.type || '').toLowerCase();
    if (!ALLOWED_CV[mime]) return res.status(400).json({ ok: false, error: 'Please attach your CV as a PDF or Word document.' });
    const base64 = String(body.cv.dataBase64).replace(/^data:[^;]+;base64,/, '');
    if (!/^[A-Za-z0-9+/=\s]+$/.test(base64)) return res.status(400).json({ ok: false, error: 'The attached file could not be read.' });
    const bytes = Math.floor(base64.replace(/\s/g, '').length * 3 / 4);
    if (bytes > MAX_CV_BYTES) return res.status(413).json({ ok: false, error: 'Your CV is larger than 3 MB. Please attach a smaller file.' });
    cv = { base64: base64.replace(/\s/g, ''), mime, filename: safeFilename(body.cv.filename, mime) };
  }

  try {
    const [job] = await call('hr.job', 'read', [[jobId]], { fields: ['name', 'department_id'] });
    if (!job) return res.status(400).json({ ok: false, error: 'That role is no longer open.' });

    const values = {
      partner_name: applicant.name,
      email_from: applicant.email,
      job_id: jobId,
      description: `<p><strong>Applied through dtechindia.com</strong></p><p>${esc(applicant.message) || 'No message provided.'}</p>`,
    };
    if (applicant.phone) values.partner_phone = applicant.phone;
    if (Array.isArray(job.department_id) && job.department_id[0]) values.department_id = job.department_id[0];

    const applicantId = await call('hr.applicant', 'create', [values]);

    if (cv) {
      try {
        await call('ir.attachment', 'create', [{
          name: cv.filename,
          datas: cv.base64,
          mimetype: cv.mime,
          res_model: 'hr.applicant',
          res_id: applicantId,
        }]);
      } catch (err) {
        console.error('CV attachment failed for applicant', applicantId, err.message);
      }
    }

    return res.status(200).json({ ok: true, reference: applicantId, job: job.name });
  } catch (err) {
    console.error('Odoo application failed:', err.message);
    return res.status(502).json({ ok: false, error: 'We could not submit your application right now. Please try again or email sales@dtechindia.com.' });
  }
};
