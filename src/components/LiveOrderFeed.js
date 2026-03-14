import { useState, useEffect, useRef } from 'react';
import { ShoppingBag, X } from 'lucide-react';
import { adminGetOrders } from '../utils/api';

// ─── FAKE ORDERS DATA ─────────────────────────────────────
const FAKE_ORDERS = [
  { name: 'Priya S.', city: 'Mumbai', product: 'Floral Kurta Set', time: '2 min ago', emoji: '👗' },
  { name: 'Rahul M.', city: 'Delhi', product: 'Men\'s Casual Shirt', time: '5 min ago', emoji: '👔' },
  { name: 'Ananya K.', city: 'Bangalore', product: 'Women\'s Heels', time: '7 min ago', emoji: '👠' },
  { name: 'Vikram P.', city: 'Pune', product: 'Sports Sneakers', time: '10 min ago', emoji: '👟' },
  { name: 'Sneha R.', city: 'Chennai', product: 'Skincare Combo Kit', time: '12 min ago', emoji: '✨' },
  { name: 'Arjun T.', city: 'Hyderabad', product: 'Denim Jeans', time: '15 min ago', emoji: '👖' },
  { name: 'Kavya N.', city: 'Kolkata', product: 'Ethnic Lehenga', time: '18 min ago', emoji: '🥻' },
  { name: 'Rohit D.', city: 'Ahmedabad', product: 'Wireless Earbuds', time: '20 min ago', emoji: '🎧' },
  { name: 'Meera J.', city: 'Jaipur', product: 'Silk Saree', time: '22 min ago', emoji: '🥻' },
  { name: 'Karan S.', city: 'Surat', product: 'Track Suit', time: '25 min ago', emoji: '🏋️' },
  { name: 'Divya P.', city: 'Lucknow', product: 'Palazzo Set', time: '28 min ago', emoji: '👗' },
  { name: 'Amit K.', city: 'Indore', product: 'Formal Shirt', time: '30 min ago', emoji: '👔' },
  { name: 'Pooja M.', city: 'Nagpur', product: 'Earrings Set', time: '32 min ago', emoji: '💍' },
  { name: 'Suresh L.', city: 'Bhopal', product: 'Running Shoes', time: '35 min ago', emoji: '👟' },
  { name: 'Riya A.', city: 'Chandigarh', product: 'Crop Top', time: '38 min ago', emoji: '👚' },
  { name: 'Nikhil B.', city: 'Vadodara', product: 'Smart Watch', time: '40 min ago', emoji: '⌚' },
  { name: 'Ishaan V.', city: 'Coimbatore', product: 'Kurta Pajama', time: '42 min ago', emoji: '🧥' },
  { name: 'Tanya G.', city: 'Patna', product: 'Handbag', time: '45 min ago', emoji: '👜' },
  { name: 'Manish R.', city: 'Ranchi', product: 'Bluetooth Speaker', time: '48 min ago', emoji: '🔊' },
  { name: 'Nisha C.', city: 'Agra', product: 'Anarkali Suit', time: '50 min ago', emoji: '👗' },
  { name: 'Deepak S.', city: 'Mysore', product: 'Men\'s Jeans', time: '52 min ago', emoji: '👖' },
  { name: 'Aisha K.', city: 'Udaipur', product: 'Lip Kit', time: '55 min ago', emoji: '💄' },
  { name: 'Raj P.', city: 'Jodhpur', product: 'Sherwani Set', time: '58 min ago', emoji: '🧥' },
  { name: 'Simran T.', city: 'Amritsar', product: 'Salwar Suit', time: '1 hr ago', emoji: '👗' },
  { name: 'Varun M.', city: 'Ludhiana', product: 'Power Bank', time: '1 hr ago', emoji: '🔋' },
];

