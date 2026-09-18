# D-TECH Solution Integrators — Website

Static marketing site for D-TECH Solution Integrators Pvt. Ltd.: home, about, products, online shop, solutions, case studies, contact and legal pages.

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
| `assets/tailwind.css` | after adding or changing Tailwind classes in any page or script | `npx tailwindcss@3.4.17 -c tools/tailwind/tailwind.config.js -i tools/tailwind/input.css -o assets/tailwind.css --minify` |
| `assets/lucide.js` | after using a new `data-lucide` icon | `npm --prefix tools/lucide install && node tools/lucide/build.mjs` |
| `assets/og-image.png` | after editing `tools/og/og-image.html` | `node tools/og/render.mjs` (needs `puppeteer-core` and Chrome) |

## Analytics

`assets/analytics.js` loads Vercel Web Analytics (cookieless, same-origin) on every page except on localhost. Enable it in Vercel → Project → Analytics.

## Deploy on Vercel

1. Import this repository in Vercel.
2. Framework preset: **Other**. Leave the build command and output directory empty; the repository root is the site.
3. Deploy. `404.html` is served automatically for unknown paths.

## Case studies and PDF emails

Case-study PDFs live in `assets/case-studies/pdf/`. When a visitor asks for one, `case-studies.html` posts to the Vercel function `api/send-whitepaper.js`. The function emails the PDF to the visitor as an attachment and sends a lead notification to sales, using the [Resend](https://resend.com) email API.

Set these in Vercel → Project → Settings → Environment Variables, then redeploy:

| Variable | Required | Purpose |
|---|---|---|
| `RESEND_API_KEY` | yes | API key from resend.com |
| `MAIL_FROM` | no | Sender, e.g. `D-TECH <sales@dtechindia.com>`, once dtechindia.com is verified in Resend. Until then the default test sender only delivers to the Resend account owner's own email address. |
| `SALES_EMAIL` | no | Receives lead notifications and visitor replies (default `sales@dtechindia.com`) |
| `SITE_URL` | no | Public address used in email links, e.g. `https://www.dtechindia.com` (default: the deployment's own address) |
| `ALLOWED_ORIGINS` | no | Extra comma-separated site origins allowed to call the function (its own origin is always allowed) |

The function only accepts JSON posts from the site's own origin, has a hidden bot trap field, sanitises the name used in the greeting, and rate-limits by IP and by recipient. These limits live in memory per instance; add a CAPTCHA (e.g. Cloudflare Turnstile) or a shared store before heavy public use.


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
