const CACHE_NAME = 'perfect-women-tracker-v1.2.6-water-click-fix';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/perfect-women.css',
  './js/pw-storage.js',
  './js/pw-recipes-data.js',
  './js/pw-meal-ideas-data.js',
  './js/pw-app.js',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/perfect-women-logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('perfect-women-tracker-') && key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;
  if (!requestUrl.pathname.startsWith('/perfect-women/')) return;

  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
