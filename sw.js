// Service Worker de Leo y Juego
// Estrategia: intenta traer todo de internet primero (para que las
// actualizaciones lleguen enseguida). Si no hay internet, usa lo que
// tenga guardado en la caché para que la app siga funcionando offline.

const CACHE_NAME = 'leo-y-juego-cache-v1';

const ARCHIVOS_BASE = [
  './',
  './index.html',
  './manifest.json'
];

// Al instalar: guarda los archivos base en caché
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ARCHIVOS_BASE))
  );
  self.skipWaiting();
});

// Al activar: borra cachés viejas de versiones anteriores
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((nombres) =>
      Promise.all(
        nombres
          .filter((nombre) => nombre !== CACHE_NAME)
          .map((nombre) => caches.delete(nombre))
      )
    )
  );
  self.clients.claim();
});

// Al pedir un archivo: primero internet, si falla usa la caché
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((respuesta) => {
        const copia = respuesta.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copia));
        return respuesta;
      })
      .catch(() => caches.match(event.request))
  );
});
