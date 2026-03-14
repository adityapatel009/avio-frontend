import { useState, useEffect, useRef } from 'react';
import { X, Gift, Copy, Check, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const STORAGE_KEY = 'avio_spin_last';
const COUPON_KEY = 'avio_spin_coupon';

const getRandomPrize = (prizes) => {
  const total = prizes.reduce((sum, p) => sum + p.probability, 0);
  let rand = Math.random() * total;
  for (const prize of prizes) {
    rand -= prize.probability;
    if (rand <= 0) return prize;
  }
  return prizes[0];
};

const WheelCanvas = ({ prizes }) => {
  const canvasRef = useRef(null);
  const size = 260;
  const center = size / 2;
  const radius = center - 8;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !prizes.length) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, size, size);
    const sliceAngle = (2 * Math.PI) / prizes.length;
    prizes.forEach((prize, i) => {
      const startAngle = i * sliceAngle - Math.PI / 2;
      const endAngle = startAngle + sliceAngle;
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = prize.color;
      ctx.fill();
      ctx.strokeStyle = '#0f0f1a';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px Arial';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 3;
      ctx.fillText(prize.label, radius - 10, 4);
      ctx.restore();
    });
    ctx.beginPath();
    ctx.arc(center, center, 22, 0, 2 * Math.PI);
    ctx.fillStyle = '#0f0f1a';
    ctx.fill();
    ctx.strokeStyle = '#6C3AE8';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#C084FC';
    ctx.font = 'bold 9px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SPIN', center, center - 2);
    ctx.fillText('WIN', center, center + 9);
  }, [prizes]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
        <div className="w-0 h-0"
          style={{ borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: '20px solid #C084FC' }} />
      </div>
      <canvas ref={canvasRef} width={size} height={size} className="rounded-full shadow-2xl" />
    </div>
  );
};

