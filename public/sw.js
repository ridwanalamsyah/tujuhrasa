// Tujuh Rasa Service Worker — minimal app-shell + offline cache
const CACHE = "tr-cache-v1";
const SHELL = ["/", "/shop", "/manifest.json", "/icon-192.svg", "/icon-512.svg"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // Skip API & supabase
  if (url.pathname.startsWith("/api/")) return;
  if (url.hostname.includes("supabase.co")) return;
  // Network-first for HTML, cache-first for assets
  if (req.headers.get("accept")?.includes("text/html")) {
    e.respondWith(
      fetch(req)
        .then((r) => {
          const clone = r.clone();
          caches.open(CACHE).then((c) => c.put(req, clone)).catch(() => {});
          return r;
        })
        .catch(() => caches.match(req).then((r) => r ?? caches.match("/")))
    );
    return;
  }
  e.respondWith(
    caches.match(req).then(
      (r) =>
        r ||
        fetch(req)
          .then((res) => {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(req, clone)).catch(() => {});
            return res;
          })
          .catch(() => r)
    )
  );
});

// Push notif placeholder (kafe nanti pakai web-push library)
self.addEventListener("push", (event) => {
  let payload = { title: "Tujuh Rasa", body: "Kabar dari kafe." };
  try {
    if (event.data) payload = event.data.json();
  } catch {}
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icon-192.svg",
      badge: "/icon-192.svg",
      data: payload.url ?? "/",
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow(event.notification.data ?? "/"));
});
