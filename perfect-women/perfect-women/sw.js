const CACHE_NAME = 'perfect-women-tracker-v1.4.2-exercise-images';
const CORE = [
  './',
  './index.html',
  './manifest.json',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/perfect-women-logo.png',
  './images/exercises/gym/chest_press.webp',
  './images/exercises/gym/lat_pulldown.webp',
  './images/exercises/gym/leg_press.webp',
  './images/exercises/gym/seated_row.webp',
  './images/exercises/gym/shoulder_press.webp',
  './images/exercises/home/core/core_brace.webp',
  './images/exercises/home/core/incline_plank.webp',
  './images/exercises/home/core/plank.webp',
  './images/exercises/home/hinge/bridge_march.webp',
  './images/exercises/home/hinge/glute_bridge.webp',
  './images/exercises/home/hinge/long_lever_bridge.webp',
  './images/exercises/home/pull/band_row_level1.webp',
  './images/exercises/home/pull/band_row_level2.webp',
  './images/exercises/home/pull/band_row_level3.webp',
  './images/exercises/home/pull/band_row_level4.webp',
  './images/exercises/home/push/floor_pushup.webp',
  './images/exercises/home/push/incline_pushup_high.webp',
  './images/exercises/home/push/incline_pushup_low.webp',
  './images/exercises/home/push/wall_pushup_close.webp',
  './images/exercises/home/push/wall_pushup_far.webp',
  './images/exercises/home/push/wall_pushup_medium.webp',
  './images/exercises/home/squat/bodyweight_squat.webp',
  './images/exercises/home/squat/chair_squat_hover.webp',
  './images/exercises/home/squat/sit_to_stand.webp',
  './images/exercises/home/squat/sit_to_stand_assisted.webp'
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
