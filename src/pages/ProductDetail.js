import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star, Heart, ShoppingCart, ChevronLeft, ChevronRight,
  Play, Check, Truck, RotateCcw, Shield, ThumbsUp, ThumbsDown,
  Package, MessageSquare, X, ChevronDown, ChevronUp,
  ArrowLeft, Zap, ZoomIn, Share2, MapPin, Ruler,
  AlertCircle, Clock, Copy, ExternalLink, Camera, Upload, Lock
} from 'lucide-react';
import { getProduct, getProducts, getReviews, addReview, markHelpful, markNotHelpful, checkCanReview } from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import toast from 'react-hot-toast';

// ─── COLOR VARIANTS ───────────────────────────────────────
const ColorVariants = ({ variants, currentId }) => {
  const navigate = useNavigate();
  if (!variants || variants.length === 0) return null;

  return (
    <div className="mb-5">
      <p className="text-gray-400 text-sm font-semibold mb-3 flex items-center gap-2">
        🎨 Also available in:
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        {/* Current product dot */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-8 h-8 rounded-full border-2 border-gold ring-2 ring-gold/30"
            style={{ backgroundColor: '#6C3AE8' }} />
          <span className="text-gold text-[10px] font-semibold">This</span>
        </div>

        {/* Variant dots */}
        {variants.map((v, i) => {
          const prod = v.productId;
          if (!prod?._id) return null;
          return (
            <button key={i} onClick={() => navigate(`/product/${prod._id}`)}
              className="flex flex-col items-center gap-1 group">
              <div className="relative w-8 h-8 rounded-full border-2 border-border group-hover:border-gold transition-all duration-200 group-hover:scale-110"
                style={{ backgroundColor: v.colorCode || '#888' }}>
                {prod.images?.[0] && (
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-16 h-16 rounded-xl overflow-hidden border-2 border-gold shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 pointer-events-none">
                    <img src={prod.images[0]} alt={v.color} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <span className="text-gray-400 text-[10px] group-hover:text-gold transition">{v.color}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─── STAR DISPLAY ────────────────────────────────────────
const StarDisplay = ({ rating, size = 14 }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map(i => (
      <Star key={i} size={size}
        className={i <= rating ? 'fill-gold text-gold' : 'text-gray-600'} />
    ))}
  </div>
);

// ─── STAR INPUT ──────────────────────────────────────────
const StarInput = ({ value, onChange }) => (
  <div className="flex items-center gap-1">
    {[1,2,3,4,5].map(i => (
      <button key={i} type="button" onClick={() => onChange(i)}>
        <Star size={28} className={i <= value ? 'fill-gold text-gold' : 'text-gray-600 hover:text-gold transition'} />
      </button>
    ))}
  </div>
);

// ─── SIZE SYSTEM ─────────────────────────────────────────
const SIZE_GUIDE = {
  clothing:  { label: 'Select Size', chart: [
    { size: 'XS', chest: '32"', waist: '26"', hip: '35"' },
    { size: 'S',  chest: '34"', waist: '28"', hip: '37"' },
    { size: 'M',  chest: '36"', waist: '30"', hip: '39"' },
    { size: 'L',  chest: '38"', waist: '32"', hip: '41"' },
    { size: 'XL', chest: '40"', waist: '34"', hip: '43"' },
    { size: 'XXL',chest: '42"', waist: '36"', hip: '45"' },
    { size: '3XL',chest: '44"', waist: '38"', hip: '47"' },
  ]},
  innerwear: { label: 'Select Size', chart: [
    { size: 'XS', chest: '28-30"' }, { size: 'S', chest: '30-32"' },
    { size: 'M',  chest: '32-34"' }, { size: 'L', chest: '34-36"' },
    { size: 'XL', chest: '36-38"' }, { size: 'XXL', chest: '38-40"' },
  ]},
  bra: { label: 'Select Bra Size', chart: [
    { size: '28A/B/C', underbust: '28"' }, { size: '30A/B/C/D', underbust: '30"' },
    { size: '32A/B/C/D', underbust: '32"' }, { size: '34A/B/C/D', underbust: '34"' },
    { size: '36B/C/D', underbust: '36"' },
  ]},
  bottom: { label: 'Select Waist Size', chart: [
    { size: '26', waist: '26"' }, { size: '28', waist: '28"' },
    { size: '30', waist: '30"' }, { size: '32', waist: '32"' },
    { size: '34', waist: '34"' }, { size: '36', waist: '36"' },
    { size: '38', waist: '38"' }, { size: '40', waist: '40"' },
  ]},
  footwear: { label: 'Select Size (UK)', chart: [
    { size: 'UK 4', eu: '37', cm: '23' }, { size: 'UK 5', eu: '38', cm: '24' },
    { size: 'UK 6', eu: '39', cm: '25' }, { size: 'UK 7', eu: '40', cm: '26' },
    { size: 'UK 8', eu: '41', cm: '27' }, { size: 'UK 9', eu: '42', cm: '28' },
    { size: 'UK 10', eu: '43', cm: '29' }, { size: 'UK 11', eu: '44', cm: '30' },
  ]},
  free: { label: 'Free Size', chart: [] },
  none: null,
};

// ─── SIZE CHART POPUP ─────────────────────────────────────
const SizeChartPopup = ({ sizeType, onClose }) => {
  const guide = SIZE_GUIDE[sizeType];
  if (!guide || !guide.chart?.length) return null;

  const getColumns = () => {
    if (sizeType === 'clothing') return ['Size', 'Chest', 'Waist', 'Hip'];
    if (sizeType === 'innerwear') return ['Size', 'Chest'];
    if (sizeType === 'bra') return ['Size', 'Underbust'];
    if (sizeType === 'bottom') return ['Size', 'Waist'];
    if (sizeType === 'footwear') return ['UK Size', 'EU', 'CM'];
    return ['Size'];
  };

  const getRow = (item) => {
    if (sizeType === 'clothing') return [item.size, item.chest, item.waist, item.hip];
    if (sizeType === 'innerwear') return [item.size, item.chest];
    if (sizeType === 'bra') return [item.size, item.underbust];
    if (sizeType === 'bottom') return [item.size, item.waist];
    if (sizeType === 'footwear') return [item.size, item.eu, item.cm + ' cm'];
    return [item.size];
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Ruler size={18} className="text-gold" /> Size Chart
          </h3>
          <button onClick={onClose} className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center hover:bg-border transition">
            <X size={16} className="text-gray-400" />
          </button>
        </div>
        <div className="p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {getColumns().map(col => (
                    <th key={col} className="text-gold font-bold py-2 px-3 text-left">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {guide.chart.map((item, i) => (
                  <tr key={i} className={`border-b border-border/50 ${i % 2 === 0 ? 'bg-secondary/50' : ''}`}>
                    {getRow(item).map((val, j) => (
                      <td key={j} className={`py-2.5 px-3 ${j === 0 ? 'text-white font-bold' : 'text-gray-300'}`}>{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-gray-500 text-xs mt-3">💡 Tip: Agar do sizes ke beech mein ho to bada size lo</p>
        </div>
      </div>
    </div>
  );
};

// ─── SIZE SELECTOR ────────────────────────────────────────
const SizeSelector = ({ product, selectedSize, onChange }) => {
  const [showChart, setShowChart] = useState(false);
  const sizeType = product?.sizeType || 'none';
  const availableSizes = product?.availableSizes || [];

  useEffect(() => {
    if (sizeType === 'free' && !selectedSize) onChange('Free Size');
  }, [sizeType]);

  if (!sizeType || sizeType === 'none') return null;
  if (availableSizes.length === 0 && sizeType !== 'free') return null;

  if (sizeType === 'free') {
    return (
      <div className="mb-5">
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2.5">
          <span className="text-green-400 text-sm font-semibold">✅ Free Size — One size fits all</span>
        </div>
      </div>
    );
  }

  const guide = SIZE_GUIDE[sizeType];
  const hasChart = guide?.chart?.length > 0;

  return (
    <>
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold text-sm">{guide?.label || 'Select Size'}</span>
            {!selectedSize && (
              <span className="text-red-400 text-xs bg-red-400/10 px-2 py-0.5 rounded-full animate-pulse">Required</span>
            )}
          </div>
          {hasChart && (
            <button onClick={() => setShowChart(true)}
              className="flex items-center gap-1.5 text-gold text-xs hover:underline">
              <Ruler size={12} /> Size Chart
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {availableSizes.map(size => (
            <button key={size} onClick={() => onChange(size)}
              className={`px-4 py-2 rounded-xl border font-medium text-sm transition-all ${
                selectedSize === size
                  ? 'bg-gold text-black border-gold font-bold scale-105 shadow-lg shadow-gold/20'
                  : 'border-border text-gray-300 hover:border-gold hover:text-white bg-secondary'
              }`}>
              {size}
            </button>
          ))}
        </div>
        {selectedSize && (
          <div className="mt-2 flex items-center gap-1.5">
            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center shrink-0">
              <Check size={10} className="text-white" />
            </div>
            <span className="text-green-400 text-xs">Selected: <strong>{selectedSize}</strong></span>
          </div>
        )}
      </div>
      {showChart && <SizeChartPopup sizeType={sizeType} onClose={() => setShowChart(false)} />}
    </>
  );
};

// ─── PINCODE CHECKER ─────────────────────────────────────
const PincodeChecker = () => {
  const [pincode, setPincode] = useState('');
  const [result, setResult] = useState(null);
  const [checking, setChecking] = useState(false);

  const check = () => {
    if (pincode.length !== 6) return toast.error('6 digit pincode daalo!');
    setChecking(true);
    setTimeout(() => {
      const days = Math.floor(Math.random() * 3) + 5;
      const date = new Date();
      date.setDate(date.getDate() + days);
      const dateStr = date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });
      setResult({ available: true, days, date: dateStr });
      setChecking(false);
    }, 800);
  };

  return (
    <div className="bg-secondary border border-border rounded-xl p-4 mb-5">
      <div className="flex items-center gap-2 mb-3">
        <MapPin size={16} className="text-gold" />
        <span className="text-white font-semibold text-sm">Check Delivery</span>
      </div>
      <div className="flex gap-2">
        <input value={pincode}
          onChange={e => { setPincode(e.target.value.replace(/\D/g, '').slice(0, 6)); setResult(null); }}
          onKeyDown={e => e.key === 'Enter' && check()}
          placeholder="Enter pincode"
          className="flex-1 bg-card border border-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold transition placeholder-gray-600" />
        <button onClick={check} disabled={checking}
          className="bg-gold text-black px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gold-light transition disabled:opacity-50">
          {checking ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : 'Check'}
        </button>
      </div>
      {result && (
        <div className="mt-3 flex items-start gap-2 text-sm text-green-400">
          <Check size={16} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Delivery available! 🎉</p>
            <p className="text-gray-400 text-xs mt-0.5">
              Expected by <span className="text-white font-medium">{result.date}</span> ({result.days}-7 days)
            </p>
            <p className="text-gray-400 text-xs">Cash on Delivery available</p>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── SHARE POPUP ──────────────────────────────────────────
const SharePopup = ({ product, onClose }) => {
  const url = window.location.href;
  const text = `Check out ${product.name} on Avio for just ₹${product.sellingPrice}!`;

  const shareOptions = [
    { label: 'WhatsApp', icon: '💬', color: 'bg-green-500/20 border-green-500/30 text-green-400', action: () => window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank') },
    { label: 'Copy Link', icon: '🔗', color: 'bg-blue-500/20 border-blue-500/30 text-blue-400', action: () => { navigator.clipboard.writeText(url); toast.success('Link copied!'); onClose(); } },
    { label: 'Twitter/X', icon: '🐦', color: 'bg-sky-500/20 border-sky-500/30 text-sky-400', action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank') },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end md:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold flex items-center gap-2"><Share2 size={18} className="text-gold" /> Share Product</h3>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <div className="flex items-center gap-3 bg-secondary rounded-xl p-3 mb-4">
          <img src={product.images?.[0]} alt={product.name} className="w-12 h-12 rounded-lg object-cover border border-border" />
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium line-clamp-1">{product.name}</p>
            <p className="text-gold text-sm font-bold">₹{product.sellingPrice}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {shareOptions.map(opt => (
            <button key={opt.label} onClick={opt.action}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition hover:scale-105 ${opt.color}`}>
              <span className="text-2xl">{opt.icon}</span>
              <span className="text-xs font-semibold">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── STOCK URGENCY ────────────────────────────────────────
const StockUrgency = ({ stock }) => {
  if (stock <= 0) return (
    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 mb-4">
      <AlertCircle size={16} className="text-red-400 shrink-0" />
      <span className="text-red-400 text-sm font-semibold">Out of Stock</span>
    </div>
  );
  if (stock <= 5) return (
    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 mb-4 animate-pulse">
      <AlertCircle size={16} className="text-red-400 shrink-0" />
      <span className="text-red-400 text-sm font-semibold">Only {stock} left! Order now 🔥</span>
    </div>
  );
  if (stock <= 15) return (
    <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-2.5 mb-4">
      <Clock size={16} className="text-yellow-400 shrink-0" />
      <span className="text-yellow-400 text-sm font-semibold">Hurry! Only {stock} items remaining</span>
    </div>
  );
  return (
    <div className="flex items-center gap-2 mb-4">
      <Check size={14} className="text-green-400" />
      <span className="text-green-400 text-sm font-medium">In Stock ({stock} available)</span>
    </div>
  );
};

// ─── RECENTLY VIEWED ─────────────────────────────────────
const useRecentlyViewed = (currentProduct) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!currentProduct) return;
    const key = user ? `crownbay_recent_${user._id || user.email}` : 'crownbay_recent_guest';
    try {
      const saved = JSON.parse(localStorage.getItem(key) || '[]');
      const filtered = saved.filter(p => p._id !== currentProduct._id).slice(0, 8);
      setItems(filtered);
      const updated = [{ _id: currentProduct._id, name: currentProduct.name, images: currentProduct.images, sellingPrice: currentProduct.sellingPrice, originalPrice: currentProduct.originalPrice }, ...filtered].slice(0, 10);
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {}
  }, [currentProduct?._id, user?._id]);

  return items;
};

// ─── MEDIA SLIDER ─────────────────────────────────────────
const MediaSlider = ({ images = [], video = null }) => {
  const [current, setCurrent] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [lightbox, setLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [lastDist, setLastDist] = useState(null);
  const imgRef = useRef(null);

  const media = [...images.map(src => ({ type: 'image', src })), ...(video ? [{ type: 'video', src: video }] : [])];

  const getTouchDist = (touches) => { const dx = touches[0].clientX - touches[1].clientX; const dy = touches[0].clientY - touches[1].clientY; return Math.sqrt(dx * dx + dy * dy); };
  const handleTouchStart = (e) => { if (e.touches.length === 2) setLastDist(getTouchDist(e.touches)); };
  const handleTouchMove = (e) => { if (e.touches.length === 2 && lastDist) { const newDist = getTouchDist(e.touches); setScale(s => Math.min(Math.max(s * (newDist / lastDist), 1), 3)); setLastDist(newDist); } };
  const handleTouchEnd = () => { setLastDist(null); if (scale < 1.1) setScale(1); };
  const handleMouseMove = (e) => { if (!imgRef.current) return; const rect = imgRef.current.getBoundingClientRect(); setZoomPos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 }); };
  const openLightbox = (i) => { setLightboxIndex(i); setLightbox(true); document.body.style.overflow = 'hidden'; };
  const closeLightbox = () => { setLightbox(false); document.body.style.overflow = ''; };

  useEffect(() => {
    if (!lightbox) return;
    const handler = (e) => {
      if (e.key === 'ArrowRight') setLightboxIndex(i => (i + 1) % media.length);
      if (e.key === 'ArrowLeft') setLightboxIndex(i => (i - 1 + media.length) % media.length);
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox, media.length]);

  if (media.length === 0) return (
    <div className="w-full aspect-square bg-card rounded-2xl flex items-center justify-center">
      <Package size={60} className="text-gray-600" />
    </div>
  );

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="relative rounded-2xl overflow-hidden bg-card border border-border" style={{ aspectRatio: '4/5' }}>
          {media[current].type === 'video' ? (
            <video src={media[current].src} controls className="w-full h-full object-contain" />
          ) : (
            <div ref={imgRef} className="w-full h-full relative overflow-hidden cursor-zoom-in"
              onMouseMove={handleMouseMove} onMouseEnter={() => setZoomed(true)} onMouseLeave={() => setZoomed(false)}
              onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
              onClick={() => openLightbox(current)}>
              <img src={media[current].src} alt="product"
                className="w-full h-full object-contain select-none transition-transform duration-100"
                style={zoomed ? { transform: 'scale(2.2)', transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }
                  : scale > 1 ? { transform: `scale(${scale})`, transformOrigin: 'center center' } : {}}
                draggable={false} />
              {zoomed && (
                <div className="hidden md:block absolute w-24 h-24 rounded-full border-2 border-gold pointer-events-none opacity-60"
                  style={{ left: `calc(${zoomPos.x}% - 48px)`, top: `calc(${zoomPos.y}% - 48px)`, background: 'rgba(192,160,96,0.1)' }} />
              )}
            </div>
          )}
          {media.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); setCurrent(c => (c - 1 + media.length) % media.length); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm z-10 hover:bg-black/70 transition">
                <ChevronLeft size={18} className="text-white" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); setCurrent(c => (c + 1) % media.length); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm z-10 hover:bg-black/70 transition">
                <ChevronRight size={18} className="text-white" />
              </button>
            </>
          )}
          <div className="absolute top-3 left-3 z-10">
            <div className="hidden md:flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full"><ZoomIn size={10} /> Hover to zoom</div>
            <div className="md:hidden flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">Pinch to zoom</div>
          </div>
          <button onClick={() => openLightbox(current)}
            className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-black/70 transition z-10">
            <ZoomIn size={14} className="text-white" />
          </button>
          {media.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {media.map((_, i) => (
                <button key={i} onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                  className={`rounded-full transition-all ${i === current ? 'w-5 h-1.5 bg-gold' : 'w-1.5 h-1.5 bg-white/50'}`} />
              ))}
            </div>
          )}
        </div>
        {media.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {media.map((m, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === current ? 'border-gold shadow-lg shadow-gold/20' : 'border-border hover:border-gold/50'}`}>
                {m.type === 'video'
                  ? <div className="w-full h-full bg-card flex items-center justify-center"><Play size={20} className="text-gold" /></div>
                  : <img src={m.src} alt="" className="w-full h-full object-cover" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center" onClick={closeLightbox}>
          <button onClick={closeLightbox} className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition z-10">
            <X size={20} className="text-white" />
          </button>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
            {lightboxIndex + 1} / {media.length}
          </div>
          <div className="max-w-4xl max-h-screen w-full px-16" onClick={e => e.stopPropagation()}>
            {media[lightboxIndex].type === 'video'
              ? <video src={media[lightboxIndex].src} controls className="w-full max-h-[80vh] object-contain" />
              : <img src={media[lightboxIndex].src} alt="product" className="w-full max-h-[85vh] object-contain select-none" />}
          </div>
          {media.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => (i - 1 + media.length) % media.length); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition">
                <ChevronLeft size={24} className="text-white" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => (i + 1) % media.length); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition">
                <ChevronRight size={24} className="text-white" />
              </button>
            </>
          )}
          {media.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {media.map((m, i) => (
                <button key={i} onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition ${i === lightboxIndex ? 'border-gold' : 'border-white/20'}`}>
                  {m.type === 'video'
                    ? <div className="w-full h-full bg-gray-800 flex items-center justify-center"><Play size={14} className="text-gold" /></div>
                    : <img src={m.src} alt="" className="w-full h-full object-cover" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

// ─── REVIEW CARD ─────────────────────────────────────────
const ReviewCard = ({ review, onHelpful, onNotHelpful }) => {
  const [helpfulClicked, setHelpfulClicked] = useState(false);
  const [notHelpfulClicked, setNotHelpfulClicked] = useState(false);
  const [localHelpful, setLocalHelpful] = useState(review.helpful || 0);
  const [localNotHelpful, setLocalNotHelpful] = useState(review.notHelpful || 0);

  const handleHelpful = async () => {
    if (helpfulClicked || review.isFixed) return;
    setHelpfulClicked(true);
    setLocalHelpful(p => p + 1);
    if (onHelpful) onHelpful(review._id);
  };

  const handleNotHelpful = async () => {
    if (notHelpfulClicked || review.isFixed) return;
    setNotHelpfulClicked(true);
    setLocalNotHelpful(p => p + 1);
    if (onNotHelpful) onNotHelpful(review._id);
  };

  return (
    <div className="bg-secondary border border-border rounded-2xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 border border-gold/30 flex items-center justify-center text-gold font-bold">
            {review.userInitial || review.userName?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold text-sm">{review.userName}</span>
              {review.isVerifiedPurchase && (
                <span className="flex items-center gap-1 text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full border border-green-400/20">
                  <Check size={10} /> Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <StarDisplay rating={review.rating} size={12} />
              <span className="text-gray-500 text-xs">
                {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-lg text-xs font-bold ${
          review.rating >= 4 ? 'bg-green-500/20 text-green-400' :
          review.rating === 3 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
        }`}>{review.rating}★</div>
      </div>

      {review.title && <p className="text-white font-semibold text-sm mb-1">{review.title}</p>}
      <p className="text-gray-300 text-sm leading-relaxed mb-3">{review.comment}</p>

      {/* Review Photos */}
      {review.photos?.length > 0 && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {review.photos.map((photo, i) => (
            <a key={i} href={photo} target="_blank" rel="noreferrer">
              <img src={photo} alt="" className="w-16 h-16 rounded-xl object-cover border border-border hover:border-gold transition" />
            </a>
          ))}
        </div>
      )}

      {review.adminReply && (
        <div className="bg-gold/5 border border-gold/20 rounded-xl p-3 mb-3">
          <p className="text-gold text-xs font-bold mb-1">👑 Avio Response</p>
          <p className="text-gray-300 text-sm">{review.adminReply}</p>
        </div>
      )}

      <div className="flex items-center gap-3 pt-2 border-t border-border">
        <span className="text-gray-500 text-xs">Helpful?</span>
        <button onClick={handleHelpful}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition ${
            helpfulClicked ? 'bg-green-500/20 border-green-500/30 text-green-400' : 'border-border text-gray-400 hover:border-gold hover:text-gold'
          }`}>
          <ThumbsUp size={12} /> {localHelpful}
        </button>
        <button onClick={handleNotHelpful}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition ${
            notHelpfulClicked ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'border-border text-gray-400 hover:border-red-400 hover:text-red-400'
          }`}>
          <ThumbsDown size={12} /> {localNotHelpful}
        </button>
      </div>
    </div>
  );
};

// ─── THANK YOU POPUP ─────────────────────────────────────
const ThankYouPopup = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-card border border-gold/30 rounded-3xl p-8 max-w-sm w-full text-center">
      <div className="w-20 h-20 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-4xl">🙏</span>
      </div>
      <h3 className="text-white text-xl font-bold mb-2">Shukriya!</h3>
      <p className="text-gray-400 mb-2">Aapka review submit ho gaya!</p>
      <p className="text-gold text-sm mb-6">Aapki feedback se doosre customers ko madad milegi. Avio pe shopping karne ke liye bahut bahut dhanyawad! 👑</p>
      <button onClick={onClose} className="w-full bg-gold text-black py-3 rounded-xl font-bold hover:bg-gold-light transition">Done</button>
    </div>
  </div>
);

// ─── MAIN PRODUCT DETAIL ─────────────────────────────────
const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [descExpanded, setDescExpanded] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [reviewsExpanded, setReviewsExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [showShare, setShowShare] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 0, title: '', comment: '' });
  const [reviewImages, setReviewImages] = useState([]);
  const [reviewPreviews, setReviewPreviews] = useState([]);

  // ── Can Review check ──
  const [canReview, setCanReview] = useState(null); // null=loading, true/false
  const [hasReviewed, setHasReviewed] = useState(false);
  const fileRef = useRef();

  const recentlyViewed = useRecentlyViewed(product);

  useEffect(() => { window.scrollTo(0, 0); fetchAll(); }, [id]);

  useEffect(() => {
    if (user && id) {
      checkCanReview(id).then(res => {
        setCanReview(res.data.canReview);
        setHasReviewed(res.data.hasReviewed);
      }).catch(() => setCanReview(false));
    } else {
      setCanReview(null);
    }
  }, [user, id]);

  const fetchAll = async () => {
    setLoading(true);
    setSelectedSize('');
    try {
      const { data } = await getProduct(id);
      setProduct(data.product);
      const simRes = await getProducts({ category: data.product.category, limit: 6 });
      setSimilarProducts(simRes.data.products.filter(p => p._id !== id).slice(0, 5));
      const revRes = await getReviews(id);
      setReviews(revRes.data.reviews);
      setReviewStats({ avg: revRes.data.avgRating, total: revRes.data.totalReviews, breakdown: revRes.data.ratingBreakdown });
    } catch {
      toast.error('Product load nahi hua!');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    const needsSize = product.sizeType && product.sizeType !== 'none' && product.sizeType !== 'free';
    if (needsSize && !selectedSize) return toast.error('Pehle size select karo! 👆');
    const productWithSize = selectedSize ? { ...product, selectedSize } : product;
    for (let i = 0; i < qty; i++) addToCart(productWithSize);
    toast.success(`${qty} item${qty > 1 ? 's' : ''} cart mein add ho gaye! 🛒`);
  };

  const handleBuyNow = () => {
    const needsSize = product.sizeType && product.sizeType !== 'none' && product.sizeType !== 'free';
    if (needsSize && !selectedSize) return toast.error('Pehle size select karo! 👆');
    handleAddToCart();
    navigate('/cart');
  };

  const handleReviewImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    setReviewImages(files);
    setReviewPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleSubmitReview = async () => {
    if (!user) return toast.error('Pehle login karo!');
    if (reviewForm.rating === 0) return toast.error('Rating do!');
    if (!reviewForm.comment.trim()) return toast.error('Review likho!');
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('rating', reviewForm.rating);
      formData.append('title', reviewForm.title);
      formData.append('comment', reviewForm.comment);
      reviewImages.forEach(img => formData.append('photos', img));
      await addReview(id, formData);
      setShowReviewForm(false);
      setShowThankYou(true);
      setReviewForm({ rating: 0, title: '', comment: '' });
      setReviewImages([]);
      setReviewPreviews([]);
      setCanReview(false);
      setHasReviewed(true);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Review submit nahi hua!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpful = async (reviewId) => { try { await markHelpful(reviewId); } catch {} };
  const handleNotHelpful = async (reviewId) => { try { await markNotHelpful(reviewId); } catch {} };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="text-center py-20">
      <p className="text-white">Product nahi mila!</p>
      <Link to="/products" className="text-gold mt-2 inline-block">← Wapas jao</Link>
    </div>
  );

  const discount = product.originalPrice > product.sellingPrice
    ? Math.round(((product.originalPrice - product.sellingPrice) / product.originalPrice) * 100) : 0;
  const visibleReviews = reviewsExpanded ? reviews : reviews.slice(0, 3);

  // Review button logic
  const reviewButtonContent = () => {
    if (!user) return { text: 'Login to Review', disabled: false, onClick: () => navigate('/login') };
    if (hasReviewed) return { text: '✅ Already Reviewed', disabled: true, onClick: () => {} };
    if (canReview === false) return { text: '🔒 Buy to Review', disabled: true, onClick: () => {} };
    return { text: '⭐ Write a Review', disabled: false, onClick: () => setShowReviewForm(!showReviewForm) };
  };
  const reviewBtn = reviewButtonContent();

  return (
    <div className="min-h-screen bg-primary pb-24 md:pb-0">
      {/* Back + Share */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-gold transition text-sm">
          <ArrowLeft size={16} /> Back
        </button>
        <button onClick={() => setShowShare(true)}
          className="flex items-center gap-2 text-gray-400 hover:text-gold transition text-sm border border-border px-3 py-1.5 rounded-lg hover:border-gold">
          <Share2 size={14} /> Share
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Image + Info */}
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          <div className="md:sticky md:top-24 h-fit">
            <MediaSlider images={product.images} video={product.video} />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-gold text-xs font-bold uppercase tracking-wider">{product.category}</span>
              {product.isNewArrival && <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">NEW</span>}
              {product.isTrending && <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">🔥 Trending</span>}
              {product.isFeatured && <span className="bg-purple-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">⭐ Featured</span>}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">{product.name}</h1>

            {reviewStats && (
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1.5 bg-green-600 px-3 py-1 rounded-lg">
                  <span className="text-white font-bold text-sm">{reviewStats.avg}</span>
                  <Star size={14} className="fill-white text-white" />
                </div>
                <span className="text-gray-400 text-sm">{reviewStats.total} reviews</span>
                <span className="text-gray-600">|</span>
                <span className="text-gray-400 text-sm">{Math.max(product.totalSold || 0, 50)}+ sold</span>
              </div>
            )}

            <div className="flex items-end gap-3 mb-2">
              <span className="text-3xl font-bold text-gold">₹{product.sellingPrice}</span>
              {product.originalPrice > product.sellingPrice && (
                <>
                  <span className="text-gray-500 text-lg line-through">₹{product.originalPrice}</span>
                  <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full text-sm font-bold">{discount}% OFF</span>
                </>
              )}
            </div>
            {product.originalPrice > product.sellingPrice && (
              <p className="text-green-400 text-sm mb-4">🎉 You save ₹{product.originalPrice - product.sellingPrice}!</p>
            )}
              <ColorVariants variants={product.variants} currentId={product._id} />
            <StockUrgency stock={product.stock} />
            <SizeSelector product={product} selectedSize={selectedSize} onChange={setSelectedSize} />

            <div className="flex items-center gap-3 mb-5">
              <span className="text-gray-400 text-sm">Quantity:</span>
              <div className="flex items-center bg-secondary border border-border rounded-xl overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center text-white hover:bg-card transition text-lg">−</button>
                <span className="w-10 text-center text-white font-semibold">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="w-10 h-10 flex items-center justify-center text-white hover:bg-card transition text-lg">+</button>
              </div>
            </div>

            <div className="flex gap-3 mb-5">
              <button onClick={handleAddToCart} disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 bg-gold text-black py-3.5 rounded-xl font-bold hover:bg-gold-light transition disabled:opacity-50">
                <ShoppingCart size={18} /> Add to Cart
              </button>
              <button onClick={handleBuyNow} disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 bg-secondary border border-gold text-gold py-3.5 rounded-xl font-bold hover:bg-gold/10 transition disabled:opacity-50">
                <Zap size={18} /> Buy Now
              </button>
              <button onClick={() => {
                if (!user) { toast.error('Wishlist ke liye pehle login karo!'); return; }
                const added = toggleWishlist(product);
                toast.success(added ? '❤️ Wishlist mein add ho gaya!' : '💔 Wishlist se hata diya');
              }}
                className={`w-12 h-12 rounded-xl border flex items-center justify-center transition ${isWishlisted(product._id) ? 'bg-red-500/20 border-red-500/50' : 'border-border hover:border-red-400'}`}>
                <Heart size={18} className={isWishlisted(product._id) ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
              </button>
            </div>

            <PincodeChecker />

            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Truck, text: 'Free Delivery', sub: 'Above ₹499' },
                { icon: RotateCcw, text: 'Easy Returns', sub: '7 day policy' },
                { icon: Shield, text: 'COD Available', sub: 'Pay on delivery' },
              ].map(b => (
                <div key={b.text} className="bg-secondary border border-border rounded-xl p-3 text-center">
                  <b.icon size={18} className="text-gold mx-auto mb-1" />
                  <p className="text-white text-xs font-semibold">{b.text}</p>
                  <p className="text-gray-500 text-xs">{b.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-10">
          <div className="flex gap-1 border-b border-border mb-5 overflow-x-auto">
            {['description', 'details', 'shipping'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-semibold capitalize whitespace-nowrap border-b-2 transition ${
                  activeTab === tab ? 'border-gold text-gold' : 'border-transparent text-gray-400 hover:text-white'
                }`}>
                {tab === 'description' ? 'Description' : tab === 'details' ? 'Product Details' : 'Delivery & Returns'}
              </button>
            ))}
          </div>

          {activeTab === 'description' && (
            <div>
              <button onClick={() => setDescExpanded(e => !e)}
                className="w-full flex items-center justify-between bg-secondary border border-border rounded-xl px-5 py-4 hover:border-gold/50 transition group mb-3">
                <span className="text-white font-semibold text-sm group-hover:text-gold transition">Product Description</span>
                <div className={`w-7 h-7 rounded-lg bg-card border border-border flex items-center justify-center transition-all duration-300 ${descExpanded ? 'rotate-180 border-gold' : ''}`}>
                  <ChevronDown size={16} className={descExpanded ? 'text-gold' : 'text-gray-400'} />
                </div>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${descExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="bg-secondary border border-border rounded-xl px-5 py-4 mb-3">
                  <p className="text-gray-300 leading-relaxed">{product.description}</p>
                  {product.features?.length > 0 && (
                    <ul className="space-y-2 mt-4">
                      {product.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                          <Check size={16} className="text-gold mt-0.5 shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { label: 'Category', value: product.category },
                { label: 'Brand', value: product.brand || 'Avio' },
                { label: 'SKU', value: product._id?.slice(-8).toUpperCase() },
                { label: 'Stock', value: `${product.stock} units` },
                { label: 'Available Sizes', value: product.availableSizes?.join(', ') || 'N/A' },
                { label: 'Tags', value: product.tags?.join(', ') || 'N/A' },
              ].map(d => (
                <div key={d.label} className="flex items-center gap-3 bg-secondary border border-border rounded-xl px-4 py-3">
                  <span className="text-gray-500 text-sm w-28 shrink-0">{d.label}</span>
                  <span className="text-white text-sm font-medium">{d.value}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-4">
              {[
                { icon: Truck, title: 'Free Delivery', desc: 'Orders above ₹499. Standard delivery in 5-7 business days.' },
                { icon: RotateCcw, title: '7-Day Returns', desc: 'Easy returns within 7 days if you are not satisfied.' },
                { icon: Shield, title: 'Cash on Delivery', desc: 'Pay when your order arrives at your doorstep.' },
                { icon: Package, title: 'Secure Packaging', desc: 'All products are packed securely to prevent damage.' },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-4 bg-secondary border border-border rounded-xl p-4">
                  <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center shrink-0">
                    <item.icon size={20} className="text-gold" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{item.title}</p>
                    <p className="text-gray-400 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Zap size={20} className="text-gold fill-gold" /> Similar Products
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {similarProducts.map(p => {
                const disc = p.originalPrice > p.sellingPrice ? Math.round(((p.originalPrice - p.sellingPrice) / p.originalPrice) * 100) : 0;
                return (
                  <Link key={p._id} to={`/product/${p._id}`}
                    className="shrink-0 w-40 bg-card border border-border rounded-xl overflow-hidden hover:border-gold transition">
                    <div className="relative">
                      <img src={p.images[0]} alt={p.name} className="w-full h-44 object-cover" />
                      {disc > 0 && <span className="absolute top-1 left-1 bg-gold text-black text-xs font-bold px-1.5 py-0.5 rounded-full">{disc}% off</span>}
                    </div>
                    <div className="p-2.5">
                      <p className="text-white text-xs font-medium line-clamp-2 mb-1">{p.name}</p>
                      <p className="text-gold font-bold text-sm">₹{p.sellingPrice}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Clock size={20} className="text-gold" /> Recently Viewed
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {recentlyViewed.map(p => (
                <Link key={p._id} to={`/product/${p._id}`}
                  className="shrink-0 w-36 bg-card border border-border rounded-xl overflow-hidden hover:border-gold/50 transition opacity-80 hover:opacity-100">
                  <img src={p.images?.[0]} alt={p.name} className="w-full h-40 object-cover" />
                  <div className="p-2.5">
                    <p className="text-white text-xs font-medium line-clamp-2 mb-1">{p.name}</p>
                    <p className="text-gold font-bold text-sm">₹{p.sellingPrice}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Reviews */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <MessageSquare size={20} className="text-gold" /> Customer Reviews
            </h2>
            <button onClick={reviewBtn.onClick} disabled={reviewBtn.disabled}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                reviewBtn.disabled
                  ? 'bg-secondary border border-border text-gray-500 cursor-not-allowed'
                  : 'bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20'
              }`}>
              {hasReviewed ? <Check size={14} /> : canReview === false && user ? <Lock size={14} /> : <Star size={14} />}
              {reviewBtn.text}
            </button>
          </div>

          {reviewStats && (
            <div className="bg-secondary border border-border rounded-2xl p-5 mb-5">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center justify-center min-w-32">
                  <span className="text-6xl font-bold text-gold">{reviewStats.avg}</span>
                  <StarDisplay rating={Math.round(reviewStats.avg)} size={18} />
                  <span className="text-gray-400 text-sm mt-1">{reviewStats.total} reviews</span>
                </div>
                <div className="flex-1 space-y-2">
                  {reviewStats.breakdown.map(b => (
                    <div key={b.star} className="flex items-center gap-3">
                      <span className="text-gray-400 text-xs w-4">{b.star}</span>
                      <Star size={12} className="text-gold fill-gold shrink-0" />
                      <div className="flex-1 bg-card rounded-full h-2 overflow-hidden">
                        <div className="bg-gold h-full rounded-full transition-all duration-700" style={{ width: `${b.percent}%` }} />
                      </div>
                      <span className="text-gray-400 text-xs w-8 text-right">{b.percent}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Review Form — with image upload */}
          {showReviewForm && canReview && (
            <div className="bg-secondary border border-gold/30 rounded-2xl p-5 mb-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-bold">Write Your Review</h4>
                <button onClick={() => setShowReviewForm(false)}><X size={18} className="text-gray-400" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Your Rating *</label>
                  <StarInput value={reviewForm.rating} onChange={v => setReviewForm({ ...reviewForm, rating: v })} />
                  {reviewForm.rating > 0 && (
                    <p className="text-gold text-xs mt-1">
                      {['', 'Bahut Kharaab 😞', 'Kharaab 😕', 'Theek Hai 😐', 'Accha 😊', 'Zabardast! 🤩'][reviewForm.rating]}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-1.5 block">Review Title</label>
                  <input value={reviewForm.title} onChange={e => setReviewForm({ ...reviewForm, title: e.target.value })}
                    placeholder="Ek line mein summary..."
                    className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold transition" />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-1.5 block">Your Review *</label>
                  <textarea value={reviewForm.comment} onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    placeholder="Product ke baare mein apna experience share karo..."
                    rows={4}
                    className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold transition resize-none" />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="text-gray-400 text-sm mb-2 block flex items-center gap-1">
                    <Camera size={14} /> Photos add karo (optional, max 3)
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {reviewPreviews.map((p, i) => (
                      <div key={i} className="relative w-20 h-20">
                        <img src={p} alt="" className="w-full h-full object-cover rounded-xl border border-border" />
                        <button onClick={() => { setReviewImages(imgs => imgs.filter((_, j) => j !== i)); setReviewPreviews(ps => ps.filter((_, j) => j !== i)); }}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <X size={10} className="text-white" />
                        </button>
                      </div>
                    ))}
                    {reviewPreviews.length < 3 && (
                      <button onClick={() => fileRef.current?.click()}
                        className="w-20 h-20 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-1 hover:border-gold transition">
                        <Upload size={18} className="text-gray-500" />
                        <span className="text-gray-600 text-xs">Upload</span>
                      </button>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleReviewImages} />
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setShowReviewForm(false)}
                    className="flex-1 border border-border text-gray-300 py-2.5 rounded-xl text-sm hover:border-gold transition">Cancel</button>
                  <button onClick={handleSubmitReview} disabled={submitting}
                    className="flex-1 bg-gold text-black py-2.5 rounded-xl text-sm font-bold hover:bg-gold-light transition disabled:opacity-50 flex items-center justify-center gap-2">
                    {submitting
                      ? <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Submitting...</>
                      : <><Check size={16} /> Submit Review</>}
                  </button>
                </div>
              </div>
            </div>
          )}

          {reviews.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <MessageSquare size={40} className="mx-auto mb-3 opacity-50" />
              <p>Abhi koi review nahi hai. Pehle review do!</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {visibleReviews.map((review, i) => (
                  <ReviewCard key={review._id || i} review={review} onHelpful={handleHelpful} onNotHelpful={handleNotHelpful} />
                ))}
              </div>
              {reviews.length > 3 && (
                <button onClick={() => setReviewsExpanded(!reviewsExpanded)}
                  className="w-full mt-4 flex items-center justify-center gap-2 border border-border text-gray-300 py-3 rounded-xl hover:border-gold hover:text-gold transition text-sm font-medium">
                  {reviewsExpanded ? <><ChevronUp size={16} /> Show Less</> : <><ChevronDown size={16} /> Show All {reviews.length} Reviews</>}
                </button>
              )}
            </>
          )}
        </section>
      </div>

      {/* Mobile sticky bottom */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 bg-secondary border-t border-border px-4 py-3 flex gap-3 z-40">
        <button onClick={handleAddToCart} disabled={product.stock === 0}
          className="flex-1 flex items-center justify-center gap-2 bg-gold text-black py-3 rounded-xl font-bold text-sm disabled:opacity-50">
          <ShoppingCart size={16} /> Add to Cart
        </button>
        <button onClick={handleBuyNow} disabled={product.stock === 0}
          className="flex-1 flex items-center justify-center gap-2 border border-gold text-gold py-3 rounded-xl font-bold text-sm disabled:opacity-50">
          <Zap size={16} /> Buy Now
        </button>
      </div>

      {showThankYou && <ThankYouPopup onClose={() => setShowThankYou(false)} />}
      {showShare && product && <SharePopup product={product} onClose={() => setShowShare(false)} />}
    </div>
  );
};

export default ProductDetail;