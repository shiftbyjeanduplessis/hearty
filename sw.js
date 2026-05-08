// /sw.js — Hearty MVP app shell service worker
const CACHE_NAME = 'hearty-pwa-v2026-05-07-exercise-support-capsule-v1';

const PRECACHE = [
  '/',
  '/index.html',
  '/home.html',
  '/meals.html',
  '/exercise.html',
  '/progress.html',
  '/support.html',
  '/settings.html',
  '/social.html',
  '/css/hearty-home-v15-refactor-aesthetic.css',
  '/js/hearty-home-v15-refactor-aesthetic.js',
  '/js/hearty-data-layer.v1.js',
  '/manifest.json',
  '/hearty-logo.png',
  '/hearty-logo-gold.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
  '/icons/home-weight.png',
  '/icons/home-movement.png',
  '/icons/home-photo.png',
  '/icons/home-lesson.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE)));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', event => {
  if(event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if(url.origin !== self.location.origin) return;

  const isNavigation = event.request.mode === 'navigate';
  if(isNavigation){
    event.respondWith(
      fetch(event.request, { cache:'no-store' })
        .then(response => {
          if(response.ok && response.type === 'basic'){
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then(cached => cached || caches.match('/home.html') || caches.match('/index.html')))
    );
    return;
  }

  // Do not precache the heavy exercise image library. Runtime-cache only what is requested.
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      if(response.ok && response.type === 'basic'){
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      }
      return response;
    }))
  );
});
