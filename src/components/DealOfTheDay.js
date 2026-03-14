import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Clock, ShoppingCart, Star, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ─── COUNTDOWN TIMER ─────────────────────────────────────
const Countdown = ({ endsAt }) => {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endsAt) - new Date();
      if (diff <= 0) { setTime({ h: 0, m: 0, s: 0 }); return; }
      setTime({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [endsAt]);

  const pad = n => String(n).padStart(2, '0');

  return (
    <div className="flex items-center gap-1.5">
      {[{ label: 'HRS', val: time.h }, { label: 'MIN', val: time.m }, { label: 'SEC', val: time.s }].map((item, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div className="flex flex-col items-center">
            <div className="bg-black/50 border border-white/20 rounded-xl px-3 py-2 min-w-[52px] text-center">
              <span className="text-white font-black text-2xl tabular-nums leading-none">{pad(item.val)}</span>
            </div>
            <span className="text-white/50 text-[9px] font-bold mt-1 tracking-widest">{item.label}</span>
          </div>
          {i < 2 && <span className="text-white/70 font-black text-xl mb-4">:</span>}
        </div>
      ))}
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────
const DealOfTheDay = () => {
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        const res = await fetch(`${API_URL}/products/deal-of-day`);
        const data = await res.json();
        if (data.deal?.product) setDeal(data.deal);
      } catch {}
      finally { setLoading(false); }
    };
    fetchDeal();
  }, []);

  if (loading) return (
    <div className="mb-8 rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg,#1a0a3e,#2d1060)' }}>
      <div className="h-48 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );

  if (!deal) return null;

  const { product, dealPrice, endsAt } = deal;
  const originalPrice = product.originalPrice || product.sellingPrice;
  const discount = Math.round(((originalPrice - dealPrice) / originalPrice) * 100);
  const savings = originalPrice - dealPrice;

  return (
    <section className="mb-8">
      <div className="relative rounded-3xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#1a0a3e 0%,#2d1060 50%,#1a0a3e 100%)' }}>

        {/* Animated bg blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle,#C084FC,transparent)', animation: 'pulse 3s infinite' }} />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle,#6C3AE8,transparent)', animation: 'pulse 4s infinite' }} />
        </div>

        <div className="relative grid md:grid-cols-2 gap-0">

          {/* LEFT — Product Image */}
          <div className="relative flex items-center justify-center p-6 md:p-8">
            {/* Badge */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              <div className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-full animate-pulse shadow-lg">
                <Zap size={12} className="fill-white" /> DEAL OF THE DAY
              </div>
              <div className="bg-green-500 text-white text-sm font-black px-3 py-1.5 rounded-full shadow-lg">
                {discount}% OFF
              </div>
            </div>

            <Link to={`/product/${product._id}`}>
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl opacity-40 blur-xl"
                  style={{ background: 'linear-gradient(135deg,#6C3AE8,#C084FC)', transform: 'scale(0.9)' }} />
                <img
                  src={product.images?.[0]}
                  alt={product.name}
                  className="relative w-52 h-52 md:w-64 md:h-64 object-cover rounded-2xl border-2 border-purple-500/30 hover:scale-105 transition-transform duration-300 shadow-2xl"
                />
              </div>
            </Link>
          </div>

          {/* RIGHT — Deal Info */}
          <div className="flex flex-col justify-center px-6 pb-6 md:py-8 md:pr-8">

            {/* Category */}
            <p className="text-purple-300 text-xs font-bold uppercase tracking-widest mb-2">
              {product.category} {product.subCategory ? `› ${product.subCategory}` : ''}
            </p>

            {/* Name */}
            <Link to={`/product/${product._id}`}>
              <h3 className="text-white font-bold text-xl md:text-2xl leading-tight mb-2 hover:text-purple-300 transition line-clamp-2">
                {product.name}
              </h3>
            </Link>

            {/* Rating */}
            {product.averageRating > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1 bg-green-600 px-2 py-0.5 rounded-lg">
                  <Star size={11} className="fill-white text-white" />
                  <span className="text-white font-bold text-xs">{product.averageRating.toFixed(1)}</span>
                </div>
                <span className="text-white/50 text-xs">({product.totalReviews} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-end gap-3 mb-2">
              <span className="text-3xl md:text-4xl font-black text-white">₹{dealPrice}</span>
              <div className="flex flex-col mb-1">
                <span className="text-white/40 text-sm line-through">₹{originalPrice}</span>
                <span className="text-green-400 text-xs font-bold">Save ₹{savings}!</span>
              </div>
            </div>

            {/* Countdown */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={14} className="text-red-400" />
                <span className="text-red-400 text-xs font-bold uppercase tracking-wider">Ends in</span>
              </div>
              <Countdown endsAt={endsAt} />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => { addToCart({ ...product, sellingPrice: dealPrice }); toast.success('Deal cart mein add ho gaya! 🔥'); }}
                disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition active:scale-95 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#6C3AE8,#C084FC)', color: 'white' }}>
                <ShoppingCart size={16} /> Grab Deal
              </button>
              <Link to={`/product/${product._id}`}
                className="flex items-center justify-center gap-1 px-4 py-3 rounded-2xl border border-white/20 text-white text-sm font-semibold hover:border-white/50 transition">
                View <ArrowRight size={14} />
              </Link>
            </div>

            {/* Stock */}
            {product.stock <= 10 && product.stock > 0 && (
              <p className="text-red-400 text-xs font-semibold mt-3 flex items-center gap-1">
                ⚡ Only {product.stock} left at this price!
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DealOfTheDay;