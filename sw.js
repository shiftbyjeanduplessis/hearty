const CACHE_NAME = "hearty-production-v22-install-loop-stop";

self.addEventListener("install", (event) => {
  // Do not call skipWaiting here. This avoids controllerchange reload loops on older open pages.
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key.startsWith("hearty-") && key !== CACHE_NAME).map((key) => caches.delete(key))
    ))
    // Do not call clients.claim here. New pages will use the worker normally after navigation/reopen.
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(fetch(event.request, { cache: "no-store" }).catch(() => caches.match(event.request)));
});
