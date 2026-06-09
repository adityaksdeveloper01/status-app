// sw.js
const CACHE_NAME = 'infinite-status-v1';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([
                '/',
                '/index.html',
                '/app.js',
                '/manifest.json'
            ]);
        })
    );
});

self.addEventListener('fetch', (event) => {
    // Basic network-first strategy for the app shell
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});