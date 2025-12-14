self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('npl-cache').then(cache =>
      cache.addAll([
        'index.html',
        'app.html',
        'style.css'
      ])
    )
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});