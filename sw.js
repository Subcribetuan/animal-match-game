const CACHE_NAME = 'match-games-v2';

const ASSETS = [
  '/home.html',
  '/index.html',
  '/styles.css',
  '/game.js',
  '/sounds.js',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json',
  '/family-match/index.html',
  '/family-match/styles.css',
  '/family-match/game.js',
  '/family-match/sounds.js',
  '/family-match/images/benjamine.jpg',
  '/family-match/images/christopher.jpg',
  '/family-match/images/dylan.jpg',
  '/family-match/images/uncle-john.png',
  '/family-match/images/brendan.jpg',
  '/family-match/images/auntie-cindy.jpg',
  '/family-match/images/yaih-yaih.jpg',
  '/family-match/images/mummy.png',
  '/family-match/images/daddy.png',
  '/flag-match/index.html',
  '/flag-match/styles.css',
  '/flag-match/game.js',
  '/flag-match/sounds.js',
  '/flag-match/flags/cambodia.svg',
  '/flag-match/flags/thailand.svg',
  '/flag-match/flags/vietnam.svg',
  '/flag-match/flags/laos.svg',
  '/flag-match/flags/myanmar.svg',
  '/flag-match/flags/philippines.svg',
  '/flag-match/flags/indonesia.svg',
  '/flag-match/flags/malaysia.svg',
  '/flag-match/flags/singapore.svg',
  '/food-match/index.html',
  '/food-match/styles.css',
  '/food-match/game.js',
  '/food-match/sounds.js',
  '/number-match/index.html',
  '/number-match/styles.css',
  '/number-match/game.js',
  '/number-match/sounds.js',
  '/fruit-match/index.html',
  '/fruit-match/styles.css',
  '/fruit-match/game.js',
  '/fruit-match/sounds.js',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  // Let navigation requests (page clicks) go straight to network for instant response
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // For sub-resources (CSS, JS, images): serve from cache first
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
