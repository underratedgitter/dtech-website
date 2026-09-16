# D-TECH Solution Integrators — Website

Static marketing site for D-TECH Solution Integrators Pvt. Ltd.: home, about, products, online shop, solutions, case studies, contact and legal pages.

Plain HTML, CSS and JavaScript with no build step. Styling comes from Tailwind (CDN) plus the layers in `assets/` (`skin.css`, `skin-dark.css`, `color.css`).

## Run locally

```sh
python3 -m http.server 8080
# open http://localhost:8080
```

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

## Security headers

`vercel.json` sets a Content-Security-Policy, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, a referrer policy and a permissions policy for every page. If you add a new external script, font, image host or embed, allow its host in the CSP or the browser will block it.

The allowed case studies and their PDF files are listed in `api/_whitepapers.json`. Keep it in sync when adding a case study. The function only runs on Vercel (or `vercel dev`), not under `python3 -m http.server`.
