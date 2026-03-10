import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag, Zap, Star, ArrowRight, ChevronLeft, ChevronRight,
  TrendingUp, Shield, Truck, RotateCcw, Headphones, Tag, Clock, Heart
} from 'lucide-react';
import { getFeatured, getTrending, getProducts } from '../utils/api';
import { useCart } from '../context/CartContext';
import WishlistButton from '../components/WishlistButton';
import toast from 'react-hot-toast';
import FlashSaleBanner from '../components/FlashSaleBanner';

// ─── PRODUCT CARD ─────────────────────────────────────────
const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const discount = product.originalPrice > product.sellingPrice
    ? Math.round(((product.originalPrice - product.sellingPrice) / product.originalPrice) * 100) : 0;
  const outOfStock = product.stock === 0;
  const lowStock = product.stock > 0 && product.stock <= 5;
  const isHot = product.purchaseCount >= 10;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden group relative hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5">
      <Link to={`/product/${product._id}`}>
        <div className="relative overflow-hidden">
          <img src={product.images[0]} alt={product.name}
            className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount >= 40 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg animate-pulse">🔥 {discount}% OFF</span>}
            {discount > 0 && discount < 40 && <span className="text-white text-xs font-bold px-2 py-0.5 rounded-full shadow" style={{ background: 'linear-gradient(135deg,#6C3AE8,#C084FC)' }}>{discount}% OFF</span>}
            {product.isNewArrival && !discount && <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">✨ NEW</span>}
            {isHot && <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">🔥 HOT</span>}
          </div>
          {outOfStock && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><span className="bg-red-500 text-white text-sm font-bold px-4 py-1.5 rounded-full">Out of Stock</span></div>}
          {lowStock && <div className="absolute bottom-10 left-0 right-0 flex justify-center"><span className="bg-red-500/90 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">⚡ Only {product.stock} left!</span></div>}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-3">
            <button onClick={(e) => { e.preventDefault(); if (!outOfStock) { addToCart(product); toast.success('Cart mein add ho gaya! 🛒'); }}}
              disabled={outOfStock}
              className="w-full text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg,#6C3AE8,#C084FC)' }}>Quick Add</button>
          </div>
        </div>
        <div className="p-3">
          <p className="text-gray-400 text-xs mb-0.5">{product.category}</p>
          <p className="text-white text-sm font-medium line-clamp-2">{product.name}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-purple-400 font-bold">₹{product.sellingPrice}</span>
            {product.originalPrice > product.sellingPrice && <span className="text-gray-500 text-xs line-through">₹{product.originalPrice}</span>}
            {discount >= 40 && <span className="text-red-400 text-xs font-semibold">Big Deal!</span>}
          </div>
          {product.averageRating > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <div className="flex items-center gap-1 bg-green-600 px-1.5 py-0.5 rounded text-white text-xs">
                <Star size={10} className="fill-white" />{product.averageRating.toFixed(1)}
              </div>
              <span className="text-gray-500 text-xs">({product.totalReviews})</span>
            </div>
          )}
        </div>
      </Link>
      <WishlistButton product={product} className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full backdrop-blur-sm" size={14} />
      <div className="px-3 pb-3">
        <button onClick={() => { if (!outOfStock) { addToCart(product); toast.success('Cart mein add ho gaya! 🛒'); }}}
          disabled={outOfStock}
          className="w-full py-2 rounded-xl text-xs font-semibold transition disabled:opacity-40 border border-purple-500/30 text-purple-400 hover:bg-purple-500/10">
          {outOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

// ─── 1. MARQUEE TICKER ────────────────────────────────────
const MarqueeTicker = () => {
  const items = [
    '🚚 Free Delivery on orders above ₹499',
    '⚡ Flash Sale — 40% OFF with code FLASH40',
    '✨ New Arrivals Every Week',
    '🏆 Top Rated Products — Curated Just For You',
    '💵 Cash on Delivery Available',
    '🔒 100% Secure Shopping',
    '🎁 Special Offers for Members',
    '⭐ 10,000+ Happy Customers',
  ];
  return (
    <div className="overflow-hidden py-2 mb-6 border-y border-border bg-secondary/50">
      <div className="flex gap-8 animate-marquee whitespace-nowrap"
        style={{ animation: 'marquee 30s linear infinite' }}>
        {[...items, ...items].map((item, i) => (
          <span key={i} className="text-xs font-medium text-gray-300 flex items-center gap-2 shrink-0">
            <span className="w-1 h-1 rounded-full bg-purple-400 shrink-0" />
            {item}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

// ─── 2. STORY CIRCLES ─────────────────────────────────────
const storyData = [
  { name: 'New In', emoji: '✨', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=200&q=80', link: '/products?sort=newest', gradient: 'from-purple-500 to-pink-500' },
  { name: 'Women', emoji: '👗', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&q=80', link: '/products?category=Women', gradient: 'from-pink-500 to-rose-500' },
  { name: 'Men', emoji: '👔', image: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=200&q=80', link: '/products?category=Men', gradient: 'from-blue-500 to-cyan-500' },
  { name: 'Beauty', emoji: '💄', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&q=80', link: '/products?category=Beauty', gradient: 'from-red-500 to-pink-500' },
  { name: 'Sale', emoji: '🔥', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200&q=80', link: '/products?sort=price_low', gradient: 'from-orange-500 to-red-500' },
  { name: 'Shoes', emoji: '👟', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80', link: '/products?category=Footwear', gradient: 'from-green-500 to-teal-500' },
  { name: 'Sports', emoji: '🏋️', image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=200&q=80', link: '/products?category=Sports+%26+Fitness', gradient: 'from-yellow-500 to-orange-500' },
  { name: 'Trending', emoji: '📈', image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=200&q=80', link: '/products?sort=popular', gradient: 'from-purple-600 to-indigo-600' },
];

const StoryCircles = () => (
  <section className="mb-8">
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide px-1">
      {storyData.map((story, i) => (
        <Link key={i} to={story.link} className="flex flex-col items-center gap-2 shrink-0 group">
          <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full p-0.5 bg-gradient-to-br ${story.gradient}`}>
            <div className="w-full h-full rounded-full border-2 border-primary overflow-hidden">
              <img src={story.image} alt={story.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
          <span className="text-white text-xs font-medium text-center">{story.emoji} {story.name}</span>
        </Link>
      ))}
    </div>
  </section>
);

// ─── 3. LIMITED TIME DEALS ────────────────────────────────
const DealCountdown = ({ endTime }) => {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    const calc = () => {
      const diff = new Date(endTime) - new Date();
      if (diff <= 0) return;
      setTime({ h: Math.floor(diff / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) });
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [endTime]);
  const pad = n => String(n).padStart(2, '0');
  return (
    <div className="flex items-center gap-1">
      {[time.h, time.m, time.s].map((v, i) => (
        <span key={i} className="flex items-center gap-1">
          <span className="bg-black/40 text-white font-black text-xs px-1.5 py-0.5 rounded tabular-nums">{pad(v)}</span>
          {i < 2 && <span className="text-white/70 text-xs font-bold">:</span>}
        </span>
      ))}
    </div>
  );
};

const dealProducts = [
  { id: 1, name: "Women's Floral Kurta", price: 599, original: 1299, image: 'https://images.unsplash.com/photo-1765529374855-7353c3c47fc6?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', endTime: new Date(Date.now() + 6 * 3600000).toISOString(), link: '/products?category=Women' },
  { id: 2, name: "Men's Casual Shirt", price: 499, original: 999, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&q=80', endTime: new Date(Date.now() + 3 * 3600000).toISOString(), link: '/products?category=Men' },
  { id: 3, name: "Sports Sneakers", price: 799, original: 1799, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80', endTime: new Date(Date.now() + 9 * 3600000).toISOString(), link: '/products?category=Footwear' },
  { id: 4, name: "Skincare Combo Kit", price: 349, original: 799, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80', endTime: new Date(Date.now() + 12 * 3600000).toISOString(), link: '/products?category=Beauty' },
];

const LimitedTimeDeals = () => (
  <section className="mb-10">
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
        <Clock size={22} className="text-red-400" /> Limited Time Deals
      </h2>
      <Link to="/products?sort=price_low" className="text-purple-400 text-sm flex items-center gap-1 hover:gap-2 transition-all">
        View All <ArrowRight size={14} />
      </Link>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {dealProducts.map(deal => {
        const discount = Math.round(((deal.original - deal.price) / deal.original) * 100);
        return (
          <Link key={deal.id} to={deal.link}
            className="bg-card border border-border rounded-2xl overflow-hidden hover:border-red-500/40 transition group">
            <div className="relative overflow-hidden">
              <img src={deal.image} alt={deal.name}
                className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full animate-pulse">
                -{discount}%
              </div>
              {/* Countdown overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm px-2 py-1.5 flex items-center justify-between">
                <span className="text-white/70 text-xs">Ends in:</span>
                <DealCountdown endTime={deal.endTime} />
              </div>
            </div>
            <div className="p-3">
              <p className="text-white text-xs font-medium line-clamp-1">{deal.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-red-400 font-black text-sm">₹{deal.price}</span>
                <span className="text-gray-500 text-xs line-through">₹{deal.original}</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  </section>
);

// ─── 4. TOP RATED PRODUCTS ────────────────────────────────
const TopRatedSection = ({ products }) => {
  if (!products || products.length === 0) return null;
  const topRated = [...products].filter(p => p.averageRating > 0).sort((a, b) => b.averageRating - a.averageRating).slice(0, 4);
  if (topRated.length === 0) return null;
  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
          <Star size={22} className="text-yellow-400 fill-yellow-400" /> Top Rated
        </h2>
        <Link to="/products?sort=rating" className="text-purple-400 text-sm flex items-center gap-1 hover:gap-2 transition-all">
          View All <ArrowRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {topRated.map(product => (
          <div key={product._id} className="relative">
            <ProductCard product={product} />
            {/* Rating badge overlay */}
            <div className="absolute top-2 left-2 z-10">
              <div className="flex items-center gap-1 bg-yellow-500 text-black text-xs font-black px-2 py-0.5 rounded-full">
                ⭐ {product.averageRating.toFixed(1)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// ─── 5. FOR YOU SECTION ───────────────────────────────────
const ForYouSection = ({ allProducts }) => {
  const [forYou, setForYou] = useState([]);

  useEffect(() => {
    try {
      const recent = JSON.parse(localStorage.getItem('avio_recent') || '[]');
      if (recent.length === 0 || !allProducts?.length) return;

      // Browse history se categories nikalo
      const cats = [...new Set(recent.map(p => p.category))];

      // Same categories ke products suggest karo
      const suggested = allProducts
        .filter(p => cats.includes(p.category))
        .filter(p => !recent.find(r => r._id === p._id))
        .slice(0, 8);

      // Kam ho toh random fill karo
      if (suggested.length < 4) {
        const random = allProducts.filter(p => !suggested.find(s => s._id === p._id)).slice(0, 8 - suggested.length);
        setForYou([...suggested, ...random]);
      } else {
        setForYou(suggested);
      }
    } catch {}
  }, [allProducts]);

  if (forYou.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
          <Heart size={22} className="text-pink-400 fill-pink-400" /> For You
          <span className="text-xs font-normal text-gray-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
            Personalized
          </span>
        </h2>
        <Link to="/products" className="text-purple-400 text-sm flex items-center gap-1 hover:gap-2 transition-all">
          View All <ArrowRight size={14} />
        </Link>
      </div>
      <div className="flex md:grid md:grid-cols-4 gap-3 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
        {forYou.slice(0, 8).map(product => (
          <div key={product._id} className="shrink-0 w-44 md:w-auto">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
};

// ─── HERO SLIDER ──────────────────────────────────────────
const heroSlides = [
  { id: 1, image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&q=80', tag: 'New Collection', title: "Women's Fashion", subtitle: 'Upto 60% Off', desc: "Your Style. Your Choice. Avio.", cta: 'Shop Women', link: '/products?category=Women', align: 'left' },
  { id: 2, image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1400&q=80', tag: 'Trending Now', title: "Men's Collection", subtitle: 'Premium Styles', desc: "Your Style. Your Choice. Avio.", cta: 'Shop Men', link: '/products?category=Men', align: 'right' },
  { id: 3, image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1400&q=80', tag: 'Flash Sale', title: 'Summer Essentials', subtitle: 'Starting ₹299', desc: 'Everything Love, One Place', cta: 'Explore Now', link: '/products', align: 'left' },
  { id: 4, image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1400&q=80', tag: 'Limited Offer', title: 'Ethnic Wear', subtitle: 'Handpicked Styles', desc: 'Everything Love, One Place', cta: 'Shop Ethnic', link: '/products?category=Women', align: 'right' },
  { id: 5, image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1400&q=80', tag: 'New Arrivals', title: 'Party Collection', subtitle: 'Look Stunning', desc: 'Your Style. Your Choice. Avio.', cta: 'Shop Now', link: '/products', align: 'left' },
];

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef(null);
  const navigate = useNavigate();
  const goTo = (index) => { if (animating) return; setAnimating(true); setCurrent(index); setTimeout(() => setAnimating(false), 600); };
  const next = () => goTo((current + 1) % heroSlides.length);
  const prev = () => goTo((current - 1 + heroSlides.length) % heroSlides.length);
  useEffect(() => { timerRef.current = setInterval(next, 5000); return () => clearInterval(timerRef.current); }, [current]);
  const slide = heroSlides[current];
  return (
    <div className="relative w-full h-64 md:h-[520px] overflow-hidden mb-6">
      <div className="absolute inset-0">
        <img src={slide.image} alt={slide.title}
          className={`w-full h-full object-cover transition-all duration-700 ${animating ? 'scale-110 opacity-0' : 'scale-100 opacity-100'}`} />
        <div className={`absolute inset-0 bg-gradient-to-${slide.align === 'left' ? 'r' : 'l'} from-black/75 via-black/30 to-transparent`} />
      </div>
      <div className={`absolute inset-0 flex items-center ${slide.align === 'right' ? 'justify-end' : 'justify-start'}`}>
        <div className={`px-8 md:px-16 max-w-lg ${animating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'} transition-all duration-700`}>
          <span className="inline-block text-white text-xs font-bold px-3 py-1 rounded-full mb-3"
            style={{ background: 'linear-gradient(135deg,#6C3AE8,#C084FC)' }}>{slide.tag}</span>
          <h1 className="text-3xl md:text-6xl font-bold text-white mb-1 leading-tight">{slide.title}</h1>
          <p className="text-purple-300 text-xl md:text-3xl font-semibold mb-2">{slide.subtitle}</p>
          <p className="text-gray-300 text-sm mb-5 hidden md:block">{slide.desc}</p>
          <button onClick={() => navigate(slide.link)}
            className="text-white px-6 py-2.5 md:px-8 md:py-3 rounded-full font-bold text-sm md:text-base hover:opacity-90 transition flex items-center gap-2 w-fit"
            style={{ background: 'linear-gradient(135deg,#6C3AE8,#C084FC)' }}>
            {slide.cta} <ArrowRight size={16} />
          </button>
        </div>
      </div>
      <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/70 rounded-full flex items-center justify-center backdrop-blur-sm transition">
        <ChevronLeft size={20} className="text-white" />
      </button>
      <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/70 rounded-full flex items-center justify-center backdrop-blur-sm transition">
        <ChevronRight size={20} className="text-white" />
      </button>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
        {heroSlides.map((_, i) => (
          <button key={i} onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${i === current ? 'w-8 h-2' : 'w-2 h-2 bg-white/50'}`}
            style={i === current ? { background: 'linear-gradient(90deg,#6C3AE8,#C084FC)' } : {}} />
        ))}
      </div>
      <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
        {current + 1} / {heroSlides.length}
      </div>
    </div>
  );
};

// ─── TRUST BAR ────────────────────────────────────────────
const TrustBar = () => (
  <div className="bg-secondary border border-border rounded-2xl mb-8 overflow-hidden">
    <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 divide-x divide-border">
      {[
        { icon: Truck, title: 'Free Delivery', sub: 'Orders above ₹499' },
        { icon: RotateCcw, title: '7-Day Returns', sub: 'Easy return policy' },
        { icon: Shield, title: 'Secure COD', sub: 'Pay on delivery' },
        { icon: Headphones, title: '24/7 Support', sub: 'Always here for you' },
      ].map(item => (
        <div key={item.title} className="flex items-center gap-3 px-4 py-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(108,58,232,0.15)' }}>
            <item.icon size={18} className="text-purple-400" />
          </div>
          <div>
            <p className="text-white text-xs font-semibold">{item.title}</p>
            <p className="text-gray-500 text-xs">{item.sub}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── SHOP BY CATEGORY ─────────────────────────────────────
const categoryCards = [
  { name: 'Women', emoji: '👗', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&q=80', link: '/products?category=Women' },
  { name: 'Men', emoji: '👔', image: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=400&q=80', link: '/products?category=Men' },
  { name: 'Kids', emoji: '🧒', image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400&q=80', link: '/products?category=Kids' },
  { name: 'Footwear', emoji: '👟', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80', link: '/products?category=Footwear' },
  { name: 'Beauty', emoji: '💄', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80', link: '/products?category=Beauty' },
  { name: 'Sports', emoji: '🏋️', image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&q=80', link: '/products?category=Sports+%26+Fitness' },
];

const ShopByCategory = () => (
  <section className="mb-10">
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-xl md:text-2xl font-bold text-white">Shop by Category</h2>
      <Link to="/products" className="text-purple-400 text-sm flex items-center gap-1 hover:gap-2 transition-all">View All <ArrowRight size={14} /></Link>
    </div>
    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
      {categoryCards.map(cat => (
        <Link key={cat.name} to={cat.link} className="group relative rounded-2xl overflow-hidden aspect-square">
          <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-3">
            <span className="text-xl mb-0.5">{cat.emoji}</span>
            <p className="text-white font-bold text-xs md:text-sm">{cat.name}</p>
          </div>
        </Link>
      ))}
    </div>
  </section>
);

// ─── OFFER BANNERS ────────────────────────────────────────
const OfferBanner = () => {
  const navigate = useNavigate();
  return (
    <section className="mb-10">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="relative rounded-2xl overflow-hidden h-44 md:h-56 cursor-pointer group" onClick={() => navigate('/products?sort=price_low')}>
          <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80" alt="Sale" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/85 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-6">
            <span className="text-purple-300 text-xs font-bold mb-1 flex items-center gap-1"><Tag size={10} /> LIMITED TIME</span>
            <h3 className="text-white text-2xl md:text-3xl font-bold">Flat 50% Off</h3>
            <p className="text-gray-300 text-sm mb-3">On selected items</p>
            <span className="text-white px-4 py-1.5 rounded-full text-sm font-bold w-fit" style={{ background: 'linear-gradient(135deg,#6C3AE8,#C084FC)' }}>Shop Now →</span>
          </div>
        </div>
        <div className="relative rounded-2xl overflow-hidden h-44 md:h-56 cursor-pointer group" onClick={() => navigate('/products?sort=newest')}>
          <img src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80" alt="New Arrivals" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/85 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-6">
            <span className="text-blue-300 text-xs font-bold mb-1">✨ JUST ARRIVED</span>
            <h3 className="text-white text-2xl md:text-3xl font-bold">New Season</h3>
            <p className="text-gray-300 text-sm mb-3">Fresh styles just for you</p>
            <span className="text-white px-4 py-1.5 rounded-full text-sm font-bold w-fit" style={{ background: 'linear-gradient(135deg,#6C3AE8,#C084FC)' }}>Explore →</span>
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── RECENTLY VIEWED ──────────────────────────────────────
const RecentlyViewedSection = () => {
  const [items, setItems] = useState([]);
  useEffect(() => {
    try { const saved = JSON.parse(localStorage.getItem('avio_recent') || '[]'); setItems(saved.slice(0, 8)); } catch {}
  }, []);
  if (items.length === 0) return null;
  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
          <TrendingUp size={22} className="text-purple-400" /> Recently Viewed
        </h2>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {items.map(product => (
          <Link key={product._id} to={`/product/${product._id}`}
            className="shrink-0 w-36 bg-card border border-border rounded-xl overflow-hidden hover:border-purple-500/50 transition group">
            <img src={product.images?.[0]} alt={product.name} className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="p-2">
              <p className="text-white text-xs line-clamp-2">{product.name}</p>
              <p className="text-purple-400 text-xs font-bold mt-1">₹{product.sellingPrice}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

// ─── FOOTER ───────────────────────────────────────────────
const Footer = () => (
  <footer className="bg-secondary border-t border-border mt-12 pb-20 md:pb-0">
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
        <div className="col-span-2 md:col-span-1">
          <div className="flex flex-col mb-3" style={{ width: 'fit-content' }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: '20px', letterSpacing: '3px', color: '#ffffff', textTransform: 'uppercase' }}>AVIO</span>
            <div style={{ height: '2px', width: '100%', background: 'linear-gradient(90deg, #6C3AE8, #C084FC)', borderRadius: '2px', marginTop: '2px' }} />
          </div>
          <p className="text-sm leading-relaxed mb-1 font-medium" style={{ color: '#C084FC' }}>Everything Love, One Place</p>
          <p className="text-gray-500 text-xs leading-relaxed mb-4">Premium shopping destination for fashion, electronics & more.</p>
          <div className="flex flex-wrap gap-2">
            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full border border-green-500/30">✓ 100% Secure</span>
            <span className="text-purple-300 text-xs px-2 py-1 rounded-full border border-purple-500/30" style={{ background: 'rgba(108,58,232,0.15)' }}>💵 COD Available</span>
          </div>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2">
            {[{ label: 'Home', path: '/' }, { label: 'All Products', path: '/products' }, { label: 'My Orders', path: '/orders' }, { label: 'My Wishlist', path: '/wishlist' }].map(link => (
              <li key={link.path}><Link to={link.path} className="text-gray-400 text-sm hover:text-purple-400 transition">{link.label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Categories</h4>
          <ul className="space-y-2">
            {['Women', 'Men', 'Beauty', 'Footwear', 'Electronics', 'Sports & Fitness'].map(cat => (
              <li key={cat}><Link to={`/products?category=${cat}`} className="text-gray-400 text-sm hover:text-purple-400 transition">{cat}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Support</h4>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li>📞 +91 98765 43210</li>
            <li>✉️ support@avio.in</li>
            <li className="pt-2"><span className="text-white font-medium block mb-1">Working Hours</span>Mon–Sat: 9AM – 6PM</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
        <p className="text-gray-500 text-sm">© 2026 Avio. All rights reserved. Made with ❤️ in India</p>
        <div className="flex items-center gap-3 text-gray-500 text-xs">
          <span>Privacy Policy</span><span>•</span><span>Terms of Service</span><span>•</span><span>Return Policy</span>
        </div>
      </div>
    </div>
  </footer>
);

// ─── MAIN HOME ────────────────────────────────────────────
const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featRes, trendRes, allRes] = await Promise.all([
          getFeatured(),
          getTrending(),
          getProducts({ limit: 50 })
        ]);
        setFeatured(featRes.data.products);
        setTrending(trendRes.data.products);
        setAllProducts(allRes.data.products || []);
      } catch { console.log('Fetch error'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-primary">
      <FlashSaleBanner />
      <HeroSlider />
      <MarqueeTicker />
      <div className="max-w-7xl mx-auto px-4">
        <StoryCircles />
        <TrustBar />
        <LimitedTimeDeals />
        <ShopByCategory />

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: '#6C3AE8', borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <>
            <ForYouSection allProducts={allProducts} />
            <TopRatedSection products={allProducts} />

            {trending.length > 0 && (
              <section className="mb-10">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                    <Zap size={22} className="text-purple-400 fill-purple-400" /> Trending Now
                  </h2>
                  <Link to="/products?sort=popular" className="text-purple-400 text-sm flex items-center gap-1 hover:gap-2 transition-all">View All <ArrowRight size={14} /></Link>
                </div>
                <div className="flex md:grid md:grid-cols-4 gap-3 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
                  {trending.slice(0, 8).map(product => (
                    <div key={product._id} className="shrink-0 w-44 md:w-auto"><ProductCard product={product} /></div>
                  ))}
                </div>
              </section>
            )}

            {featured.length > 0 && (
              <section className="mb-10">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                    <Star size={22} className="text-purple-400 fill-purple-400" /> Featured Products
                  </h2>
                  <Link to="/products" className="text-purple-400 text-sm flex items-center gap-1 hover:gap-2 transition-all">View All <ArrowRight size={14} /></Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {featured.slice(0, 4).map(product => <ProductCard key={product._id} product={product} />)}
                </div>
              </section>
            )}

            {featured.length === 0 && trending.length === 0 && (
              <div className="text-center py-16">
                <ShoppingBag size={48} className="text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Abhi koi product nahi hai</p>
                <p className="text-gray-500 text-sm mt-1">Admin se products add karwao!</p>
              </div>
            )}
          </>
        )}

        <OfferBanner />
        <RecentlyViewedSection />
      </div>
      <Footer />
    </div>
  );
};

export default Home;