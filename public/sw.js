const CACHE_NAME = 'loveydovey-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Offline Caching (Stale-While-Revalidate pattern)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Cache the new response if it's successful and from our origin
        if (networkResponse.ok && event.request.url.startsWith(self.location.origin)) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(() => {
        return cachedResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_ALARM') {
    const { timeStr } = event.data;
    scheduleLocalAlarm(timeStr);
  }
});

let alarmTimeout = null;

function scheduleLocalAlarm(timeStr) {
  if (alarmTimeout) clearTimeout(alarmTimeout);
  
  const [hours, minutes] = timeStr.split(':');
  const now = new Date();
  const target = new Date();
  
  target.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1); // Next day
  }
  
  const delay = target.getTime() - now.getTime();
  
  alarmTimeout = setTimeout(() => {
    self.registration.showNotification("Vitamin Time! 💊", {
      body: "Take your vitamins, my love! I love you! 🦖",
      icon: "/icon.svg",
      vibrate: [200, 100, 200, 100, 200, 100, 200],
      requireInteraction: true
    });
    
    scheduleLocalAlarm(timeStr);
  }, delay);
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      if (windowClients.length > 0) {
        let client = windowClients[0];
        client.focus();
      } else {
        clients.openWindow('/');
      }
    })
  );
});
