// GET /api/jobs
// Returns the roles D-TECH is currently recruiting for, read straight from the
// Odoo Recruitment app. It does NOT depend on Odoo's website module, so the
// Odoo website can be switched off: a job appears here as soon as it is active
// in Recruitment with at least one expected employee ("Start Recruitment").
// Results are cached briefly so Odoo is not queried on every page view.
//
// Response: { ok: true, source: "odoo"|"static", jobs: [...], fetchedAt }
// If Odoo is not configured or unreachable, the page falls back to the static
// list it ships with, so the careers page never breaks.

const { call, stripHtml, isConfigured } = require('./_odoo');

const CACHE_MS = 10 * 60 * 1000;
let cache = { at: 0, jobs: null };

async function locationsFor(addressIds) {
  // Read the real city/state from the job's address partner instead of guessing
  // from its display name.
  const ids = [...new Set(addressIds.filter(Boolean))];
  if (!ids.length) return {};
  const rows = await call('res.partner', 'read', [ids], { fields: ['city', 'state_id', 'country_id'] });
  const map = {};
  for (const r of rows) {
    const parts = [r.city, Array.isArray(r.state_id) ? r.state_id[1] : ''].filter(Boolean);
    map[r.id] = parts.join(', ').slice(0, 80);
  }
  return map;
}

function shape(job, locations) {
  const full = stripHtml(job.description || '');
  const summary = full.split('\n').map(s => s.trim()).filter(Boolean)[0] || '';
  return {
    id: job.id,
    title: job.name,
    department: Array.isArray(job.department_id) ? job.department_id[1] : '',
    location: (Array.isArray(job.address_id) && locations[job.address_id[0]]) || '',
    positions: job.no_of_recruitment || 1,
    summary: summary.slice(0, 400),
    description: full.slice(0, 6000),
  };
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600, stale-while-revalidate=3600');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  if (!isConfigured()) {
    return res.status(200).json({ ok: true, source: 'static', jobs: [], reason: 'Odoo is not configured' });
  }
  if (cache.jobs && Date.now() - cache.at < CACHE_MS) {
    return res.status(200).json({ ok: true, source: 'odoo', cached: true, jobs: cache.jobs, fetchedAt: new Date(cache.at).toISOString() });
  }
  try {
    // Recruiting = the job is active and HR expects to hire at least one person.
    // ODOO_JOB_DOMAIN can override this with a JSON Odoo domain if ever needed.
    let domain = [['active', '=', true], ['no_of_recruitment', '>', 0]];
    if (process.env.ODOO_JOB_DOMAIN) {
      try { domain = JSON.parse(process.env.ODOO_JOB_DOMAIN); }
      catch (e) { console.error('ODOO_JOB_DOMAIN is not valid JSON; using the default'); }
    }
    const rows = await call('hr.job', 'search_read', [domain], {
      fields: ['name', 'department_id', 'address_id', 'no_of_recruitment', 'description'],
      order: 'name asc',
      limit: 100,
    });
    const locations = await locationsFor(rows.map(j => Array.isArray(j.address_id) ? j.address_id[0] : null));
    const jobs = rows.map(j => shape(j, locations));
    cache = { at: Date.now(), jobs };
    return res.status(200).json({ ok: true, source: 'odoo', jobs, fetchedAt: new Date(cache.at).toISOString() });
  } catch (err) {
    console.error('Odoo jobs fetch failed:', err.message);
    if (cache.jobs) {
      return res.status(200).json({ ok: true, source: 'odoo', stale: true, jobs: cache.jobs, fetchedAt: new Date(cache.at).toISOString() });
    }
    return res.status(200).json({ ok: true, source: 'static', jobs: [], reason: 'Odoo unavailable' });
  }
};
