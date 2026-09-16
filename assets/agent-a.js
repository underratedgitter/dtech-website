/* ==========================================================================
   D-TECH · Agent-A Motion Layer (Task #4)
   Presentational only: scroll reveal, header elevation, estimator slider
   fill. Touches nothing functional — no cart/shop/modal/form logic here.
   Loads with defer on all 7 pages, after assets/refined.js.
   ========================================================================== */
(function () {
  'use strict';

  function reducedMotion() {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) {
      return false;
    }
  }

  function paintSliderFill(el) {
    try {
      if (!el || el.type !== 'range') return;
      var min = parseFloat(el.min || '0');
      var max = parseFloat(el.max || '100');
      var val = parseFloat(el.value || '0');
      if (!isFinite(max - min) || max <= min) return;
      var pct = Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100));
      el.style.setProperty('--a-fill', pct.toFixed(1) + '%');
    } catch (e) {}
  }

  function initSliders() {
    try {
      var sliders = document.querySelectorAll('input[type="range"]');
      for (var i = 0; i < sliders.length; i++) {
        (function (el) {
          paintSliderFill(el);
          el.addEventListener('input', function () { paintSliderFill(el); });
        })(sliders[i]);
      }
    } catch (e) {}
  }

  function initHeader() {
    try {
      var header = document.querySelector('.site-header');
      if (!header || !('IntersectionObserver' in window)) return;
      // 1px sentinel parked at the scroll threshold: no scroll listeners,
      // no per-frame work. Shadow engages once it leaves the viewport.
      var sentinel = document.createElement('div');
      sentinel.setAttribute('aria-hidden', 'true');
      sentinel.style.cssText =
        'position:absolute;top:9px;left:0;width:1px;height:1px;' +
        'pointer-events:none;opacity:0;';
      document.body.insertBefore(sentinel, document.body.firstChild);
      var io = new IntersectionObserver(
        function (entries) {
          try {
            header.classList.toggle('is-scrolled', !entries[0].isIntersecting);
          } catch (e) {}
        },
        { threshold: 0 }
      );
      io.observe(sentinel);
    } catch (e) {}
  }

  function initReveal() {
    try {
      if (reducedMotion()) return;
      if (!('IntersectionObserver' in window)) return;
      var sections = document.querySelectorAll('main > section');
      if (!sections.length) return;
      var io = new IntersectionObserver(
        function (entries) {
          for (var i = 0; i < entries.length; i++) {
            var entry = entries[i];
            if (entry.isIntersecting) {
              entry.target.classList.add('a-in');
              io.unobserve(entry.target);
            }
          }
        },
        { threshold: 0.08, rootMargin: '0px 0px -6% 0px' }
      );
      for (var j = 0; j < sections.length; j++) {
        if (sections[j].classList.contains('home-hero')) continue;
        sections[j].classList.add('a-pre');
        io.observe(sections[j]);
      }
    } catch (e) {}
  }

  function init() {
    initTheme();
    initSliders();
    initHeader();
    initReveal();
    initMarquee();
  }

  /* Single allowed marquee (home partner rail). Cloned half is
     aria-hidden + unfocusable; originals untouched. */
  function initMarquee() {
    try {
      if (reducedMotion()) return;
      if (!document.body || document.body.getAttribute('data-page') !== 'home') return;
      var strip = document.querySelector('.partner-strip');
      if (!strip || strip.querySelector('.marquee-track')) return;
      var kids = Array.prototype.slice.call(strip.children);
      if (kids.length < 2) return;
      var track = document.createElement('div');
      track.className = 'marquee-track';
      kids.forEach(function (n) { track.appendChild(n); });
      kids.map(function (n) {
        var c = n.cloneNode(true);
        c.setAttribute('aria-hidden', 'true');
        return c;
      }).forEach(function (c) {
        var f = c.querySelectorAll('a, button');
        for (var i = 0; i < f.length; i++) { f[i].tabIndex = -1; }
        if (c.tagName === 'A' || c.tagName === 'BUTTON') c.tabIndex = -1;
        track.appendChild(c);
      });
      strip.appendChild(track);
      strip.classList.add('marquee-on');
    } catch (e) {}
  }

  /* Theme: stored pref wins, else OS, else dark. Sheet toggle only. */
  function readTheme() {
    try {
      var t = localStorage.getItem('dtech-theme');
      if (t === 'light' || t === 'dark') return t;
    } catch (e) {}
    // The design system is derived from a light document, so light is the
    // default voice; only an explicit OS dark preference opts into the dark chapter.
    try {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    } catch (e) {}
    return 'light';
  }

  function paintThemeToggle(t) {
    try {
      var b = document.getElementById('theme-toggle');
      if (!b) return;
      var dark = t !== 'light';
      b.setAttribute('aria-pressed', dark ? 'false' : 'true');
      b.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
      b.innerHTML = '<i data-lucide="' + (dark ? 'sun' : 'moon') + '"></i>';
      if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
    } catch (e) {}
  }

  function applyTheme(t, persist) {
    try {
      document.documentElement.setAttribute('data-theme', t);
    } catch (e) {}
    try {
      var link = document.getElementById('theme-dark-css');
      if (link) link.disabled = t !== 'dark';
    } catch (e) {}
    if (persist !== false) {
      try {
        localStorage.setItem('dtech-theme', t);
      } catch (e) {}
    }
    paintThemeToggle(t);
  }

  function initTheme() {
    try {
      var t = readTheme();
      applyTheme(t, false);
      var b = document.getElementById('theme-toggle');
      if (b) {
        b.addEventListener('click', function () {
          var cur = 'dark';
          try {
            cur = document.documentElement.getAttribute('data-theme') || readTheme();
          } catch (e) {}
          applyTheme(cur === 'dark' ? 'light' : 'dark', true);
        });
      }
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
