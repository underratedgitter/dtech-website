// Vercel Web Analytics: cookieless page-view counts, served from this site's
// own origin (/_vercel/insights), so the CSP needs no third-party hosts.
// Turn it on in Vercel → Project → Analytics; until then the script 404s
// quietly. Skipped on localhost so local testing isn't counted.
(function () {
  var host = location.hostname;
  if (!host || host === 'localhost' || host === '127.0.0.1' || location.protocol === 'file:') return;
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  var s = document.createElement('script');
  s.defer = true;
  s.src = '/_vercel/insights/script.js';
  document.head.appendChild(s);
})();
