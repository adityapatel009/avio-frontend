import { useState, useEffect } from 'react';
import { X, Zap } from 'lucide-react';
import API from '../utils/api';

// ─── DYNAMIC FLASH SALE BANNER ───────────────────────────
// Ab hardcoded nahi — backend se data aata hai
// Home.js mein replace karo:
//   <FlashSaleBanner /> (no props needed)

const FlashSaleBanner = () => {
  const [sale, setSale] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if dismissed this session
    const d = sessionStorage.getItem('flash_dismissed');
    if (d) { setDismissed(true); return; }

    // Fetch from backend
    API.get('/flashsale')
      .then(({ data }) => { if (data.sale) setSale(data.sale); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!sale) return;
    const calc = () => {
      const diff = new Date(sale.endTime) - new Date();
      if (diff <= 0) { setSale(null); return; }
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [sale]);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('flash_dismissed', '1');
  };

  const copyCode = () => {
    navigator.clipboard.writeText(sale.code);
    alert(`Code "${sale.code}" copy ho gaya! Checkout mein lagao.`);
  };

  if (!sale || !sale.isActive || dismissed) return null;

  const pad = n => String(n).padStart(2, '0');

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white px-4 py-2.5">
      <div className="relative flex items-center justify-between gap-3 max-w-5xl mx-auto">
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5">
            <Zap size={12} className="fill-yellow-300 text-yellow-300" />
            <span className="text-xs font-black tracking-wider">{sale.title.toUpperCase()}</span>
          </div>
          <span className="text-sm font-bold hidden sm:block">
            {sale.discount}% OFF! {sale.message && `• ${sale.message}`}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs text-white/80 hidden sm:block">Khatam hone mein:</span>
          {[
            { val: timeLeft.h, label: 'hr' },
            { val: timeLeft.m, label: 'min' },
            { val: timeLeft.s, label: 'sec' },
          ].map((unit, i) => (
            <div key={i} className="flex items-center gap-0.5">
              <div className="bg-black/30 backdrop-blur rounded-md px-2 py-1 min-w-[2rem] text-center">
                <span className="font-black text-sm tabular-nums">{pad(unit.val)}</span>
                <p className="text-white/60 text-[9px] leading-none">{unit.label}</p>
              </div>
              {i < 2 && <span className="text-white/60 font-bold text-xs mb-2">:</span>}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button onClick={copyCode}
            className="bg-white text-red-600 text-xs font-black px-3 py-1.5 rounded-lg hover:bg-yellow-100 transition tracking-wider flex items-center gap-1">
            <Zap size={11} className="fill-red-500 text-red-500" />
            {sale.code}
          </button>
          <button onClick={handleDismiss} className="text-white/70 hover:text-white transition">
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlashSaleBanner;