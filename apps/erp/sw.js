// Service Worker — cache-first untuk shell statis.
const CACHE = 'tujuhrasa-v15-nested-nav';
const ASSETS = [
  './',
  './index.html',
  './assets/styles.css',
  './manifest.webmanifest',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (req.url.includes('accounts.google.com')) return;
  // Network-first untuk asset HTML/CSS/JS (selalu pull versi terbaru), fallback cache jika offline.
  const url = new URL(req.url);
  const isAsset = /\.(html|css|js|webmanifest)$/i.test(url.pathname) || url.pathname === '/' || url.pathname.endsWith('/');
  if (isAsset) {
    e.respondWith(
      fetch(req).then((r) => {
        const copy = r.clone();
        caches.open(CACHE).then((c) => { try { c.put(req, copy); } catch {} });
        return r;
      }).catch(() => caches.match(req).then(c => c || caches.match('./index.html')))
    );
    return;
  }
  // Untuk asset lain (gambar, font), cache-first.
  e.respondWith(
    caches.match(req).then((res) =>
      res || fetch(req).then((r) => {
        const copy = r.clone();
        caches.open(CACHE).then((c) => { try { c.put(req, copy); } catch {} });
        return r;
      }).catch(() => caches.match('./index.html'))
    )
  );
});
