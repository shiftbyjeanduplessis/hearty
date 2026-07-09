const CACHE_NAME = 'perfect-women-tracker-v1.3.6-button-repair';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/perfect-women.css',
  './js/pw-storage-v136.js',
  './js/pw-recipes-data.js?v=136',
  './js/pw-meal-ideas-data.js?v=136',
  './js/pw-app-v136.js',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/perfect-women-logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => Promise.allSettled(ASSETS.map((asset) => cache.add(asset)))));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((key) => key.startsWith('perfect-women-tracker-') && key !== CACHE_NAME).map((key) => caches.delete(key))
  )));
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith('/perfect-women/')) return;

  const isCode = event.request.mode === 'navigate' || /\.(?:html|js|css)$/.test(url.pathname);
  if (isCode) {
    event.respondWith(fetch(event.request, { cache: 'no-store' }).then((response) => {
      if (response && response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
      return response;
    }).catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html'))));
    return;
  }

  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    if (response && response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
    return response;
  })));
});
