# D-TECH Enterprise Website Stabilization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stabilize and polish the D-TECH marketing site for high-value enterprise pitches while preserving every existing route, lead flow, integration, and factual claim.

**Architecture:** Keep the static HTML/CSS/JavaScript architecture and make its build deterministic. Add a repository-level UI contract checker, consolidate the recent About and marquee styling into the existing tokenized design layer, rebuild all generated assets, and advance the offline cache so browsers receive the corrected bundle.

**Tech Stack:** Static HTML5, CSS custom properties, Tailwind CSS 3.4.17 build output, vanilla JavaScript, Python 3 validation scripts, npm build tooling, headless Chrome for visual inspection.

**Spec:** `docs/superpowers/specs/2026-09-22-enterprise-website-stabilization-design.md`

## Global Constraints

- Preserve all existing public page names, anchors, routes, form endpoints, Odoo integration, Resend integration, analytics, and deployment architecture.
- Keep Inter for display/body copy and IBM Plex Mono only for figures, identifiers, and compact technical labels.
- Interface colors are limited to `#071d34`, `#0b2f52`, `#27b6da`, `#0075ae`, `#008ccf`, `#2cb67d`, `#ff7a1a`, `#ef3d2f`, white, pale-blue surfaces, and their existing dark-theme equivalents.
- Official partner logo artwork keeps its original colors and must not be recolored, cropped, animated, distorted, outlined, or recreated.
- Do not add a frontend framework or runtime dependency.
- Source files and committed generated files must change together.
- Both themes must work at 1440 px, 1024 px, and 390 px viewport widths.

## Review Focus

- A 1024 px viewport must show the department heads in a compact multi-column layout; no portrait may expand to the full content width.
- Direct navigation to `about.html#partners` and each `#partner-*` anchor must leave the target visible below the sticky header after images load.
- A returning browser with the prior service worker must replace its cached stylesheet after deployment.
- The partner marquee must remain readable and controllable when reduced motion is enabled or the user pauses it.
- Partner logos must retain correct proportions and clear space in light and dark themes without inheriting D-TECH recoloring filters.

---

### Task 1: Deterministic CSS Build and Build-Drift Regression

**Files:**
- Create: `tools/check-ui-contract.py`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `README.md`
- Regenerate: `assets/tailwind.css`
- Regenerate: `assets/tailwind.min.css`
- Regenerate: `assets/bundle.min.css`

**Interfaces:**
- Consumes: Tailwind class references in `*.html` and `assets/**/*.js`.
- Produces: `npm run build:tailwind` and `python3 tools/check-ui-contract.py`, both used by later tasks and `npm run verify`.

- [ ] **Step 1: Write the failing UI contract checker**

Create `tools/check-ui-contract.py` with a compiled-output assertion that catches the exact regression visible in the screenshots:

