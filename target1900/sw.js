const CACHE_NAME = 'target1900-cache-v1';
const urlsToCache = [
  '/target1900/',
  '/target1900/index.html',
  '/target1900/style.css',
  '/target1900/manifest.json',
  '/target1900/sw.js',
  '/target1900/target1900.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