// ─── MAIN COMPONENT ───────────────────────────────────────
const LiveOrderFeed = () => {
  const [current, setCurrent] = useState(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [allOrders, setAllOrders] = useState([]);
  const indexRef = useRef(0);
  const timerRef = useRef(null);

  // Real orders fetch karo
  useEffect(() => {
    const fetchRealOrders = async () => {
      try {
        const { data } = await adminGetOrders({ limit: 20 });
        const real = (data.orders || []).map(o => ({
          name: o.customer?.name
            ? o.customer.name.split(' ')[0] + ' ' + (o.customer.name.split(' ')[1]?.[0] || '') + '.'
            : 'Someone',
          city: o.shippingAddress?.city || 'India',
          product: o.items?.[0]?.name || 'a product',
          time: getTimeAgo(o.createdAt),
          emoji: '🛍️',
          isReal: true,
        }));
        // Real + fake mix karo — real pehle, fake baad mein
        const mixed = [...real, ...FAKE_ORDERS];
        // Shuffle
        for (let i = mixed.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [mixed[i], mixed[j]] = [mixed[j], mixed[i]];
        }
        setAllOrders(mixed);
      } catch {
        // Sirf fake use karo
        setAllOrders([...FAKE_ORDERS].sort(() => Math.random() - 0.5));
      }
    };
    fetchRealOrders();
  }, []);

  const getTimeAgo = (dateStr) => {
    const diff = Math.floor((new Date() - new Date(dateStr)) / 60000);
    if (diff < 1) return 'just now';
    if (diff < 60) return `${diff} min ago`;
    return `${Math.floor(diff / 60)} hr ago`;
  };

  // Feed chalaao
  useEffect(() => {
    if (allOrders.length === 0 || dismissed) return;

    const showNext = () => {
      const order = allOrders[indexRef.current % allOrders.length];
      indexRef.current++;
      setCurrent(order);
      setVisible(true);

      // 4 second baad hide karo
      setTimeout(() => {
        setVisible(false);
      }, 4000);
    };

    // Pehla order 3 second baad
    const initial = setTimeout(showNext, 3000);

    // Phir har 7 second
    timerRef.current = setInterval(showNext, 7000);

    return () => {
      clearTimeout(initial);
      clearInterval(timerRef.current);
    };
  }, [allOrders, dismissed]);

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    clearInterval(timerRef.current);
  };

  if (dismissed || !current) return null;

  return (
    <div
      className={`fixed bottom-20 md:bottom-6 left-4 z-[90] transition-all duration-500 ${
        visible
          ? 'opacity-100 translate-y-0 translate-x-0'
          : 'opacity-0 translate-y-4 -translate-x-2 pointer-events-none'
      }`}
      style={{ maxWidth: '280px' }}
    >
      <div className="bg-[#1a1a2e] border border-purple-500/30 rounded-2xl p-3 shadow-2xl"
        style={{ boxShadow: '0 8px 32px rgba(108,58,232,0.2)' }}>
        <div className="flex items-center gap-3">

          {/* Icon */}
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl"
            style={{ background: 'linear-gradient(135deg,#6C3AE8,#C084FC)' }}>
            {current.emoji}
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-0.5">
              {current.isReal && (
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full shrink-0 animate-pulse" />
              )}
              <p className="text-white text-xs font-bold truncate">
                {current.name}
                <span className="text-gray-400 font-normal"> from {current.city}</span>
              </p>
            </div>
            <p className="text-gray-300 text-xs truncate">
              ordered <span className="text-purple-300 font-semibold">{current.product}</span>
            </p>
            <p className="text-gray-500 text-[10px] mt-0.5 flex items-center gap-1">
              <span className="w-1 h-1 bg-green-400 rounded-full inline-block" />
              {current.time} • Verified purchase
            </p>
          </div>

          {/* Close */}
          <button onClick={handleDismiss}
            className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center shrink-0 transition">
            <X size={10} className="text-gray-400" />
          </button>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
          <div className="flex items-center gap-1">
            <ShoppingBag size={10} className="text-purple-400" />
            <span className="text-purple-400 text-[10px] font-medium">Avio Store</span>
          </div>
          <span className="text-[10px] text-gray-600">🔒 Secure Order</span>
        </div>
      </div>
    </div>
  );
};

export default LiveOrderFeed;