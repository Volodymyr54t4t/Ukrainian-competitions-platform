// Service Worker для PWA Єдиної платформи конкурсів України

const CACHE_NAME = 'competitions-platform-v1';
const STATIC_CACHE = 'static-v1';

// Ресурси для кешування
const STATIC_ASSETS = [
  '/',
  '/auth.html',
  '/dashboard.html',
  '/competitions.html',
  '/css/auth.css',
  '/css/dashboard.css',
  '/css/competitions.css',
  '/js/auth.js',
  '/js/dashboard.js',
  '/js/competitions.js',
  '/manifest.json',
  '/icons/icon-192x192.svg',
];

// Встановлення Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker встановлено');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Активація Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker активовано');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== CACHE_NAME) {
            console.log('Видаляю старий кеш:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Обробка запитів
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Повертаємо кешовану версію, якщо є
      if (cachedResponse) {
        return cachedResponse;
      }

      // Інакше робимо мережевий запит
      return fetch(event.request).then((response) => {
        // Кешуємо тільки успішні GET запити
        if (event.request.method === 'GET' &&
            response.status === 200 &&
            response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      }).catch(() => {
        // Якщо немає мережі і немає кешу, повертаємо офлайн сторінку
        if (event.request.destination === 'document') {
          return caches.match('/auth.html');
        }
      });
    })
  );
});

// Обробка повідомлень від основного потоку
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});