```python
#!/usr/bin/env python3
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]


def check_compiled_responsive_contract(problems):
    css = (ROOT / "assets/bundle.min.css").read_text(encoding="utf-8")
    required = {
        r".sm\:grid-cols-3": "tablet leadership columns",
        ".aspect-square": "stable portrait geometry",
        r".sm\:py-32": "partner section responsive spacing",
    }
    for selector, behavior in required.items():
        if selector not in css:
            problems.append(f"bundle missing {selector} ({behavior})")


def main():
    problems = []
    check_compiled_responsive_contract(problems)
    if problems:
        print(f"{len(problems)} UI contract problem(s):")
        for problem in problems:
            print(f"  {problem}")
        return 1
    print("OK: UI contracts pass.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

- [ ] **Step 2: Run the checker and verify the intended failure**

Run: `python3 tools/check-ui-contract.py`

Expected: FAIL naming at least `.sm\:grid-cols-3` and `.aspect-square` as missing from `assets/bundle.min.css`.

- [ ] **Step 3: Make Tailwind a deterministic build dependency**

Run: `npm install --save-dev --save-exact tailwindcss@3.4.17`

Add these scripts to `package.json`, and make the existing CSS build start from current source markup:

```json
"build:tailwind": "tailwindcss -c tools/tailwind/tailwind.config.js -i tools/tailwind/input.css -o assets/tailwind.css --minify",
"build:css": "npm run build:tailwind && for f in assets/skin.css assets/tailwind.css assets/polish.css assets/jiva.css assets/color.css assets/skin-dark.css assets/prezi.css assets/fonts.css; do npx -y clean-css-cli -o \"${f%.css}.min.css\" \"$f\"; done && for f in assets/skin.min.css assets/color.min.css assets/polish.min.css assets/tailwind.min.css; do cat \"$f\"; echo; done > assets/bundle.min.css && npx -y purgecss --config purgecss.config.js && cp /tmp/purged/bundle.min.css assets/bundle.min.css",
"check:ui": "python3 tools/check-ui-contract.py",
"verify": "npm ci && npm run build && npm run check:links && npm run check:ui && node --check sw.js && node --check assets/agent-a.min.js && node --check assets/brand-marquee.js && echo VERIFY-OK"
```

Update the README rebuild command to `npm run build:tailwind` and state that `npm run build:css` always regenerates Tailwind before minification.

- [ ] **Step 4: Rebuild and verify the compiled responsive contract passes**

Run: `npm run build:css && python3 tools/check-ui-contract.py`

Expected: `OK: UI contracts pass.`

- [ ] **Step 5: Run link and syntax checks**

Run: `python3 tools/check-links.py && node --check assets/brand-marquee.js`

Expected: link checker reports `OK` and Node exits 0.

- [ ] **Step 6: Commit the build-pipeline repair**

```bash
git add package.json package-lock.json README.md tools/check-ui-contract.py assets/tailwind.css assets/tailwind.min.css assets/bundle.min.css
git commit -m "fix: keep responsive CSS in sync with markup"
```

### Task 2: Leadership and Organization Layout Stabilization

**Files:**
- Modify: `tools/check-ui-contract.py`
- Modify: `about.html`
- Modify: `assets/skin.css`
- Regenerate: `assets/skin.min.css`
- Regenerate: `assets/tailwind.css`
- Regenerate: `assets/tailwind.min.css`
- Regenerate: `assets/bundle.min.css`

**Interfaces:**
- Consumes: the deterministic CSS commands created in Task 1 and the existing About-page people and organization content.
- Produces: `.leadership-spotlight`, `.leadership-team-grid`, `.leadership-card`, `.leadership-photo`, and tokenized `.org-*` component contracts.

- [ ] **Step 1: Extend the checker with leadership behavior contracts**

Add this function and call it from `main()`:

```python
def check_leadership_contract(problems):
    html = (ROOT / "about.html").read_text(encoding="utf-8")
    css = (ROOT / "assets/skin.css").read_text(encoding="utf-8")
    for class_name in (
        "leadership-spotlight",
        "leadership-team-grid",
        "leadership-card",
        "leadership-photo",
    ):
        if f'class="{class_name}' not in html and f" {class_name}" not in html:
            problems.append(f"About leadership missing .{class_name}")
        if f".{class_name}" not in css:
            problems.append(f"skin.css missing .{class_name}")
    if "--anchor-offset:104px" not in css.replace(" ", ""):
        problems.append("skin.css does not define the sticky-header anchor offset")
