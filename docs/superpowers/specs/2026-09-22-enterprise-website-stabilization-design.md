# D-TECH Enterprise Website Stabilization Design

Date: 2026-09-22  
Status: Approved direction; implementation pending plan review

## Objective

Make the D-TECH website credible in enterprise sales conversations worth
approximately ₹2–3 crore without changing its business content, URLs, lead
flows, or integrations. The result must feel like an established industrial
systems integrator: precise, restrained, technically competent, and easy to
trust on desktop, tablet, and mobile.

## Audience and Success Criteria

The primary audience is plant leadership, procurement, IT and OT heads,
engineering teams, safety teams, and OEM representatives evaluating D-TECH for
high-value projects.

The work succeeds when:

- Staff and project imagery remains controlled and proportionate at every
  breakpoint.
- The home page communicates D-TECH's value immediately instead of presenting
  empty or unstable regions.
- About, leadership, organization, and partner sections form a clear narrative.
- Deep links such as `about.html#partners` and individual partner anchors land
  below the sticky header without layout shifts.
- Navigation, theme switching, mobile drawers, forms, galleries, and existing
  integrations retain their behavior.
- Light and dark themes use one coherent D-TECH visual system.
- Every UI color comes from the approved D-TECH palette. Unmodified official
  partner logos are the only brand-color exception.
- Automated link, asset, syntax, build, and responsive visual checks pass.

## Confirmed Root Causes

1. Recent About-page HTML introduced Tailwind utilities that are absent from
   the generated stylesheet. Missing utilities include the responsive
   three-column leadership layout and image aspect-ratio controls. The browser
   consequently renders staff cards as full-width rows with oversized images.
2. Generated CSS predates the latest HTML changes, so the source and committed
   build artifacts have drifted apart.
3. The service worker uses a static cache version. A corrected stylesheet can
   remain hidden behind a previously cached bundle unless the cache version is
   advanced.
4. Recent About and marquee additions contain duplicated inline CSS, generic
   blues, purples, and pinks outside the established D-TECH palette.
5. Several recent components use `transition: all` or continuous motion without
   a component-level reduced-motion fallback.
6. The universal partner marquee duplicates the home-page implementation and
   spreads component styling through JavaScript rather than the design system.

## Design Direction

The visual concept is an industrial control document: a disciplined navy
framework, pale technical surfaces, cyan as the primary signal, and green,
orange, or red only when they communicate status or category. The system map on
the home page remains the most expressive element. Other sections become
quieter so content and proof carry the pitch.

### Color Tokens

- Deep navy: `#071d34` — headers, dark panels, footer, high-authority regions.
- Panel navy: `#0b2f52` — nested dark surfaces and diagrams.
- Signal cyan: `#27b6da` — active states, rules, icons, and highlights.
- Accessible cyan: `#0075ae` / `#008ccf` — links and filled actions.
- Compliance green: `#2cb67d` — confirmation and positive proof.
- Attention orange: `#ff7a1a` — safety and operational emphasis.
- Exception red: `#ef3d2f` — warning or critical status only.
- Paper and wash: `#ffffff`, `#f7fafc`, `#ecf4fa`, and their existing dark-theme
  equivalents.

Purple, pink, unrelated Tailwind blues, and decorative multicolor gradients are
excluded from interface styling.

### Typography

- Inter remains the display and text family for continuity and reliable local
  loading.
- IBM Plex Mono remains limited to figures, compact technical labels, and
  identifiers.
- Headings use restrained weight and balanced wrapping. Body copy stays within
  readable line lengths.
- Existing business facts and claims are preserved; only minor casing and
  punctuation corrections are permitted.

### Layout

Desktop About-page sequence:

```text
[Page introduction]
[Company story / presentation]
[Principles and proof]

[Director portrait  2/5] [Director narrative  3/5]
[Department head] [Department head] [Department head]
[Compact responsive organization chart]

[Partner introduction and trust evidence]
[HP partner]             [Dell Technologies partner]
[Synobiz partner]        [Motorola Solutions partner]
[Extended alliance rail]
[Enterprise contact action]
```

The department grid becomes two columns on medium screens and one column on
small screens. Portraits use a controlled aspect ratio and object positioning;
no image may expand to the width of the entire content area at desktop or
tablet sizes.

