/* Flag IQ Service Worker
 * - Pre-caches the app shell on install (so the game opens offline).
 * - Runtime-caches flag images from flagcdn.com on first fetch.
 * - Bump CACHE_VERSION whenever you ship new index.html or assets.
 */

const CACHE_VERSION = 'flagiq-v1';
const FLAGS_CACHE   = 'flagiq-flags-v1';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys
        .filter(k => k !== CACHE_VERSION && k !== FLAGS_CACHE)
        .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // ---- Flag images from flagcdn.com: cache-first, network-fallback ----
  if (url.hostname === 'flagcdn.com') {
    event.respondWith((async () => {
      const cache = await caches.open(FLAGS_CACHE);
      const hit   = await cache.match(req);
      if (hit) return hit;
      try {
        const response = await fetch(req);
        if (response && response.ok) cache.put(req, response.clone());
        return response;
      } catch (e) {
        return hit || new Response('Offline', { status: 503, statusText: 'Offline' });
      }
    })());
    return;
  }

  // ---- App shell & same-origin: cache-first, fall back to network ----
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then(cached =>
        cached || fetch(req).then(response => {
          // Lazily cache new same-origin GET responses (e.g. icons not in shell)
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then(c => c.put(req, copy)).catch(()=>{});
          }
          return response;
        }).catch(() => caches.match('./index.html'))
      )
    );
  }
});
