// ═══════════════════════════════════════════════════
// src/components/NotificationBell.jsx — NAYI FILE
// Navbar mein add karo
// ═══════════════════════════════════════════════════
import { useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import useNotification from '../hooks/useNotification';

const NotificationBell = () => {
  const { permission, subscribe } = useNotification();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (permission === 'granted') return;
    setLoading(true);
    await subscribe();
    setLoading(false);
  };

  if (permission === 'denied') return null;

  return (
    <button onClick={handleClick} disabled={loading}
      className="hidden md:flex flex-col items-center p-2 transition group relative"
      title={permission === 'granted' ? 'Notifications ON' : 'Enable Notifications'}>
      {permission === 'granted' ? (
        <>
          <div className="relative">
            <Bell size={20} className="text-purple-400" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full" />
          </div>
          <span className="text-xs text-purple-400">Alerts</span>
        </>
      ) : (
        <>
          <BellOff size={20} className="text-gray-400 group-hover:text-purple-400 transition" />
          <span className="text-xs text-gray-400 group-hover:text-purple-400">
            {loading ? '...' : 'Alerts'}
          </span>
        </>
      )}
    </button>
  );
};

export default NotificationBell;