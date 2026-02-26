self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('my-cache').then((cache) => {
      return cache.addAll([
        './',  // Agrega la raíz
        './index.html',  // Agrega el HTML principal
        './manifest.webmanifest',  // Agrega el manifest
      ]);
    })
  );
});

// Cacheo dinámico para archivos hasheados (JavaScript, CSS, etc.)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        return caches.open('my-cache').then((cache) => {
          cache.put(event.request.url, fetchResponse.clone());
          return fetchResponse;
        });
      });
    })
  );
});
