# D-TECH Solution Integrators — Website

Static marketing site for D-TECH Solution Integrators Pvt. Ltd.: home, about, online shop, solutions, case studies, contact and legal pages.

Plain HTML, CSS and JavaScript. Styling is a prebuilt Tailwind file (`assets/tailwind.css`) plus the layers in `assets/` (`skin.css`, `skin-dark.css`, `color.css`, `polish.css`). Icons are a Lucide subset in `assets/lucide.js`. Nothing is loaded from third-party script hosts.

## Run locally

```sh
python3 -m http.server 8080
# open http://localhost:8080
```

## Rebuilding generated assets

Commit the outputs; Vercel serves them as-is and `tools/` is excluded by `.vercelignore`.

| Output | When to rebuild | Command (from the repo root) |
|---|---|---|
| `assets/tailwind.css` | after adding or changing Tailwind classes in any page or script | `npm run build:tailwind` |
| `assets/lucide.js` | after using a new `data-lucide` icon | `npm --prefix tools/lucide install && node tools/lucide/build.mjs` |
| `assets/og-image.png` | after editing `tools/og/og-image.html` | `node tools/og/render.mjs` (needs `puppeteer-core` and Chrome) |

`npm run build:css` always regenerates Tailwind from the current HTML and JavaScript before minifying and purging the production bundle. Run `npm run verify` before publishing to catch stale responsive utilities and other UI contract regressions.

## Analytics

`assets/analytics.js` loads Vercel Web Analytics (cookieless, same-origin) on every page except on localhost. Enable it in Vercel → Project → Analytics.

## Deploy on Vercel

1. Import this repository in Vercel.
2. Framework preset: **Other**. Leave the build command and output directory empty; the repository root is the site.
3. Deploy. `404.html` is served automatically for unknown paths.

## Email (SMTP)

The Vercel functions send mail over SMTP with [nodemailer](https://nodemailer.com), through `api/_mail.js`:

- `api/contact.js`: the Contact Us form (`contact.html`) posts here, and the enquiry is emailed to sales with Reply-To set to the visitor. If the function fails or is unavailable, the form falls back to opening the visitor's email app.
- `api/send-whitepaper.js`: case-study PDFs live in `assets/case-studies/pdf/`. When a visitor asks for one on `case-studies.html`, the PDF is emailed to them as an attachment and sales gets a lead notification.

Set these in Vercel → Project → Settings → Environment Variables, then redeploy:

| Variable | Required | Purpose |
|---|---|---|
| `SMTP_HOST` | yes | SMTP server, e.g. `smtp.gmail.com`, `smtp.zoho.in`, `smtp.office365.com` |
| `SMTP_USER` | yes | Mailbox login, e.g. `sales@dtechindia.com` |
| `SMTP_PASS` | yes | That mailbox's password, or an app password when the account uses 2-step verification |
| `SMTP_PORT` | no | `465` (implicit TLS, default) or `587` (STARTTLS) |
| `SMTP_SECURE` | no | `true`/`false`; defaults to `true` on port 465 only |
| `MAIL_FROM` | no | Sender shown to recipients (default `D-TECH <SMTP_USER>`). Most providers reject a From address the login does not own. |
| `SALES_EMAIL` | no | Receives enquiries and lead notifications (default `sales@dtechindia.com`) |
| `SITE_URL` | no | Public address used in email links, e.g. `https://www.dtechindia.com` (default: the deployment's own address) |
| `ALLOWED_ORIGINS` | no | Extra comma-separated site origins allowed to call the functions (their own origin is always allowed) |

**Google Workspace / Gmail:** `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, `SMTP_USER` = the full mailbox address, and `SMTP_PASS` = a 16-character [app password](https://myaccount.google.com/apppasswords) (the account needs 2-Step Verification on; Google rejects the normal password over SMTP). Gmail sends as `SMTP_USER`; a different `MAIL_FROM` address only works if it is added under Gmail → Settings → Accounts → "Send mail as". Workspace allows about 2,000 messages a day per mailbox.

Both functions only accept JSON posts from the site's own origin, have a hidden bot trap field, and rate-limit by IP (the PDF function also by recipient). These limits live in memory per instance; add a CAPTCHA (e.g. Cloudflare Turnstile) or a shared store before heavy public use.


## News page

Posts live in `content/news.json`. To publish an update, add an entry at the top of `posts` and push; the page reads the file in the browser, so no rebuild is needed.

```json
{
  "title": "Headline",
  "date": "2026-09-16",
  "category": "Case study",
  "summary": "One short paragraph.",
  "youtube": "VIDEO_ID",
  "link": "kiosk.html",
  "linkLabel": "See the Safety Kiosk"
}
```

`youtube` is the id after `watch?v=` and shows the video thumbnail; use `image` instead for a local picture. `link` and `linkLabel` are optional.

## Careers: live jobs and applications from Odoo

`careers.html` lists the jobs published in Odoo Recruitment and lets people apply on this site. Applications create a candidate (`hr.applicant`) in Odoo with the CV attached, exactly like applying on the Odoo careers site, so HR sees them in the same pipeline.

| Endpoint | What it does |
|---|---|
| `GET /api/jobs` | Roles being recruited from `hr.job` (active, with at least one expected employee), cached for 10 minutes. Falls back to the static list in the page if Odoo is unreachable. Does not need Odoo's website module, so the Odoo website can be switched off. |
| `POST /api/apply` | Creates `hr.applicant` and attaches the CV as an `ir.attachment` on that record. |

Set these in Vercel → Project → Settings → Environment Variables:

| Variable | Required | Purpose |
|---|---|---|
| `ODOO_URL` | yes | e.g. `https://d-tech-live-database.odoo.com` |
| `ODOO_DB` | yes | database name, e.g. `odoo-ps-psin-dtech-master-6996813` |
| `ODOO_USERNAME` | yes | login of the website user |
| `ODOO_API_KEY` | yes | API key for that user (Preferences → Account Security → New API Key) |
| `ODOO_JOB_DOMAIN` | no | JSON Odoo domain overriding which jobs are listed, e.g. `[["active","=",true]]` |

**Posting a job:** in Odoo open Recruitment → the job position → set Expected New Employees to 1 or more and keep it active ("Start Recruitment"). It appears on the careers page within 10 minutes. Stop recruitment or archive it to take it down.

Use a dedicated Odoo user with recruitment access only, never an administrator: the key can do anything that user can do. The key is read server-side and never reaches the browser.

Protections on `/api/apply`: same-origin JSON only, a hidden bot-trap field, 5 applications per hour per IP and 3 per day per email address, CVs limited to PDF or Word and 3 MB.

## Security headers

`vercel.json` sets a Content-Security-Policy, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, a referrer policy and a permissions policy for every page. If you add a new external script, font, image host or embed, allow its host in the CSP or the browser will block it.

The allowed case studies and their PDF files are listed in `api/_whitepapers.json`. Keep it in sync when adding a case study. The function only runs on Vercel (or `vercel dev`), not under `python3 -m http.server`.
