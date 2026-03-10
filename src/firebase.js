// ═══════════════════════════════════════════════════
// src/firebase.js — NAYI FILE BANAO
// ═══════════════════════════════════════════════════
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyCnNjzb1Je1qNeIjlL991TV8I5Z_640MZc",
  authDomain: "avio-store.firebaseapp.com",
  projectId: "avio-store",
  storageBucket: "avio-store.firebasestorage.app",
  messagingSenderId: "478195353715",
  appId: "1:478195353715:web:c215ac4f70b74711e94206"
};

const VAPID_KEY = "BCSAzSKHiisYDrAbpTt1Qri7w42DUzVLUAXErO_ENxpiOLr0Jup61bRkfXkibIGfP1HPafksqkDqaKwpAMgfaAU";

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Request permission + get FCM token
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    return token;
  } catch (err) {
    console.log('FCM token error:', err);
    return null;
  }
};

// Foreground message listener
export const onForegroundMessage = (callback) => {
  return onMessage(messaging, callback);
};

export { messaging };