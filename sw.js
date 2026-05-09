// /sw.js — Hearty app shell service worker
const CACHE_NAME = 'hearty-pwa-v2026-05-09-onboarding-pwa-cache-v1';

const PRECACHE = [
  '/',
  '/index.html',
  '/login.html',
  '/home.html',
  '/meals.html',
  '/meals-onboarding.html',
  '/exercise.html',
  '/progress.html',
  '/support.html',
  '/settings.html',
  '/social.html',

  '/css/hearty-home-v15-refactor-aesthetic.css',

  '/js/hearty-home-v15-refactor-aesthetic.js',
  '/js/hearty-data-layer.v1.js',
  '/js/hearty-updater.js',

  '/manifest.json',

  '/hearty-logo.png',
  '/hearty-logo-gold.png',
  '/assets/hearty-splash-screen.png',

  '/icons/hearty-icon-192.png',
  '/icons/hearty-icon-512.png',
  '/icons/hearty-icon-maskable-512.png',

  '/icons/home-weight.png',
  '/icons/home-movement.png',
  '/icons/home-photo.png',
  '/icons/home-lesson.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(
        PRECACHE.map(url => new Request(url, { cache: 'reload' }))
      );
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  const isNavigation = event.request.mode === 'navigate';

  // HTML pages: network first, then cache fallback.
  // This prevents users from being stuck on old deployed pages.
  if (isNavigation) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then(response => {
          if (response.ok && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() =>
          caches.match(event.request).then(cached =>
            cached || caches.match('/home.html') || caches.match('/index.html')
          )
        )
    );
    return;
  }

  // Manifest and JS/CSS: network first, fallback to cache.
  // These files change often during development and launch fixes.
  if (
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.json')
  ) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then(response => {
          if (response.ok && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Images and other static assets: cache first, then network.
  // Exercise image library is still runtime-cached only when requested.
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        if (response.ok && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      });
    })
  );
});
