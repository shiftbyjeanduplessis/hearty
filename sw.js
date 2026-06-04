/* Hearty PWA service worker — emergency customer repair release.
   Canonical worker URL: /sw.js
   Purpose: provide a valid installable app shell and reliable update path.
*/
const CACHE_NAME = 'hearty-shell-v2026.06.04-pwa-repair-1';
const CACHE_PREFIX = 'hearty-';
const OFFLINE_URL = '/offline.html';
const APP_SHELL = [
  '/home.html',
  '/meals.html',
  '/exercise.html',
  '/progress.html',
  '/support.html',
  '/settings.html',
  '/social.html',
  '/help.html',
  '/welcome.html',
  '/privacy.html',
  '/terms.html',
  '/refunds.html',
  '/login.html',
  OFFLINE_URL,
  '/manifest.json',
  '/hearty-logo.png',
  '/icons/hearty-icon-192.png',
  '/icons/hearty-icon-512.png',
  '/icons/hearty-icon-maskable-512.png',
  '/icons/home-weight.png',
  '/icons/home-movement.png',
  '/icons/home-photo.png',
  '/icons/home-lesson.png',
  '/css/hearty-home-v15-refactor-aesthetic.css',
  '/css/hearty-theme.css',
  '/js/hearty-home-v15-refactor-aesthetic.js',
  '/js/hearty-theme.js',
  '/js/hearty-data-layer.v1.js',
  '/js/hearty-updater.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.all(APP_SHELL.map(url =>
        cache.add(new Request(url, { cache: 'reload' })).catch(error => {
          console.warn('[Hearty SW] optional precache failed:', url, error);
        })
      ))
    )
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
        .map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

function isAppDocument(pathname) {
  return /^\/(home|meals|exercise|progress|support|settings|social|login|help)\.html$/.test(pathname) || pathname === '/';
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response && response.ok && response.type === 'basic') {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return (await cache.match(request)) || (await cache.match(OFFLINE_URL));
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const networkPromise = fetch(request).then(response => {
    if (response && response.ok && response.type === 'basic') cache.put(request, response.clone());
    return response;
  }).catch(() => null);
  return cached || (await networkPromise) || Response.error();
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate' || isAppDocument(url.pathname)) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (['style', 'script', 'image', 'font', 'manifest'].includes(request.destination)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
