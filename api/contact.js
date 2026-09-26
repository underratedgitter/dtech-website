// POST /api/contact
// Emails a contact.html enquiry to D-TECH sales over SMTP, with Reply-To set to
// the visitor so sales can answer straight from their inbox.
//
// Body (JSON):
//   { name, email, phone, company, subject, topic, message, website }
//   "website" is a hidden bot-trap field and must stay empty.
//
// Needs SMTP_HOST, SMTP_USER and SMTP_PASS (see _mail.js).

const { isConfigured, sendMail, salesEmail } = require('./_mail');
const { EMAIL_RE, createRateLimiter, allowedOrigin, esc, clean } = require('./_http');

const overLimit = createRateLimiter();

// The message body keeps its line breaks; only strip control characters.
function cleanMultiline(v, max) {
  return String(v == null ? '' : v).replace(/\r\n?/g, '\n').replace(/[^\S\n]+/g, ' ').replace(/[\x00-\x08\x0b-\x1f\x7f]/g, '').trim().slice(0, max);
}

function enquiryEmail({ enquiry, ip }) {
  const rows = [
    ['Name', enquiry.name], ['Email', enquiry.email], ['Phone', enquiry.phone], ['Company', enquiry.company],
    ['Subject', enquiry.topic], ['Received at', new Date().toISOString()], ['IP', ip],
  ].map(([k, v]) => `<tr><td style="padding:6px 12px;color:#64748b">${esc(k)}</td><td style="padding:6px 12px"><strong>${esc(v || '—')}</strong></td></tr>`).join('');
  return `<p style="font-family:Arial,sans-serif">New enquiry from the website contact form. Reply to this email to answer the visitor directly.</p>
  <table style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">${rows}</table>
  <div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;white-space:pre-wrap;margin-top:16px;padding:14px 16px;background:#f8fafc;border-radius:8px">${esc(enquiry.message)}</div>`;
}

function enquiryText({ enquiry, ip }) {
  return [
    `Name: ${enquiry.name}`, `Email: ${enquiry.email}`, `Phone: ${enquiry.phone || '—'}`,
    `Company: ${enquiry.company || '—'}`, `Subject: ${enquiry.topic}`, `IP: ${ip}`, '', enquiry.message,
  ].join('\n');
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
    console.error('SMTP environment variables are missing');
    return res.status(503).json({ ok: false, error: 'Email delivery is temporarily unavailable. Please contact sales@dtechindia.com.' });
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  body = body || {};
  if (body.website) return res.status(200).json({ ok: true }); // bot trap

  const enquiry = {
    name: clean(body.name, 120),
    email: clean(body.email, 254),
    phone: clean(body.phone, 40),
    company: clean(body.company, 160),
    topic: clean(body.topic || body.subject, 120),
    message: cleanMultiline(body.message, 5000),
  };

  if (!enquiry.name) return res.status(400).json({ ok: false, error: 'Please enter your name.' });
  if (!EMAIL_RE.test(enquiry.email)) return res.status(400).json({ ok: false, error: 'Please enter a valid email address.' });
  if (!enquiry.message) return res.status(400).json({ ok: false, error: 'Please describe your requirement.' });

  const ip = String(req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (overLimit('ip:' + ip, 5, 10 * 60 * 1000)) {
    return res.status(429).json({ ok: false, error: 'Too many requests. Please try again later.' });
  }

  try {
    const sent = await sendMail({
      to: salesEmail(),
      replyTo: enquiry.email,
      subject: `Website enquiry: ${enquiry.topic || 'General'} — ${enquiry.name}`,
      html: enquiryEmail({ enquiry, ip }),
      text: enquiryText({ enquiry, ip }),
    });
    return res.status(200).json({ ok: true, id: sent.id });
  } catch (err) {
    console.error('Contact email failed:', err.message);
    return res.status(502).json({ ok: false, error: 'We could not send your request right now. Please try again or email sales@dtechindia.com.' });
  }
};
