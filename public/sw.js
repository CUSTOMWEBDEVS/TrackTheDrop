// Simple cache-first service worker (paths resolved by Vite base)
self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open('bt-cache-v1');
    await cache.addAll(['./','./index.html','./manifest.webmanifest']);
    self.skipWaiting();
  })());
});
self.addEventListener('activate', (e) => { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', (e) => {
  e.respondWith((async () => {
    const cached = await caches.match(e.request);
    if (cached) return cached;
    try { return await fetch(e.request); } catch { return cached || Response.error(); }
  })());
});
