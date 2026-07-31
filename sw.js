// SG HDB Resale Dashboard — service worker
// Bump CACHE version whenever you change any cached file so clients update.
const CACHE = 'hdb-resale-v19';
const ASSETS = [
  './',
  './index.html',
  './page2_find_your_flat.html',
  './page3_mrt_proximity.html',
  './page5_by_district.html',
  './page6_this_year.html',
  './page4_hidden_insights.html',
  './privacy.html',
  './about.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Only handle same-origin requests; let ad/analytics network requests pass through untouched.
  if (url.origin !== self.location.origin) return;
  // Network-first for HTML so content stays fresh; cache-first for static assets.
  if (req.mode === 'navigate' || req.destination === 'document') {
    e.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
    );
    return;
  }
  e.respondWith(caches.match(req).then((r) => r || fetch(req)));
});
