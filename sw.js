const CACHE_NAME = 'menu-digitale-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json'
];

// Installa e salva in cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
});

// Recupera dalla rete, usa cache come fallback (Network First)
self.addEventListener('fetch', event => {
    // Non cacha le API di Google Sheets per avere sempre il menu aggiornato
    if (event.request.url.includes('docs.google.com')) {
        return; 
    }
    
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});