```

This catches removal of the authored geometry even if the utility build drifts again.

- [ ] **Step 2: Run the checker and verify the intended failure**

Run: `python3 tools/check-ui-contract.py`

Expected: FAIL naming all four missing leadership component contracts.

- [ ] **Step 3: Add stable semantic classes to the existing leadership markup**

Keep all names, roles, photos, and copy. Make these exact opening-tag
replacements in `about.html`; the existing child content remains in place:

```diff
- <div class="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch mb-12">
+ <div class="leadership-spotlight grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch mb-12">
- <div class="lg:col-span-2 overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm">
+ <div class="leadership-photo-frame">
- <img src="assets/team/bhaavik-barot.webp" alt="Bhaavik Barot, Director of D-TECH" width="900" height="900" loading="lazy" class="w-full h-full object-cover aspect-square">
+ <img src="assets/team/bhaavik-barot.webp" alt="Bhaavik Barot, Director of D-TECH" width="900" height="900" loading="lazy" class="leadership-photo w-full h-full object-cover aspect-square">
- <div class="lg:col-span-3 p-8 sm:p-10 rounded-2xl bg-slate-900 text-white flex flex-col justify-center space-y-4">
+ <div class="leadership-director-copy">
- <div class="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
+ <div class="leadership-team-grid grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
- <div class="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
+ <article class="leadership-card">
```

Apply the `leadership-card` article replacement to all three department-head
cards, change their matching closing `</div>` tags to `</article>`, and prepend
`leadership-photo` to each department-head image's existing utility classes.

Use `<article>` for each person because each card is independently meaningful. Preserve each image's existing `alt`, `width`, `height`, and `loading` attributes.

- [ ] **Step 4: Implement explicit responsive geometry in `assets/skin.css`**

Add the following authored layer after the shared plate rules:

```css
.leadership-spotlight {
  display:grid;
  grid-template-columns:minmax(260px,2fr) minmax(0,3fr);
  gap:32px;
  align-items:stretch;
  margin-bottom:40px;
}
.leadership-photo-frame,.leadership-card {
  overflow:hidden;
  border:1px solid var(--line);
  border-radius:var(--r-panel);
  background:var(--surface);
}
.leadership-photo {
  display:block;
  width:100%;
  aspect-ratio:4/3;
  object-fit:cover;
}
.leadership-photo-frame .leadership-photo { height:100%; aspect-ratio:auto; }
.leadership-director-copy {
  display:flex;
  flex-direction:column;
  justify-content:center;
  gap:16px;
  padding:clamp(28px,4vw,48px);
  border-radius:var(--r-panel);
  background:var(--invert);
  color:var(--on-invert);
}
.leadership-team-grid {
  display:grid;
  grid-template-columns:repeat(3,minmax(0,1fr));
  gap:24px;
  margin-bottom:40px;
}
.leadership-card>div { padding:20px; }
@media (max-width:1023px) {
  .leadership-team-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .leadership-card:last-child { grid-column:1/-1; max-width:calc(50% - 12px); }
}
@media (max-width:700px) {
  .leadership-spotlight,.leadership-team-grid { grid-template-columns:1fr; }
  .leadership-photo-frame .leadership-photo { aspect-ratio:4/3; height:auto; }
  .leadership-card:last-child { grid-column:auto; max-width:none; }
}
```

Keep anchors aligned with the real sticky chrome through one token rather than
independent magic numbers:

```css
:root { --anchor-offset:104px; }
html { scroll-padding-top:var(--anchor-offset); }
main [id],section[id] { scroll-margin-top:var(--anchor-offset); }
```

Move the embedded organization-chart CSS from `about.html` into the same authored layer. Replace its green/orange/purple/pink department scheme with this four-accent mapping:

```css
.dept-sales { --dept-accent:var(--signal); --dept-wash:var(--c-cyan-wash); }
.dept-hr { --dept-accent:var(--c-green); --dept-wash:var(--c-green-wash); }
.dept-accounts { --dept-accent:var(--c-orange); --dept-wash:var(--c-orange-wash); }
.dept-software { --dept-accent:var(--c-red); --dept-wash:var(--c-red-wash); }
.org-dept-head { background:var(--dept-wash); border-color:var(--dept-accent); }
.org-dept-head .dept-icon { background:var(--dept-accent); }
```

Replace every organization `transition: all` with explicit `transform`, `box-shadow`, `background-color`, `border-color`, and `color` properties.

- [ ] **Step 5: Rebuild and verify the leadership contract passes**

Run: `npm run build:css && python3 tools/check-ui-contract.py`

Expected: `OK: UI contracts pass.`

- [ ] **Step 6: Commit the layout stabilization**

```bash
git add about.html assets/skin.css assets/skin.min.css assets/tailwind.css assets/tailwind.min.css assets/bundle.min.css tools/check-ui-contract.py
git commit -m "fix: constrain leadership and organization layouts"
```

### Task 3: Tokenize and Restrain the Partner Presentation

**Files:**
- Modify: `tools/check-ui-contract.py`
- Modify: `about.html`
- Modify: `assets/skin.css`
- Modify: `assets/skin-dark.css`
- Regenerate: `assets/skin.min.css`
- Regenerate: `assets/skin-dark.min.css`
- Regenerate: `assets/tailwind.css`
- Regenerate: `assets/tailwind.min.css`
- Regenerate: `assets/bundle.min.css`

**Interfaces:**
- Consumes: existing partner anchors, official logo files, contact destinations, and D-TECH tokens.
- Produces: `.partner-section`, `.partner-card`, `.partner-logo-box`, `.partner-highlight`, `.partner-cta`, and `.alliance-strip` with no non-palette UI colors.

- [ ] **Step 1: Add palette and transition policy checks**

Add the following to `tools/check-ui-contract.py` and call it from `main()`:

```python
def check_authored_style_policy(problems):
    paths = [
        ROOT / "about.html",
        ROOT / "index.html",
        ROOT / "assets/brand-marquee.js",
        ROOT / "assets/skin.css",
    ]
    forbidden_colors = ("#8b5cf6", "#6366f1", "#ec4899", "#db2777", "#f9a8d4")
    for path in paths:
        source = path.read_text(encoding="utf-8").lower()
        if "transition: all" in source or "transition:all" in source:
            problems.append(f"{path.relative_to(ROOT)} uses transition: all")
        for color in forbidden_colors:
            if color in source:
                problems.append(f"{path.relative_to(ROOT)} uses non-palette color {color}")
