const CACHE_NAME = 'perfect-women-tracker-v1.4.1-html-repair';
const CORE = [
  './',
  './index.html',
  './manifest.json',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/perfect-women-logo.png',
  './images/exercises/gym/leg_press.webp',
  './images/exercises/gym/chest_press.webp',
  './images/exercises/gym/seated_row.webp',
  './images/exercises/gym/lat_pulldown.webp',
  './images/exercises/gym/shoulder_press.webp'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => Promise.allSettled(CORE.map((asset) => cache.add(asset)))));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith('perfect-women-tracker-') && key !== CACHE_NAME).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith('/perfect-women/')) return;

  if (event.request.mode === 'navigate' || url.pathname.endsWith('/index.html')) {
    event.respondWith(fetch(event.request, { cache: 'no-store' }).then((response) => {
      if (response && response.ok) caches.open(CACHE_NAME).then((cache) => cache.put('./index.html', response.clone()));
      return response;
    }).catch(() => caches.match('./index.html')));
    return;
  }

  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    if (response && response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
    return response;
  })));
});
