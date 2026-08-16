const CACHE = "nexatalk-v1";
const SHELL = [
  "./index.html",
  "./css/estilo.css",
  "./css/operador.css",
  "./js/nexaia.js",
  "./js/firebase.js",
  "./js/gemini.js",
  "./js/jogo.js",
  "./js/operador.js",
  "./paginas/meus-atendimentos.html",
  "./paginas/chat-nexaia.html",
  "./img/icon-nexa.png",
  "./manifest.json",
];

self.addEventListener("install", function (evento) {
  evento.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(SHELL).catch(function () {});
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (evento) {
  evento.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) {
        return caches.delete(k);
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (evento) {
  if (evento.request.method !== "GET") return;
  const url = new URL(evento.request.url);
  if (url.origin !== location.origin) return;

  evento.respondWith(
    fetch(evento.request)
      .then(function (resposta) {
        const clone = resposta.clone();
        caches.open(CACHE).then(function (cache) {
          cache.put(evento.request, clone);
        });
        return resposta;
      })
      .catch(function () {
        return caches.match(evento.request).then(function (cached) {
          if (cached) return cached;
          if (evento.request.mode === "navigate") {
            return caches.match("./index.html");
          }
          return undefined;
        });
      })
  );
});
