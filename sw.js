// /sw.js
const HEARTY_VERSION = "hearty-v1.0.2"; // BUMP THIS EVERY DEPLOY
const CACHE_NAME = `hearty-cache-${HEARTY_VERSION}`;

const CORE_FILES = [
  "/",
  "/index.html",
  "/home.html",
  "/meals.html",
  "/exercise.html",
  "/progress.html",
  "/support.html",
  "/settings.html",
  "/manifest.json",
  "/js/hearty-updater.js",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => 
      cache.addAll(CORE_FILES)
    )
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  const isHTML = event.request.mode === 'navigate' || 
                 url.pathname.endsWith('.html') || 
                 url.pathname === '/';

  if (isHTML) {
    // Network-first for pages - always try fresh
    event.respondWith(
      fetch(event.request, {cache: 'no-store'})
        .then(res => {
          if(res.ok){
            caches.open(CACHE_NAME).then(c => c.put(event.request, res.clone()));
          }
          return res;
        })
        .catch(() => caches.match(event.request).then(r => r || caches.match('/index.html')))
    );
    return;
  }

  // Static assets - cache first
  event.respondWith(
    caches.match(event.request).then(cached => 
      cached || fetch(event.request).then(res => {
        if(res.ok){
          caches.open(CACHE_NAME).then(c => c.put(event.request, res.clone()));
        }
        return res;
      })
    )
  );
});
