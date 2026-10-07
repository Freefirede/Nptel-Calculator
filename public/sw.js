// The app previously used a cache-first service worker, which could serve stale
// JavaScript and make interactive search inputs appear broken. Keep this file
// only to retire installations from older versions.
self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key)))),
      self.clients.claim(),
    ])
  );
});
