import { useEffect, useState } from 'react';
import { requestNotificationPermission, onForegroundMessage } from '../firebase';
import API from '../utils/api';
import toast from 'react-hot-toast';

const useNotification = () => {
  const [permission, setPermission] = useState(Notification.permission);

  useEffect(() => {
    // Foreground messages sunna
    const unsubscribe = onForegroundMessage((payload) => {
      const { title, body } = payload.notification || {};
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'}
          max-w-sm w-full bg-card border border-purple-500/30 shadow-lg rounded-2xl pointer-events-auto flex`}>
          <div className="flex-1 p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg,#6C3AE8,#C084FC)' }}>
                <span className="text-white text-sm">⚡</span>
              </div>
              <div>
                <p className="text-white font-bold text-sm">{title || 'Avio'}</p>
                <p className="text-gray-400 text-xs mt-0.5">{body}</p>
              </div>
            </div>
          </div>
          <button onClick={() => toast.dismiss(t.id)} className="p-4 text-gray-500 hover:text-white">✕</button>
        </div>
      ), { duration: 6000 });
    });

    return () => unsubscribe && unsubscribe();
  }, []);

  const subscribe = async () => {
    const token = await requestNotificationPermission();
    setPermission(Notification.permission);
    if (token) {
      try {
        await API.post('/notifications/subscribe', { token });
        toast.success('Notifications on ho gayi! 🔔');
        return true;
      } catch {
        toast.error('Subscribe nahi hua!');
        return false;
      }
    }
    return false;
  };

  return { permission, subscribe };
};

export default useNotification;