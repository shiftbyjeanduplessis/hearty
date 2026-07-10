/* Hearty v105 route-safe service worker */
const CACHE_NAME = 'hearty-v105-route-safe';
const APP_ROUTE_PAGES = new Set([
  '/home.html','/meals.html','/exercise.html','/progress.html','/support.html',
  '/recipes.html','/social.html','/settings.html','/onboarding.html'
]);
self.addEventListener('install', event => { self.skipWaiting(); event.waitUntil(caches.open(CACHE_NAME)); });
self.addEventListener('activate', event => {
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const request=event.request;
  if(request.method!=='GET') return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin) return;
  const isRoot=url.pathname==='/'||url.pathname==='/index.html';
  if(request.mode==='navigate' && (isRoot || APP_ROUTE_PAGES.has(url.pathname))){
    event.respondWith(fetch(request,{cache:'no-store',redirect:'follow'}));
    return;
  }
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE_NAME);
    try{
      const response=await fetch(request,{cache:'no-cache'});
      if(response && response.ok) await cache.put(request,response.clone());
      return response;
    }catch(_error){
      return (await cache.match(request)) || Response.error();
    }
  })());
});
