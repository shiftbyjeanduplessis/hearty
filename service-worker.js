/* Hearty v36 sales-route-safe service worker */
const CACHE_NAME = 'hearty-v36-sales-route-safe';
const NETWORK_FIRST_NAV = new Set([
  '/', '/index.html', '/free-meal-plan.html', '/free-meal-plan',
  '/home.html','/meals.html','/exercise.html','/progress.html','/support.html',
  '/recipes.html','/social.html','/settings.html','/onboarding.html','/login.html'
]);
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.mode === 'navigate' || NETWORK_FIRST_NAV.has(url.pathname) || /\.(html?)$/i.test(url.pathname)) {
    event.respondWith(fetch(request, { cache: 'no-store', redirect: 'follow' }).catch(() => caches.match(request)));
    return;
  }
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const response = await fetch(request, { cache: 'no-cache' });
      if (response && response.ok) await cache.put(request, response.clone());
      return response;
    } catch (_error) {
      return (await cache.match(request)) || Response.error();
    }
  })());
});
