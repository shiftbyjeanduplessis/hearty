/* Hearty root-safe service worker
   Purpose: prevent / and /index.html from being served as the app shell.
   Safe rule: public root is always network-first and never redirected to home.html.
*/
const CACHE_NAME = 'hearty-root-safe-v98-exercise-nav-exit';
const APP_ROUTE_PAGES = new Set([
  '/home.html',
  '/meals.html',
  '/exercise.html',
  '/progress.html',
  '/support.html',
  '/recipes.html',
  '/social.html',
  '/settings.html',
  '/onboarding.html'
]);

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME));
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isRoot = url.pathname === '/' || url.pathname === '/index.html';

  // Critical guard: never answer the sales-page root with the app shell.
  if (request.mode === 'navigate' && isRoot) {
    event.respondWith(fetch(request, { cache: 'no-store' }));
    return;
  }

  // App pages: network first, cached fallback only for the same requested page.
  if (request.mode === 'navigate' && APP_ROUTE_PAGES.has(url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const response = await fetch(request);
        cache.put(request, response.clone());
        return response;
      } catch (err) {
        const cached = await cache.match(request);
        return cached || Response.error();
      }
    })());
    return;
  }

  // Static assets: simple network-first cache.
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const response = await fetch(request);
      if (response && response.ok) cache.put(request, response.clone());
      return response;
    } catch (err) {
      const cached = await cache.match(request);
      return cached || Response.error();
    }
  })());
});
