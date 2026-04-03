const CACHE_NAME = 'chamberforge-v1';
const STATIC_ASSETS = ['/', '/dashboard', '/discover', '/build', '/sell'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((cached) => cached || fetch(event.request))
      .catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
        return new Response('Offline', { status: 503 });
      })
  );
});
