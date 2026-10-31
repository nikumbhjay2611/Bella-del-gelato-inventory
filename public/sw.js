const CACHE="bella-static-v1";
self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(["/bella-icon.svg","/manifest.webmanifest"]))));
self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
// Only cache static assets. Authenticated pages and API responses are always network-only.
self.addEventListener("fetch",event=>{const url=new URL(event.request.url);if(event.request.method==="GET"&&url.origin===location.origin&&["image","font"].includes(event.request.destination)){event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(response=>{if(response.ok)caches.open(CACHE).then(cache=>cache.put(event.request,response.clone()));return response})))}});
