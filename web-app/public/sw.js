// Offline Service Worker for AI Visualised Engineering
const CACHE_NAME = 'ai-engineering-v2';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.svg',
  './icons.svg',
  './model-comparison.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Ignore chrome-extension or other non-http/https protocols
  if (!event.request.url.startsWith('http')) return;

  // The page itself is fetched fresh whenever the network is there. Every deploy renames the
  // script files, so a cached index.html would point at files that no longer exist.
  const isPage = event.request.mode === 'navigate' || event.request.destination === 'document';
  if (isPage) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(async () =>
          (await caches.match(event.request)) || (await caches.match('./index.html')) || (await caches.match('./')) || Response.error()
        )
    );
    return;
  }

  // Everything else (hashed scripts, styles, images): cache first, refresh in the background.
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const refresh = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return networkResponse;
      });
      if (cachedResponse) {
        refresh.catch(() => {}); // offline: the cached copy is already on its way
        return cachedResponse;
      }
      return refresh;
    })
  );
});
