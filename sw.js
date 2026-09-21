/* D-TECH offline cache. Bump VERSION to invalidate old caches. */
var VERSION = 'dtech-v1';
var CORE = [
  '/',
  '/assets/bundle.min.css',
  '/assets/skin.min.css',
  '/assets/dtech-logo.webp',
  '/assets/icon-192.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(VERSION).then(function (cache) {
      return cache.addAll(CORE);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== VERSION) return caches.delete(k);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.indexOf('/_vercel/') === 0) return;
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) {
        if (res && res.status === 200 && res.type === 'basic') {
          var copy = res.clone();
          caches.open(VERSION).then(function (cache) {
            cache.put(req, copy);
          });
        }
        return res;
      }).catch(function () {
        if (req.mode === 'navigate') return caches.match('/');
      });
    })
  );
});