The partner area uses the same container width, shape tokens, spacing rhythm,
and palette as the rest of the site. Authentic vendor logos sit on quiet neutral
logo plates with sufficient clear space.

## Component Changes

### Generated CSS Pipeline

- Regenerate Tailwind from every current HTML and JavaScript class reference.
- Rebuild minified source files and the committed bundle.
- Add a regression check that fails when critical responsive utilities used by
  the leadership and partner sections are absent from the generated bundle.
- Keep generated artifacts committed, matching the repository's current
  deployment model.

### Leadership and Organization

- Preserve all people, roles, photographs, and organization data.
- Enforce explicit card and image geometry in the authored design layer so a
  missing utility build cannot recreate the oversized-photo failure.
- Keep the director visually primary and the department heads compact.
- Retain expandable organization branches, with clear keyboard focus and
  responsive connectors that simplify to a vertical hierarchy on small
  screens.
- Remap every department accent to cyan, green, orange, or red.

### Technology Partners

- Keep official HP, Dell Technologies, Synobiz, and Motorola assets unmodified.
- Do not recolor, crop, animate, outline, or distort partner logos.
- Keep partnership descriptions factual and avoid implying exclusivity.
- Remove decorative purple effects and excessive floating background motion.
- Retain direct contact actions, partner anchors, and case-study navigation.

### Brand Marquee

- Use one shared implementation and one shared CSS source.
- Treat it as supporting proof, not the dominant page feature.
- Pause on hover and keyboard focus and provide a visible pause control when
  motion continues beyond five seconds.
- Stop animation under `prefers-reduced-motion` while leaving every brand
  readable.
- Preserve links only for partners with valid destination sections.

### Navigation and Anchors

- Preserve all current desktop and mobile destinations.
- Keep dropdowns native and keyboard operable.
- Prevent open menus from obscuring anchored headings or focused content.
- Set consistent scroll padding and scroll margin from the actual sticky-header
  height.
- Maintain visible current-page and focus states.

### Theme and Cache

- Preserve saved theme preference and the current OS-theme fallback.
- Validate contrast and logo treatment in both themes.
- Advance the service-worker cache version with the rebuilt bundle so returning
  visitors receive the correction.

## Accessibility and Motion

- Preserve skip links, semantic landmarks, labels, alternative text, and
  existing focus management.
- Replace `transition: all` with explicit properties.
- Restrict passive motion to the home-page systems diagram and the optional
  partner rail.
- Disable or simplify all passive animation for reduced-motion users.
- Make focus states visible on every interactive control.
- Keep images dimensioned to prevent cumulative layout shift.

## Testing Strategy

Implementation uses regression-first checks:

1. Add a test that detects the missing leadership utilities in the current
   bundle and confirm it fails before rebuilding.
2. Add structural checks for palette leakage, prohibited `transition: all`,
   reduced-motion coverage, and service-worker cache advancement.
3. Rebuild and run the repository's full verification command.
4. Capture and inspect home and About pages in light and dark themes at desktop
   (1440 px), tablet (1024 px), and mobile (390 px) widths.
5. Exercise the desktop partner menu, mobile drawer, About slider,
   organization disclosure controls, partner anchors, and theme toggle by
   keyboard and pointer.
6. Run link, anchor, asset, HTML image-attribute, JavaScript syntax, and build
   checks.

## Implementation Boundaries

The repair will not:

- Rewrite business content or unsupported partnership claims.
- Replace official partner logos with generated approximations.
- Change form endpoints, Odoo integration, Resend integration, analytics, or
  deployment architecture.
- Rename or remove public pages, anchors, or routes.
- Introduce a new framework or runtime dependency.
- Redesign unrelated product and case-study pages unless a shared CSS fix is
  needed to prevent a confirmed regression.

## Risk Controls

- Work from the current clean `main` state and review every changed file.
- Keep source and generated files synchronized in the same change.
- Prefer shared tokens and component selectors over broad positional selectors.
- Verify both themes and all target widths before completion.
- Treat original partner logos as licensed assets whose display remains subject
  to D-TECH's partner agreements and current partner-brand guidelines.
