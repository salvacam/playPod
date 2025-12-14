var cacheName = 'playPod-v0.1.43';

var filesToCache = [
  './',
  './index.html',
  './js/main.js',
  './js/zepto.min.js',
  './img/delete.png',
  './img/download.png',
  './img/edit.png',
  './img/forward.png',
  './img/github.png',
  './img/headphones.png',
  './img/icon.png',
  './img/menu.png',
  './img/pause.png',
  './img/plus.png',
  './img/play.png',
  './img/rewind.png',
  './img/upload.png'
];

self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install_');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate_');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key.startsWith('tiempo-')){
          if (key !== cacheName) {
            console.log('[ServiceWorker] Removing old cache', key);
            return caches.delete(key);
          }
        }
      }));
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});
