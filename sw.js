const CACHE_NAME = 'peercircle-v14';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './favicon.png',
    './favicon.svg',
    './google-meet.svg',
    './zoom.svg',
    './image_b1faa4.png' 
];

// 1. Install Event: Cache core files + force immediate activation
self.addEventListener('install', (event) => {
    // Force the waiting service worker to become the active one immediately
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// 2. Fetch Event: Serve from cache if available, otherwise network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

// 3. Activate Event: Clean up old caches + claim all clients immediately
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        }).then(() => {
            // Take control of all pages immediately
            return self.clients.claim();
        })
    );
});