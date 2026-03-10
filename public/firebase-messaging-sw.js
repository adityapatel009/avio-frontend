
// ═══════════════════════════════════════════════════
// public/firebase-messaging-sw.js
// Ye file public/ folder mein rakhni hai
// ═══════════════════════════════════════════════════
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCnNjzb1Je1qNeIjlL991TV8I5Z_640MZc",
  authDomain: "avio-store.firebaseapp.com",
  projectId: "avio-store",
  storageBucket: "avio-store.firebasestorage.app",
  messagingSenderId: "478195353715",
  appId: "1:478195353715:web:c215ac4f70b74711e94206"
});

const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage((payload) => {
  const { title, body, image } = payload.notification || {};
  self.registration.showNotification(title || 'Avio', {
    body: body || 'New notification from Avio!',
    icon: '/logo192.png',
    image: image || undefined,
    badge: '/logo192.png',
    vibrate: [200, 100, 200],
    data: payload.data || {},
    actions: [
      { action: 'open', title: '🛍 Shop Now' },
      { action: 'close', title: 'Close' }
    ]
  });
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'open' || !event.action) {
    const url = event.notification.data?.url || '/';
    event.waitUntil(clients.openWindow(url));
  }
});