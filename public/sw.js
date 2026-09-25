const CACHE_NAME = "lotterysoup-shell-v1";
const SHELL_FILES = [
  "/offline",
  "/lotterysoup-logo.jpg",
  "/app-icon-192.png",
  "/app-icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
    )),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || event.request.mode !== "navigate") return;

  // Subscriber documents are network-only so a logged-out device never opens
  // a previously cached protected issue. The offline page contains no account data.
  event.respondWith(fetch(event.request).catch(() => caches.match("/offline")));
});
