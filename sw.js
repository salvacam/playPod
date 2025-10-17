const CACHE_NAME = 'playPod-v0.1.2';
const FILES_TO_CACHE = [
  './',
  './index.html',
  '/js/main.js',
  '/js/zepto.min.js',
  '/img/delete.png',
  '/img/download.png',
  '/img/edit.png',
  '/img/github.png',
  '/img/headphones.png',
  '/img/icon.png',
  '/img/menu.png',
  '/img/plus.png',
  '/img/upload.png'
];

// Instalación: cacheamos los archivos base
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
});

// Activación: limpieza de versiones antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => key !== CACHE_NAME && caches.delete(key)))
    )
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});

/*
// Interceptar peticiones
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Actualiza el caché con la nueva versión
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request)) // Si no hay red → usa caché
  );
});
*/