const SpinWheel = () => {
  const [show, setShow] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [canSpin, setCanSpin] = useState(true);
  const [savedCoupon, setSavedCoupon] = useState(null);
  const [prizes, setPrizes] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const animRef = useRef(null);

  useEffect(() => {
    fetchConfig();
    // Din mein ek baar check
    const lastSpin = localStorage.getItem(STORAGE_KEY);
    if (lastSpin && new Date(lastSpin).toDateString() === new Date().toDateString()) {
      setCanSpin(false);
    }
    try {
      const coupon = localStorage.getItem(COUPON_KEY);
      if (coupon) setSavedCoupon(JSON.parse(coupon));
    } catch {}
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch(`${API_URL}/products/spin-config`);
      const data = await res.json();
      setIsActive(data.config.isActive);
      setPrizes(data.config.prizes);
    } catch {
      // Fallback prizes
      setPrizes([
        { label: '5% OFF', code: 'SPIN5', discount: 5, type: 'percent', color: '#6C3AE8', probability: 30 },
        { label: '10% OFF', code: 'SPIN10', discount: 10, type: 'percent', color: '#C084FC', probability: 25 },
        { label: 'Free Delivery', code: 'FREEDEL', discount: 49, type: 'flat', color: '#22C55E', probability: 20 },
        { label: '15% OFF', code: 'SPIN15', discount: 15, type: 'percent', color: '#F97316', probability: 12 },
        { label: '20% OFF', code: 'SPIN20', discount: 20, type: 'percent', color: '#EAB308', probability: 8 },
        { label: 'Better Luck!', code: null, discount: 0, type: 'none', color: '#4B5563', probability: 5 },
      ]);
      setIsActive(true);
    }
  };

  const handleSpin = () => {
    if (spinning || !canSpin || !prizes.length) return;
    const prize = getRandomPrize(prizes);
    const prizeIndex = prizes.indexOf(prize);
    const sliceAngle = 360 / prizes.length;
    const targetAngle = 360 - (prizeIndex * sliceAngle + sliceAngle / 2);
    const finalRotation = currentRotation + 5 * 360 + targetAngle - (currentRotation % 360);
    setSpinning(true);
    const duration = 4000;
    const start = performance.now();
    const startRot = currentRotation;
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startRot + (finalRotation - startRot) * eased;
      setRotation(current);
      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setCurrentRotation(finalRotation % 360);
        setSpinning(false);
        setResult(prize);
        localStorage.setItem(STORAGE_KEY, new Date().toISOString());
        setCanSpin(false);
        if (prize.code) {
          const couponData = { code: prize.code, discount: prize.discount, type: prize.type, label: prize.label };
          localStorage.setItem(COUPON_KEY, JSON.stringify(couponData));
          setSavedCoupon(couponData);
        }
      }
    };
    animRef.current = requestAnimationFrame(animate);
  };

  const handleCopy = () => {
    if (!result?.code) return;
    navigator.clipboard.writeText(result.code);
    setCopied(true);
    toast.success(`Code "${result.code}" copy ho gaya! 🎉`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => { setShow(false); setResult(null); };

  // Admin ne off kiya hai toh dikhao hi mat
  if (!isActive || !prizes.length) return null;

  return (
    <>
      <button onClick={() => setShow(true)}
        className="fixed right-4 bottom-24 md:bottom-6 z-50 flex flex-col items-center gap-1 group">
        <div className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110 active:scale-95"
          style={{ background: 'linear-gradient(135deg,#6C3AE8,#C084FC)' }}>
          <span className="text-2xl">🎡</span>
          {canSpin && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-[8px] font-black">!</span>
            </div>
          )}
        </div>
        <span className="text-white text-[9px] font-bold bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-sm">
          {canSpin ? 'Spin & Win!' : savedCoupon ? savedCoupon.label : 'Spun!'}
        </span>
      </button>

      {show && (
        <div className="fixed inset-0 bg-black/85 z-[998] flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm bg-[#0f0f1a] border border-purple-500/30 rounded-3xl overflow-hidden shadow-2xl"
            style={{ boxShadow: '0 0 60px rgba(108,58,232,0.3)' }}>
            <button onClick={handleClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition">
              <X size={16} className="text-white" />
            </button>
            <div className="text-center pt-6 pb-4 px-6"
              style={{ background: 'linear-gradient(135deg,rgba(108,58,232,0.3),rgba(192,132,252,0.1))' }}>
              <div className="text-3xl mb-1">🎡</div>
              <h2 className="text-white font-black text-xl">Spin & Win!</h2>
              <p className="text-gray-400 text-xs mt-1">
                {canSpin ? 'Aaj ka spin karo aur coupon jeeto!' : 'Aaj ka spin ho gaya! Kal wapas aao 😊'}
              </p>
            </div>
            <div className="flex justify-center py-4 px-6">
              <div style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? 'none' : 'transform 0.1s' }}>
                <WheelCanvas prizes={prizes} />
              </div>
            </div>
            {result ? (
              <div className="px-6 pb-6">
                {result.code ? (
                  <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-4 text-center mb-4">
                    <div className="text-3xl mb-2">🎉</div>
                    <p className="text-white font-bold text-lg">{result.label} Mila!</p>
                    <p className="text-gray-400 text-xs mb-3">Checkout pe ye code use karo</p>
                    <div className="flex items-center gap-2 bg-black/30 rounded-xl px-4 py-3">
                      <span className="text-purple-300 font-black text-xl flex-1 text-center tracking-widest">{result.code}</span>
                      <button onClick={handleCopy}
                        className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center hover:bg-purple-500/40 transition">
                        {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} className="text-purple-400" />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-500/10 border border-gray-500/20 rounded-2xl p-4 text-center mb-4">
                    <div className="text-3xl mb-2">😔</div>
                    <p className="text-white font-bold">Agli baar lucky raho!</p>
                    <p className="text-gray-400 text-xs mt-1">Kal phir try karo</p>
                  </div>
                )}
                <button onClick={handleClose}
                  className="w-full py-3 rounded-2xl font-bold text-white text-sm"
                  style={{ background: 'linear-gradient(135deg,#6C3AE8,#C084FC)' }}>
                  {result.code ? 'Shopping Karo! 🛍️' : 'Theek Hai'}
                </button>
              </div>
            ) : (
              <div className="px-6 pb-6">
                {!canSpin && savedCoupon && (
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 mb-3 text-center">
                    <p className="text-purple-300 text-xs font-semibold mb-1">Aapka coupon 🎟️</p>
                    <p className="text-white font-black text-lg tracking-widest">{savedCoupon.code}</p>
                    <p className="text-gray-400 text-xs">{savedCoupon.label}</p>
                  </div>
                )}
                <button onClick={handleSpin} disabled={!canSpin || spinning}
                  className="w-full py-3 rounded-2xl font-bold text-white text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#6C3AE8,#C084FC)' }}>
                  {spinning ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Spinning...</>
                    : canSpin ? <><Zap size={16} /> Spin Karo!</>
                    : <><Gift size={16} /> Kal Wapas Aao!</>}
                </button>
                <p className="text-gray-600 text-[10px] text-center mt-2">Din mein sirf 1 spin</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SpinWheel;