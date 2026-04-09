const CACHE_NAME = 'menu-digitale-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    // Non chachiamo mai le chiamate a Google per permettere l'aggiornamento real-time!
    if (event.request.url.includes('docs.google.com')) {
        return; 
    }
    
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});
