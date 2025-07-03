const CACHE_NAME = 'target1900-cache-v1';
const urlsToCache = [
  '/target1900/',
  '/target1900/index.html',
  '/target1900/style.css',
  '/target1900/manifest.json',
  '/target1900/sw.js',
  '/target1900/target1900.png',
  '/target1900/ZenKurenaido-Regular.ttf'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(urlsToCache)));
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
