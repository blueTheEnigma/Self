const CACHE_NAME = 'self-offline-v1';
const ASSETS_TO_CACHE = [
  '/dashboard',
  '/vault',
  '/journal',
  '/goals',
  '/projects',
  '/settings',
  '/manifest.json',
  '/icon.svg',
  '/globals.css',
  '/favicon.ico',
];

// On install, pre-cache all core application routes and assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] Pre-caching app shell and routes');
      // Use map to catch individual request failures so we don't break the whole install
      return Promise.allSettled(
        ASSETS_TO_CACHE.map(url => {
          return cache.add(url).catch(err => {
            console.warn(`[Service Worker] Failed to pre-cache route: ${url}`, err);
          });
        })
      );
    })
  );
  self.skipWaiting();
});

// Clean up old caches on activation
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Intercept fetch requests
self.addEventListener('fetch', event => {
  // Only cache GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Exclude next-auth, API routes, hot-reload, and other protocols (e.g. chrome-extension)
  if (
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/_next/webpack-hmr') ||
    !url.protocol.startsWith('http')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        // Fetch a fresh version in the background, updating the cache (Stale-While-Revalidate)
        fetch(event.request)
          .then(networkResponse => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch(() => {
            // Ignore network errors when offline
          });
        return cachedResponse;
      }

      // If cache miss, fetch from network and dynamically cache
      return fetch(event.request)
        .then(networkResponse => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        })
        .catch(err => {
          // If network fails and we are navigating, fallback to cached /dashboard shell
          if (event.request.mode === 'navigate') {
            return caches.match('/dashboard');
          }
          throw err;
        });
    })
  );
});
