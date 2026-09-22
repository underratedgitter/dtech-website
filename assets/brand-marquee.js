/* ─── Brand Marquee — auto-injected on every page ─── */
(function () {
  'use strict';

  /* ── CSS (injected once) ── */
  var style = document.createElement('style');
  style.textContent = [
    '@keyframes bm-scroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}',
    '.brand-marquee{position:relative;overflow:hidden;padding:20px 0;background:#fff;border-bottom:1px solid #e2e8f0}',
    '.brand-marquee::before,.brand-marquee::after{content:"";position:absolute;top:0;bottom:0;width:80px;z-index:2;pointer-events:none}',
    '.brand-marquee::before{left:0;background:linear-gradient(to right,#fff 0%,transparent 100%)}',
    '.brand-marquee::after{right:0;background:linear-gradient(to left,#fff 0%,transparent 100%)}',
    '.brand-marquee-track{display:flex;align-items:center;gap:48px;width:max-content;animation:bm-scroll 35s linear infinite}',
    '.brand-marquee:hover .brand-marquee-track{animation-play-state:paused}',
    '.brand-marquee-item{display:flex;align-items:center;gap:10px;padding:8px 20px;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0;white-space:nowrap;transition:transform .3s ease,border-color .3s ease,box-shadow .3s ease,background-color .3s ease;cursor:default;text-decoration:none}',
    '.brand-marquee-item:hover{background:#f1f5f9;border-color:#cbd5e1;transform:translateY(-2px);box-shadow:0 4px 12px -3px rgba(0,0,0,.08)}',
    '.brand-marquee-item .bm-icon{width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0}',
    '.brand-marquee-item .bm-name{font-size:13px;font-weight:700;color:#1e293b;letter-spacing:-.01em}',
    '.brand-marquee-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;white-space:nowrap;padding:0 12px;flex-shrink:0}',
    '[data-theme="dark"] .brand-marquee{background:#0f172a;border-color:#1e293b}',
    '[data-theme="dark"] .brand-marquee::before{background:linear-gradient(to right,#0f172a 0%,transparent 100%)}',
    '[data-theme="dark"] .brand-marquee::after{background:linear-gradient(to left,#0f172a 0%,transparent 100%)}',
    '[data-theme="dark"] .brand-marquee-item{background:#1e293b;border-color:#334155}',
    '[data-theme="dark"] .brand-marquee-item:hover{background:#0f172a;border-color:#475569}',
    '[data-theme="dark"] .brand-marquee-item .bm-name{color:#e2e8f0}',
    '[data-theme="dark"] .brand-marquee-label{color:#64748b}'
  ].join('\n');
  document.head.appendChild(style);

  /* ── Brand data ── */
  var brands = [
    { name: 'HP',                  link: 'about.html#partner-hp',       grad: '#0096d6,#0073a8', icon: '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>' },
    { name: 'Dell Technologies',   link: 'about.html#partner-dell',     grad: '#007db8,#005f8d', icon: '<rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>' },
    { name: 'Siemens',             link: null,                          grad: '#009999,#006666', icon: '<path d="M12 2 2 7l10 5 10-5-10-5Z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>' },
    { name: 'Motorola Solutions',  link: 'about.html#partner-motorola', grad: '#1a1a2e,#2d2d44', icon: '<path d="M5.5 8.5 9 12l-3.5 3.5L2 12l3.5-3.5Z"/><path d="m12 2 3.5 3.5L12 9 8.5 5.5 12 2Z"/><path d="M18.5 8.5 22 12l-3.5 3.5L15 12l3.5-3.5Z"/><path d="m12 15 3.5 3.5L12 22l-3.5-3.5L12 15Z"/>' },
    { name: 'Microsoft',           link: null,                          grad: '#0078d4,#005a9e', icon: '<rect x="3" y="3" width="8" height="8"/><rect x="13" y="3" width="8" height="8"/><rect x="3" y="13" width="8" height="8"/><rect x="13" y="13" width="8" height="8"/>' },
    { name: 'Hikvision',           link: null,                          grad: '#e4002b,#b8001f', icon: '<path d="M14.5 4h-5L7 7H2v13h20V7h-5l-2.5-3Z"/><circle cx="12" cy="14" r="4"/>' },
    { name: 'Matrix',              link: null,                          grad: '#22c55e,#16a34a', icon: '<rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>' },
    { name: 'Intel',               link: null,                          grad: '#0071c5,#004f8a', icon: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>' },
    { name: 'Cisco',               link: null,                          grad: '#049fd9,#037baa', icon: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>' },
    { name: 'Lenovo',              link: null,                          grad: '#e2231a,#b81c15', icon: '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>' },
    { name: 'Molex',               link: null,                          grad: '#f59e0b,#d97706', icon: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>' }
  ];

  function makeSvg(iconPath) {
    return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' + iconPath + '</svg>';
  }

  function buildItem(b) {
    var tag = b.link ? 'a' : 'div';
    var href = b.link ? ' href="' + b.link + '"' : '';
    return '<' + tag + href + ' class="brand-marquee-item">' +
      '<span class="bm-icon" style="background:linear-gradient(135deg,' + b.grad + ')">' + makeSvg(b.icon) + '</span>' +
      '<span class="bm-name">' + b.name + '</span>' +
      '</' + tag + '>';
  }

  function buildSet() {
    var html = '<span class="brand-marquee-label">Trusted By Industry Leaders</span>';
    for (var i = 0; i < brands.length; i++) html += buildItem(brands[i]);
    return html;
  }

  /* ── Inject into DOM ── */
  function inject() {
    // Skip if already present (e.g. index.html has inline version)
    if (document.querySelector('.brand-marquee')) return;

    var section = document.createElement('section');
    section.className = 'brand-marquee';
    section.setAttribute('aria-label', 'Technology Partners');

    var track = document.createElement('div');
    track.className = 'brand-marquee-track';
    // Two copies for seamless loop
    track.innerHTML = buildSet() + buildSet();
    section.appendChild(track);

    // Insert just before the footer
    var footer = document.querySelector('footer');
    if (footer && footer.parentNode) {
      footer.parentNode.insertBefore(section, footer);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
