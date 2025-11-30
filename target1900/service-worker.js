const cacheName = "hajime1900-v1";
const assetsToCache = [
  "/target1900/",
  "/target1900/index.html",
  "/target1900/style.css",
  "/target1900/app.js",
  "/target1900/words.json",
  "/target1900/target1900.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(assetsToCache);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(res => {
      return res || fetch(event.request);
    })
  );
});