```

- [ ] **Step 2: Run the checker and verify the intended failure**

Run: `python3 tools/check-ui-contract.py`

Expected: FAIL naming the current purple/pink declarations and `transition: all` occurrences.

- [ ] **Step 3: Move partner component CSS out of `about.html`**

Delete the inline partner `<style>` block. Add a `.partner-section` class to the section and remove the inline background declaration and decorative floating-element markup. Preserve `id="partners"` and all `id="partner-*"` anchors.

Move the useful card rules into `assets/skin.css` using only variables:

```css
.partner-section {
  position:relative;
  overflow:hidden;
  background:var(--invert);
  color:var(--on-invert);
}
.partner-section::before {
  content:"";
  position:absolute;
  inset:0;
  pointer-events:none;
  background-image:radial-gradient(var(--grid-line) 1px,transparent 1px);
  background-size:40px 40px;
}
.partner-card {
  position:relative;
  overflow:hidden;
  border:1px solid var(--line);
  border-radius:var(--r-panel);
  background:var(--surface);
  transition:transform .2s var(--ease),border-color .2s ease,box-shadow .2s ease;
}
.partner-card:hover,.partner-card:focus-within {
  transform:translateY(-2px);
  border-color:var(--signal);
  box-shadow:0 18px 40px -24px rgba(7,29,52,.5);
}
.partner-logo-box { background:var(--sunken); border:1px solid var(--line); }
.partner-highlight { background:var(--c-cyan-wash); border:1px solid var(--signal); color:var(--signal-deep); }
.partner-cta { background:var(--signal-deep); color:#fff; }
.partner-cta:hover { background:var(--invert); }
.alliance-strip { border:1px solid var(--line); background:var(--surface); }
.alliance-brand { border:1px solid var(--line); background:var(--well); color:var(--ink-soft); }
```

Map HP, Dell, Synobiz, and Motorola card accents to D-TECH cyan, green, orange, and red rather than vendor-derived UI colors. Leave the logo SVG files and rendered logo colors untouched.

- [ ] **Step 4: Keep partner logos unfiltered in both themes**

Add a narrow exception to `assets/skin-dark.css`:

```css
.partner-logo-box img,.brand-marquee img {
  filter:none!important;
}
```

Do not apply a filter, blend mode, CSS gradient, or animation directly to any partner logo.

- [ ] **Step 5: Rebuild and verify policy checks pass**

Run: `npm run build:css && python3 tools/check-ui-contract.py && python3 tools/check-links.py`

Expected: both checkers report `OK`.

- [ ] **Step 6: Commit the partner presentation**

```bash
git add about.html assets/skin.css assets/skin-dark.css assets/skin.min.css assets/skin-dark.min.css assets/tailwind.css assets/tailwind.min.css assets/bundle.min.css tools/check-ui-contract.py
git commit -m "refactor: align partner presentation with D-TECH palette"
```

### Task 4: One Accessible Brand Marquee

**Files:**
- Modify: `tools/check-ui-contract.py`
- Modify: `index.html`
- Modify: `assets/brand-marquee.js`
- Modify: `assets/skin.css`
- Regenerate: `assets/skin.min.css`
- Regenerate: `assets/bundle.min.css`

**Interfaces:**
- Consumes: the existing partner data and partner anchors.
- Produces: one `.brand-marquee` per page, a `.brand-marquee-toggle` button, `.is-paused` state, and reduced-motion behavior.

- [ ] **Step 1: Add the shared-marquee contract check**

Add this function and call it from `main()`:

```python
def check_marquee_contract(problems):
    home = (ROOT / "index.html").read_text(encoding="utf-8")
    script = (ROOT / "assets/brand-marquee.js").read_text(encoding="utf-8")
    skin = (ROOT / "assets/skin.css").read_text(encoding="utf-8")
    if 'src="assets/brand-marquee.js"' not in home:
        problems.append("index.html does not use shared brand marquee")
    if '<section class="brand-marquee"' in home:
        problems.append("index.html still duplicates marquee markup")
    if "brand-marquee-toggle" not in script:
        problems.append("brand marquee has no pause control")
    if "makeSvg" in script:
        problems.append("brand marquee still draws synthetic partner marks")
    for logo in (
        "assets/partners/hp.svg",
        "assets/partners/dell-technologies.svg",
        "assets/partners/motorola-solutions.svg",
    ):
        if logo not in script:
            problems.append(f"brand marquee missing official logo asset {logo}")
    if ".brand-marquee-toggle" not in skin:
        problems.append("brand marquee pause control has no authored styling")
    if "prefers-reduced-motion:reduce" not in skin.replace(" ", ""):
        problems.append("skin.css lacks reduced-motion coverage")
```

- [ ] **Step 2: Run the checker and verify the intended failure**

Run: `python3 tools/check-ui-contract.py`

Expected: FAIL for the missing shared script on home, duplicated home markup, and missing pause-control contract.

- [ ] **Step 3: Replace the home-only duplicate with the shared script**

Remove the inline marquee `<style>` and `<section>` from `index.html`. Add this script beside the existing deferred scripts:

```html
<script src="assets/brand-marquee.js" defer></script>
```

Update `assets/brand-marquee.js` so `inject()` places the component after the home metric section and before the footer on other pages:

```javascript
var homeMetric = document.body && document.body.getAttribute('data-page') === 'home'
  ? document.querySelector('.home-hero + section')
  : null;
if (homeMetric && homeMetric.parentNode) {
  homeMetric.parentNode.insertBefore(section, homeMetric.nextSibling);
} else if (footer && footer.parentNode) {
  footer.parentNode.insertBefore(section, footer);
}
```

Build a real button inside the section:

```javascript
var toggle = document.createElement('button');
toggle.type = 'button';
toggle.className = 'brand-marquee-toggle';
toggle.setAttribute('aria-pressed', 'false');
toggle.textContent = 'Pause partner logos';
toggle.addEventListener('click', function () {
  var paused = section.classList.toggle('is-paused');
  toggle.setAttribute('aria-pressed', paused ? 'true' : 'false');
  toggle.textContent = paused ? 'Play partner logos' : 'Pause partner logos';
});
section.appendChild(toggle);
```

Remove injected CSS creation from JavaScript so markup behavior and visual styling have separate owners.

Replace the synthetic icon-path and gradient fields in the brand data with
official image paths for the 3 logo files held in the repository:

```javascript
{ name:'HP', link:'about.html#partner-hp', logo:'assets/partners/hp.svg', width:100, height:100 },
{ name:'Dell Technologies', link:'about.html#partner-dell', logo:'assets/partners/dell-technologies.svg', width:72, height:9 },
{ name:'Motorola Solutions', link:'about.html#partner-motorola', logo:'assets/partners/motorola-solutions.svg', width:634, height:73 }
```

Render brands without an approved logo asset as a text-only `.bm-name`; do not
approximate their marks with generic icons or letter badges. Render approved
logos with explicit intrinsic dimensions and an empty `alt` because the
adjacent `.bm-name` already provides the accessible name:

```javascript
var logo = b.logo
  ? '<img src="' + b.logo + '" alt="" width="' + b.width + '" height="' + b.height + '" loading="lazy">'
  : '';
return '<' + tag + href + ' class="brand-marquee-item">' + logo +
  '<span class="bm-name">' + b.name + '</span></' + tag + '>';
```

- [ ] **Step 4: Add tokenized marquee CSS with reduced-motion behavior**

Move the shared marquee rules to `assets/skin.css`. Use explicit transitions, `:focus-within` pause, and reduced motion:

```css
.brand-marquee-track { animation:brand-marquee-scroll 42s linear infinite; }
.brand-marquee:hover .brand-marquee-track,
.brand-marquee:focus-within .brand-marquee-track,
.brand-marquee.is-paused .brand-marquee-track { animation-play-state:paused; }
.brand-marquee-toggle {
  position:absolute;
  right:16px;
  top:50%;
  z-index:3;
  transform:translateY(-50%);
  padding:8px 10px;
  border:1px solid var(--line-strong);
  border-radius:var(--r-control);
  background:var(--surface);
  color:var(--ink-soft);
  font:700 10px/1 var(--label);
}
@media (prefers-reduced-motion:reduce) {
  .brand-marquee-track { animation:none; transform:none; }
  .brand-marquee-toggle { display:none; }
}
```

Ensure `.brand-marquee-item` uses `transition:transform`, `background-color`, `border-color`, and `box-shadow` rather than `transition: all`.

- [ ] **Step 5: Rebuild and verify one shared implementation**

Run: `npm run build:css && python3 tools/check-ui-contract.py && node --check assets/brand-marquee.js`

Expected: UI checker reports `OK`; Node exits 0.

- [ ] **Step 6: Commit the shared marquee**

```bash
git add index.html assets/brand-marquee.js assets/skin.css assets/skin.min.css assets/bundle.min.css tools/check-ui-contract.py
git commit -m "fix: make partner marquee shared and accessible"
```

### Task 5: Cache Advancement and Full Pitch-Readiness Verification

**Files:**
- Modify: `tools/check-ui-contract.py`
- Modify: `sw.js`
- Regenerate: all files produced by `npm run build`
- Verify without committing: `/tmp/dtech-visual-audit/*.png`

**Interfaces:**
- Consumes: completed Tasks 1–4.
- Produces: service-worker cache `dtech-v3`, a passing full verification suite, and reviewed responsive screenshots.

- [ ] **Step 1: Add the cache-upgrade contract check**

Add this function and call it from `main()`:

```python
def check_cache_contract(problems):
    worker = (ROOT / "sw.js").read_text(encoding="utf-8")
    if "var VERSION = 'dtech-v3';" not in worker:
        problems.append("service worker cache was not advanced to dtech-v3")
    for asset in ("/assets/bundle.min.css", "/assets/dtech-logo.webp"):
        if asset not in worker:
            problems.append(f"service worker core cache missing {asset}")
```

- [ ] **Step 2: Run the checker and verify the intended failure**

Run: `python3 tools/check-ui-contract.py`

Expected: FAIL stating that the cache was not advanced to `dtech-v3`.

- [ ] **Step 3: Advance the cache and perform the clean production build**

Change only the version line in `sw.js`:

```javascript
var VERSION = 'dtech-v3';
```

Run: `npm run build`

Expected: CSS and JavaScript builds exit 0.

- [ ] **Step 4: Run the complete automated verification suite**

Run: `npm run verify`

Expected final line: `VERIFY-OK` with no preceding errors.

- [ ] **Step 5: Capture the required visual matrix**

Start the site from the repository root:

```bash
python3 -m http.server 8080
```

Capture `index.html`, `about.html#leadership`, and `about.html#partners` at 1440×1000, 1024×1366, and 390×844 in both themes. Store screenshots under `/tmp/dtech-visual-audit/`; do not add them to git.

For each capture, verify:

- no horizontal overflow or clipped navigation;
- the home hero has visible copy and system diagram;
- staff photos remain inside compact cards;
- organization branches are legible and aligned;
- partner targets are visible below the sticky header;
- official logos retain aspect ratio and original color;
- all text meets the intended light/dark contrast;
- the marquee pause control remains reachable and does not cover logos.

- [ ] **Step 6: Exercise interactions by keyboard and pointer**

Verify desktop Partner and Solutions menus, mobile drawer open/close and focus return, theme toggle, About presentation arrows, organization `<details>` controls, partner deep links, and marquee pause/play. Confirm Escape closes the mobile drawer and Tab never becomes trapped outside an open dialog.

- [ ] **Step 7: Inspect the final diff and rerun verification**

Run:

```bash
git diff --check
git status --short
npm run verify
```

Expected: no whitespace errors; only planned files are modified; final line is `VERIFY-OK`.

- [ ] **Step 8: Commit the cache and verification gate**

```bash
git add sw.js tools/check-ui-contract.py package.json package-lock.json README.md about.html index.html assets/brand-marquee.js assets/skin.css assets/skin-dark.css assets/skin.min.css assets/skin-dark.min.css assets/tailwind.css assets/tailwind.min.css assets/bundle.min.css assets/agent-a.min.js assets/refined.min.js assets/analytics.min.js assets/lucide.min.js
git commit -m "chore: verify pitch-ready website stabilization"
```

### Task 6: Final Requirements Audit

**Files:**
- Verify: `docs/superpowers/specs/2026-09-22-enterprise-website-stabilization-design.md`
- Verify: all files changed by Tasks 1–5

**Interfaces:**
- Consumes: the approved specification and completed implementation commits.
- Produces: a requirement-by-requirement completion report with command evidence.

- [ ] **Step 1: Re-read the specification and map every requirement to evidence**

Record the exact file or verification command proving each success criterion: layout stability, palette compliance, original-logo treatment, route preservation, anchor behavior, reduced motion, theme behavior, deterministic build, and cache advancement.

- [ ] **Step 2: Run the final proof commands fresh**

Run:

```bash
npm run verify
git diff --check HEAD~5..HEAD
git status --short
```

Expected: `VERIFY-OK`, no diff-check errors, and a clean worktree.

- [ ] **Step 3: Report verified results and any external legal dependency**

State the exact automated checks and viewport/theme matrix completed. Note that original partner-logo display still depends on D-TECH retaining current written partner authorization; do not describe that authorization as technically verified by the repository.
