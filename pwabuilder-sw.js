const CACHE = "lockaes-cache-v5";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
];
// Permite actualizar al instante desde el registro (SKIP_WAITING)
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});
self.addEventListener("fetch", (event) => {
  const req = event.request;
  // Solo GET
  if (req.method !== "GET") return;
  // Navegación (cuando abres la app o cambias de ruta)
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("./index.html"))
    );
    return;
  }
  // Archivos (cache-first)
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
