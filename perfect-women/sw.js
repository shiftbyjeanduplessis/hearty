const CACHE_NAME = 'perfect-women-tracker-v1.3.4-index-repair';
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
