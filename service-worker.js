self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open('npl-devs-cache').then((cache) => {
            return cache.addAll([
                '/',
                '/index.html',
                '/register.html',
                '/chat.html',
                '/style.css',
                '/firebase.js',
                '/main.js'
            ]);
        })
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => response || fetch(e.request))
    );
});


