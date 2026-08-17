// SG HDB Resale Dashboard - service worker
// Bump CACHE version whenever you change any cached file so clients update.
const CACHE = 'hdb-resale-v53';
const ASSETS = [
  './',
  './index.html',
  './overview',
  './find-a-flat',
  './analysis-by-town',
  './by-district',
  './this-year',
  './this-month',
  './guides/',
  './guides/mrt-price-premium',
  './guides/fair-price',
  './guides/lease-decay',
  './guides/mature-vs-non-mature',
  './guides/is-now-a-good-time',
  './guides/buying-costs',
  './guides/cash-over-valuation',
  './guides/buying-timeline',
  './guides/hdb-vs-bank-loan',
  './guides/mop-and-eligibility',
  './insights',
  './towns/',
  './search',
  './calculators',
  './affordability',
  './grants',
  './stamp-duty',
  './about',
  './contact',
  './terms',
  './privacy',
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
  // The Search page's dataset is large; cache it at runtime on first visit, then serve from cache.
  if (url.pathname.endsWith('/assets/tx9f2c.json')) {
    e.respondWith(caches.open(CACHE).then((c) => c.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) c.put(req, res.clone());
      return res;
    }))));
    return;
  }
  e.respondWith(caches.match(req).then((r) => r || fetch(req)));
});
