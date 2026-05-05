const HEARTY_VERSION = "hearty-v1.0.1";
const CACHE_NAME = `hearty-cache-${HEARTY_VERSION}`;

const CORE_FILES = [
  "/",
  "/index.html",
  "/HOME.html",
  "/MEALS.html",
  "/EXERCISE.html",
  "/PROGRESS.html",
  "/SUPPORT.html",
  "/SETTINGS.html",
  "/manifest.json",
  "/js/hearty-updater.js"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_FILES).catch(() => null);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin !== location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, copy);
        });

        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
