self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_ALARM') {
    const { timeStr } = event.data; // e.g., "08:00"
    
    // In a real push notification setup, the server sends the event.
    // Here, we try to use periodic sync or just simple setTimeout if the browser keeps the SW alive.
    // WARNING: setTimeout in SW is paused when the SW is suspended by the browser.
    // This is a best-effort local fallback for a web app without a backend.
    
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
      icon: "/images/cute_dino_vitamin.png",
      vibrate: [200, 100, 200, 100, 200, 100, 200],
      requireInteraction: true
    });
    
    // Reschedule for next day
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
