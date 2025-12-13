self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("npl-devs-v1").then(cache => {
      return cache.addAll([
        "./",
        "index.html",
        "app.html",
        "style.css",
        "auth.css",
        "icon-npl.png"
      ]);
    })
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});