const CACHE_NAME = 'database1900-cache-v1';
const urlsToCache = [
  '/database1900/',
  '/database1900/index.html',
  '/database1900/style.css',
  '/database1900/manifest.json',
  '/database1900/sw.js',
  '/database1900/database1900.png'
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
