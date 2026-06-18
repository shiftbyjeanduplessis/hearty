const CACHE_NAME = "hearty-production-v16-theme-aware-onboarding";
const CORE_URLS = [
  "/", "/home.html", "/meals.html", "/meals-onboarding.html", "/exercise.html", "/progress.html", "/support.html", "/social.html", "/settings.html", "/how-to-use.html", "/help.html", "/login.html", "/data-recovery.html",
  "/manifest.json", "/pwa-install.css", "/pwa-install.js",
  "/css/hearty-shell-template.css", "/css/hearty-step5n-theme-beauty.css", "/css/hearty-theme.css",
  "/js/hearty-shell-template.js", "/js/hearty-production-guard.js", "/js/hearty-theme.js", "/js/hearty-updater.js",
  "/icons/hearty-icon-192.png", "/icons/hearty-icon-512.png", "/icons/hearty-icon-maskable-512.png", "/assets/hearty-splash-screen.png"
];

self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_URLS).catch(() => undefined)));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(new Request(req, { cache: "no-store" }))
      .then(resp => {
        const copy = resp.clone();
        if (resp && resp.ok) caches.open(CACHE_NAME).then(cache => cache.put(req, copy)).catch(() => undefined);
        return resp;
      })
      .catch(() => caches.match(req).then(cached => cached || caches.match(url.pathname)).then(cached => cached || Response.error()))
  );
});
