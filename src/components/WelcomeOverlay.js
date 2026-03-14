import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Sparkles, ShoppingBag, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ─── 25 UNIQUE SHOPPING QUOTES ────────────────────────────
const QUOTES = [
  { text: "Style is a way to say who you are without having to speak.", author: "Rachel Zoe" },
  { text: "Fashion is the armor to survive the reality of everyday life.", author: "Bill Cunningham" },
  { text: "You can have anything you want in life if you dress for it.", author: "Edith Head" },
  { text: "Shopping is cheaper than therapy. 💸", author: "Avio" },
  { text: "Life is short, buy the shoes! 👠", author: "Avio" },
  { text: "When in doubt, add to cart. 🛒", author: "Avio" },
  { text: "A new outfit can change your whole day. ✨", author: "Avio" },
  { text: "Dress well, live well, feel well. 💜", author: "Avio" },
  { text: "Your wardrobe is your canvas. Paint it beautifully.", author: "Avio" },
  { text: "Fashion is about dreaming and making other people dream.", author: "Donatella Versace" },
  { text: "Elegance is not about being noticed, it's about being remembered.", author: "Giorgio Armani" },
  { text: "The best things in life are the people we love, the places we've been, and the memories we've made along the way. And the clothes! 👗", author: "Avio" },
  { text: "Good clothes open all doors. 🚪", author: "Thomas Fuller" },
  { text: "In order to be irreplaceable, one must always be different.", author: "Coco Chanel" },
  { text: "Fashion is what you buy, style is what you do with it. 💫", author: "Avio" },
  { text: "Happiness is finding the perfect outfit on the first try! 🎉", author: "Avio" },
  { text: "Every day is a fashion show and the world is your runway. 🌟", author: "Coco Chanel" },
  { text: "She who shops, conquers. 💪", author: "Avio" },
  { text: "Wear your confidence, it's always in style. 😎", author: "Avio" },
  { text: "Life is too short to wear boring clothes. 🎨", author: "Avio" },
  { text: "The secret of great style is to feel good in what you wear.", author: "Inès de la Fressange" },
  { text: "Invest in your wardrobe, invest in yourself. 💎", author: "Avio" },
  { text: "Fashion fades, but style is eternal. ♾️", author: "Yves Saint Laurent" },
  { text: "Shopping is not a hobby, it's a skill. 🛍️", author: "Avio" },
  { text: "The right outfit can make you feel like a superhero! 🦸", author: "Avio" },
];

// ─── TIME CONFIG ──────────────────────────────────────────
const getTimeConfig = (hour) => {
  if (hour >= 5 && hour < 12) return {
    greeting: 'Good Morning',
    emoji: '☀️',
    sub: 'Start your day with something special!',
    gradient: 'from-orange-500/20 via-yellow-500/10 to-transparent',
    badge: 'from-orange-500 to-yellow-500',
    glow: 'rgba(251,146,60,0.15)',
    timeLabel: 'Morning Picks',
    timeIcon: '🌅',
  };
  if (hour >= 12 && hour < 17) return {
    greeting: 'Good Afternoon',
    emoji: '🌞',
    sub: 'Perfect time to treat yourself!',
    gradient: 'from-blue-500/20 via-cyan-500/10 to-transparent',
    badge: 'from-blue-500 to-cyan-500',
    glow: 'rgba(59,130,246,0.15)',
    timeLabel: 'Afternoon Deals',
    timeIcon: '⚡',
  };
  return {
    greeting: 'Good Evening',
    emoji: '🌙',
    sub: 'Unwind and indulge in some retail therapy!',
    gradient: 'from-purple-500/20 via-violet-500/10 to-transparent',
    badge: 'from-purple-500 to-violet-600',
    glow: 'rgba(139,92,246,0.15)',
    timeLabel: 'Evening Specials',
    timeIcon: '✨',
  };
};

