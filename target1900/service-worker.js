const cacheName = 'hajime1900-cache-v1';
const filesToCache = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  '/target1900/target1900.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(filesToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
