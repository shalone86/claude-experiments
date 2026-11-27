// Tile Forge's own service worker, scoped to /tileforge/ so it stays a separate app from
// Shalone's Daily Beats (whose worker covers the rest of shalonely.com).
// Network first, so new deploys show up straight away; the cached copy is only for offline.
const CACHE = 'tileforge-v2'; // bump when the icons or manifest change
const SHELL = ['/tileforge/', '/tileforge/manifest.webmanifest', '/tileforge/icon-192.png', '/tileforge/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith('tileforge-') && k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin || !url.pathname.startsWith('/tileforge/')) return;
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match('/tileforge/')))
  );
});