// ─── OFFERS DATA ──────────────────────────────────────────
const OFFERS = [
  { icon: '🚚', title: 'Free Delivery', desc: 'On orders above ₹499', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
  { icon: '💵', title: 'Cash on Delivery', desc: 'Pay when you receive', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  { icon: '🔥', title: 'Flash Sale', desc: 'Up to 50% off today!', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  { icon: '↩️', title: '7-Day Returns', desc: 'Hassle-free returns', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
];

// ─── STORAGE KEY ──────────────────────────────────────────
const getStorageKey = () => {
  const today = new Date().toDateString();
  return `avio_welcome_${today}`;
};

// ─── MAIN COMPONENT ───────────────────────────────────────
const WelcomeOverlay = () => {
  const [show, setShow] = useState(false);
  const [quote, setQuote] = useState(null);
  const [timeConfig, setTimeConfig] = useState(null);
  const [animateIn, setAnimateIn] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Din mein ek baar check
    const key = getStorageKey();
    const seen = localStorage.getItem(key);
    if (seen) return;

    // Quote choose karo — last used se alag
    const lastQuoteIndex = parseInt(localStorage.getItem('avio_last_quote') || '-1');
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * QUOTES.length);
    } while (newIndex === lastQuoteIndex && QUOTES.length > 1);
    localStorage.setItem('avio_last_quote', newIndex.toString());
    setQuote(QUOTES[newIndex]);

    // Time config
    const hour = new Date().getHours();
    setTimeConfig(getTimeConfig(hour));

    // Thodi der baad show karo
    const timer = setTimeout(() => {
      setShow(true);
      setTimeout(() => setAnimateIn(true), 50);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setAnimateIn(false);
    setTimeout(() => setShow(false), 400);
    localStorage.setItem(getStorageKey(), 'true');
  };

  const handleShopNow = () => {
    handleClose();
    navigate('/products');
  };

  if (!show || !timeConfig || !quote) return null;

  const userName = user?.name?.split(' ')[0] || null;

  return (
    <div className={`fixed inset-0 z-[999] flex items-center justify-center p-4 transition-all duration-500 ${animateIn ? 'opacity-100' : 'opacity-0'}`}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className={`relative w-full max-w-md transition-all duration-500 ${animateIn ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}>
        <div className="bg-[#0f0f1a] border border-purple-500/20 rounded-3xl overflow-hidden shadow-2xl"
          style={{ boxShadow: `0 0 60px ${timeConfig.glow}, 0 25px 50px rgba(0,0,0,0.5)` }}>

          {/* Header glow bg */}
          <div className={`absolute inset-0 bg-gradient-to-b ${timeConfig.gradient} pointer-events-none`} />

          {/* Close button */}
          <button onClick={handleClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition">
            <X size={16} className="text-white" />
          </button>

          <div className="relative p-6 pb-5">

            {/* Top badge */}
            <div className="flex items-center justify-center mb-4">
              <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-white text-xs font-bold bg-gradient-to-r ${timeConfig.badge}`}>
                <span>{timeConfig.timeIcon}</span>
                {timeConfig.timeLabel}
              </div>
            </div>

            {/* AVIO logo */}
            <div className="text-center mb-1">
              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 900,
                fontSize: '13px',
                letterSpacing: '5px',
                color: '#C084FC',
                textTransform: 'uppercase'
              }}>AVIO</span>
            </div>

            {/* Greeting */}
            <div className="text-center mb-1">
              <h2 className="text-white font-bold text-2xl">
                {timeConfig.emoji} {timeConfig.greeting}{userName ? `, ${userName}` : ''}!
              </h2>
              <p className="text-gray-400 text-sm mt-1">{timeConfig.sub}</p>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-white/10" />
              <Sparkles size={14} className="text-purple-400" />
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Offers Grid */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {OFFERS.map((offer, i) => (
                <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${offer.bg}`}>
                  <span className="text-lg shrink-0">{offer.icon}</span>
                  <div className="min-w-0">
                    <p className={`text-xs font-bold ${offer.color}`}>{offer.title}</p>
                    <p className="text-gray-500 text-[10px] truncate">{offer.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quote */}
            <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 mb-5">
              <div className="flex items-start gap-2">
                <span className="text-purple-400 text-xl leading-none mt-0.5">"</span>
                <div>
                  <p className="text-gray-300 text-xs italic leading-relaxed">{quote.text}</p>
                  <p className="text-purple-400 text-[10px] font-semibold mt-1">— {quote.author}</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-2">
              <button onClick={handleShopNow}
                className="flex-1 py-3 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition active:scale-95"
                style={{ background: 'linear-gradient(135deg,#6C3AE8,#C084FC)' }}>
                <ShoppingBag size={16} /> Start Shopping ✨
              </button>
              <button onClick={handleClose}
                className="px-4 py-3 rounded-2xl border border-white/10 text-gray-400 text-sm hover:border-white/30 hover:text-white transition">
                Later
              </button>
            </div>

            {/* Tagline */}
            <p className="text-center text-gray-600 text-[10px] mt-3">Everything Love, One Place 💜</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeOverlay;