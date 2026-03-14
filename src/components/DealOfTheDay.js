import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Clock, ShoppingCart, X, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Countdown = ({ endsAt }) => {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    const calc = () => {
      const diff = new Date(endsAt) - new Date();
      if (diff <= 0) { setTime({ h: 0, m: 0, s: 0 }); return; }
      setTime({ h: Math.floor(diff / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) });
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [endsAt]);
  const pad = n => String(n).padStart(2, '0');
  return (
    <div className="flex items-center gap-1">
      {[time.h, time.m, time.s].map((v, i) => (
        <span key={i} className="flex items-center gap-0.5">
          <span className="bg-black/50 text-white font-black text-xs px-1.5 py-0.5 rounded tabular-nums">{pad(v)}</span>
          {i < 2 && <span className="text-white/60 text-xs font-bold">:</span>}
        </span>
      ))}
    </div>
  );
};

const DealOfTheDay = () => {
  const [deal, setDeal] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchDeal();
  }, []);

  const fetchDeal = async () => {
    try {
      const res = await fetch(`${API_URL}/products/deal-of-day`);
      const data = await res.json();
      if (data.deal?.product) {
        setDeal(data.deal);
        // 2 sec baad slide in karo
        setTimeout(() => setVisible(true), 2000);
      }
    } catch {}
  };

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => setDismissed(true), 400);
  };

  if (!deal || dismissed) return null;

  const { product, dealPrice, endsAt } = deal;
  const originalPrice = product.originalPrice || product.sellingPrice;
  const discount = Math.round(((originalPrice - dealPrice) / originalPrice) * 100);

  return (
    <div className={`fixed bottom-20 md:bottom-6 left-4 z-[89] transition-all duration-500 ${
      visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8 pointer-events-none'
    }`}
      style={{ maxWidth: '300px' }}>
      <div className="relative bg-[#1a0a3e] border border-purple-500/40 rounded-2xl overflow-hidden shadow-2xl"
        style={{ boxShadow: '0 8px 32px rgba(108,58,232,0.35)' }}>

        {/* Top badge */}
        <div className="flex items-center justify-between px-3 py-2"
          style={{ background: 'linear-gradient(135deg,#6C3AE8,#C084FC)' }}>
          <div className="flex items-center gap-1.5">
            <Zap size={12} className="fill-white text-white" />
            <span className="text-white text-xs font-black tracking-wider">DEAL OF THE DAY</span>
          </div>
          <button onClick={handleDismiss}
            className="w-5 h-5 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center transition">
            <X size={10} className="text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex gap-3 p-3">
          {/* Image */}
          <Link to={`/product/${product._id}`} onClick={handleDismiss}>
            <div className="relative shrink-0">
              <img src={product.images?.[0]} alt={product.name}
                className="w-20 h-20 object-cover rounded-xl border border-purple-500/30" />
              <div className="absolute -top-1.5 -right-1.5 bg-green-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                {discount}% OFF
              </div>
            </div>
          </Link>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <Link to={`/product/${product._id}`} onClick={handleDismiss}>
              <p className="text-white text-xs font-bold line-clamp-2 hover:text-purple-300 transition mb-1">
                {product.name}
              </p>
            </Link>

            {product.averageRating > 0 && (
              <div className="flex items-center gap-1 mb-1">
                <div className="flex items-center gap-0.5 bg-green-600 px-1.5 py-0.5 rounded">
                  <Star size={8} className="fill-white text-white" />
                  <span className="text-white text-[9px] font-bold">{product.averageRating.toFixed(1)}</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-white font-black text-sm">₹{dealPrice}</span>
              <span className="text-white/40 text-xs line-through">₹{originalPrice}</span>
            </div>

            {/* Countdown */}
            <div className="flex items-center gap-1 mb-2">
              <Clock size={9} className="text-red-400 shrink-0" />
              <span className="text-red-400 text-[9px] font-bold">Ends in:</span>
              <Countdown endsAt={endsAt} />
            </div>

            {/* Button */}
            <button
              onClick={() => {
                addToCart({ ...product, sellingPrice: dealPrice });
                toast.success('Deal cart mein add ho gaya! 🔥');
                handleDismiss();
              }}
              disabled={product.stock === 0}
              className="w-full flex items-center justify-center gap-1 py-1.5 rounded-xl text-white text-xs font-bold transition active:scale-95 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#6C3AE8,#C084FC)' }}>
              <ShoppingCart size={11} /> Grab Deal!
            </button>
          </div>
        </div>

        {/* Stock warning */}
        {product.stock <= 10 && product.stock > 0 && (
          <div className="px-3 pb-2">
            <p className="text-red-400 text-[9px] font-semibold text-center">
              ⚡ Sirf {product.stock} bacha hai!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DealOfTheDay;