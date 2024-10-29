// Versão do cache
const CACHE_NAME = "ajuda-v1";

// Arquivos a serem armazenados em cache
const urlsToCache = [
  "./index.html",
  "./styles/default.css",
  "./img/logo.png",
  "./manifest.json"
];

// Instalando o Service Worker
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("Arquivos armazenados em cache");
      return cache.addAll(urlsToCache);
    })
  );
});

// Buscando recursos no cache
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// Atualizando o Service Worker
self.addEventListener("activate", event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
