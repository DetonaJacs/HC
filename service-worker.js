self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('app-cache').then(cache => {
      return cache.addAll([
        './',
        './index.html',
        './styles/default.css',
        './img/logo.png',
	    	'./menu/1.html',
		    './menu/t.html'
        // Adicione outros recursos aqui, como JavaScript, fontes, etc.
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
