const FILES_TO_CACHE = [
    '/',
    '/index.html',
    "/styles.css",
    "/indexedDB.js",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
    "/index.js"

];

const STATIC_CACHE = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(DATA_CACHE_NAME).then((cache) => cache.add("/api/transaction"))
        );
        self.skipWaiting();
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keyList => {
               return Promise.all(
                   keyList.map(key => {
                       if (key !== STATIC_CACHE && key !== DATA_CACHE_NAME) {
                           console.log("Removing last data",key);
                           return caches.delete(key);
                       }
                   })
               );
            })
        );
        self.clients.claim();
});

self.addEventListener("fetch", event => {
    // non GET requests are not cached and requests to other origins are not cached
    if (event.request.url.includes("/api/")) {
        event.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(event.request)
                    .then(response => {
                        if (response.status === 200) {
                            cache.put(event.request.url, response.clone());
                        }
                        return response;
            })
            .catch(err => console.log(err))
        })
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request)
        })
    )
})