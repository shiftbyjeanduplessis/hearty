const CACHE_NAME = 'hearty-hotfix-v12b-remove-temp-nav';
const APP_SHELL = [
  "/", "/index.html", "/home.html", "/meals.html", "/exercise.html", "/progress.html", "/support.html", "/settings.html", "/manifest.json",
  "/css/hearty-shell-template.css", "/js/hearty-shell-template.js", "/js/hearty-production-guard.js", "/js/hearty-install.js",
  "/icons/hearty-icon-192.png", "/icons/hearty-icon-512.png", "/icons/hearty-icon-maskable-512.png"
];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).catch(() => null).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const req = event.request;
  event.respondWith(
    fetch(req, { cache: "no-store" }).then(res => {
      try {
        if (res && res.ok && new URL(req.url).origin === self.location.origin) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy)).catch(() => null);
        }
      } catch(_) {}
      return res;
    }).catch(() => caches.match(req).then(cached => cached || caches.match("/home.html")))
  );
});
