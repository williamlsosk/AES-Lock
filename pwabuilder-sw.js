const CACHE = "lockaes-cache-v6";

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// Permite actualizar sin esperar
self.addEventListener("message", event => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// INSTALACIÓN
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// ACTIVACIÓN
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(k => (k !== CACHE ? caches.delete(k) : null))
      )
    )
  );
  self.clients.claim();
});

// FETCH
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  // Navegación principal (cuando se abre la app)
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Archivos normales
  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))
  );
});
