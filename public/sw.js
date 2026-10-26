// Sushi Bake by Maja service worker: makes the site installable and usable offline.
// Pages are network-first (fresh prices), build assets/images/models are cache-first.
const VERSION = "sbm-v1";
const PAGES = ["/", "/menu", "/order"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(PAGES))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const isAsset = (url) =>
  url.pathname.startsWith("/_next/static/") ||
  /^\/(img|tex|models|draco|icons)\//.test(url.pathname) ||
  url.pathname.startsWith("/_next/image");

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (isAsset(url)) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            if (res.ok) caches.open(VERSION).then((c) => c.put(request, res.clone()));
            return res;
          }),
      ),
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) caches.open(VERSION).then((c) => c.put(request, res.clone()));
          return res;
        })
        .catch(() => caches.match(request).then((hit) => hit || caches.match("/"))),
    );
  }
});
