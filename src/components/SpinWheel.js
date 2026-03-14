import { useState, useEffect, useRef } from 'react';
import { X, Gift, Copy, Check, Zap, Flame, Trophy, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const STORAGE_KEY = 'avio_spin_last';
const COUPON_KEY = 'avio_spin_coupon';
const STREAK_KEY = 'avio_spin_streak';

// ─── FUNNY MESSAGES ───────────────────────────────────────
const SPINNING_MESSAGES = [
  '🙏 Bhagwan se maang raha hoon...',
  '🤞 Fingers crossed!',
  '😤 Concentration... concentration...',
  '🎯 Nazar mat lagao!',
  '🧿 Evil eye protection ON!',
  '💫 Kismat jagao!',
  '🎪 Wheel se baat kar raha hoon...',
  '🙈 Main nahi dekhunga... main nahi dekhunga...',
  '⚡ Power of positive thinking!',
  '🦋 Lucky charm activate!',
];

const WIN_MESSAGES = [
  '🎉 Arre wah! Kismat khul gayi!',
  '🔥 Toofan aa gaya savings ka!',
  '💜 Avio ne pyaar kar diya!',
  '🎊 Kya baat hai bhai/behen!',
  '⚡ Lightning strike of luck!',
  '🥳 Party time! Discount mila!',
];

const LOSE_MESSAGES = [
  '😅 Chakkar aa gaya par discount nahi...',
  '🙃 Wheel ne dhoka diya yaar!',
  '😭 Itna spin kiya... kuch nahi mila!',
  '🤡 Kal try karo, pakka milega!',
  '💔 Wheel ka dil sakht hai aaj...',
];

// ─── CONFETTI ─────────────────────────────────────────────
const ConfettiPiece = ({ x, color, delay, emoji }) => (
  <div
    className="absolute pointer-events-none text-lg"
    style={{
      left: `${x}%`,
      top: '-20px',
      animation: `confettiFall 3s ease-in ${delay}s forwards`,
      fontSize: emoji ? '20px' : '8px',
    }}>
    {emoji || <div style={{ width: 8, height: 8, backgroundColor: color, borderRadius: Math.random() > 0.5 ? '50%' : '0', transform: `rotate(${Math.random() * 360}deg)` }} />}
  </div>
);

const Confetti = ({ active }) => {
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: ['#6C3AE8', '#C084FC', '#F97316', '#EAB308', '#22C55E', '#EC4899', '#3B82F6'][Math.floor(Math.random() * 7)],
    delay: Math.random() * 1.5,
    emoji: Math.random() > 0.7 ? ['🎊', '⭐', '💜', '✨', '🎉'][Math.floor(Math.random() * 5)] : null,
  }));

  if (!active) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(600px) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {pieces.map(p => (
        <ConfettiPiece key={p.id} x={p.x} color={p.color} delay={p.delay} emoji={p.emoji} />
      ))}
    </div>
  );
};

// ─── STREAK SYSTEM ────────────────────────────────────────
const getStreak = () => {
  try {
    const data = JSON.parse(localStorage.getItem(STREAK_KEY) || '{"count":0,"lastDate":null}');
    return data;
  } catch { return { count: 0, lastDate: null }; }
};

const updateStreak = () => {
  const today = new Date().toDateString();
  const streak = getStreak();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  let newCount;
  if (streak.lastDate === today) {
    newCount = streak.count; // Already spun today
  } else if (streak.lastDate === yesterday) {
    newCount = streak.count + 1; // Consecutive day!
  } else {
    newCount = 1; // Streak broke, restart
  }

  localStorage.setItem(STREAK_KEY, JSON.stringify({ count: newCount, lastDate: today }));
  return newCount;
};

const StreakDisplay = ({ streak }) => {
  if (streak < 2) return null;
  return (
    <div className="flex items-center justify-center gap-2 mb-3">
      <div className="flex items-center gap-1.5 bg-orange-500/20 border border-orange-500/30 rounded-full px-3 py-1.5">
        <Flame size={14} className="text-orange-400 fill-orange-400" />
        <span className="text-orange-400 text-xs font-black">{streak} Din Ka Streak! 🔥</span>
        {streak >= 3 && <span className="text-yellow-400 text-xs font-bold">BONUS UNLOCKED!</span>}
      </div>
    </div>
  );
};

// ─── UPGRADED WHEEL CANVAS ────────────────────────────────
const WheelCanvas = ({ prizes, isSpinning }) => {
  const canvasRef = useRef(null);
  const glowRef = useRef(0);
  const animRef = useRef(null);
  const size = 280;
  const center = size / 2;
  const radius = center - 10;

  const drawWheel = (glow) => {
    const canvas = canvasRef.current;
    if (!canvas || !prizes.length) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, size, size);

    const sliceAngle = (2 * Math.PI) / prizes.length;

    // Outer glow ring
    if (isSpinning) {
      ctx.beginPath();
      ctx.arc(center, center, radius + 6, 0, 2 * Math.PI);
      const gradient = ctx.createLinearGradient(0, 0, size, size);
      gradient.addColorStop(0, `rgba(108,58,232,${0.3 + glow * 0.4})`);
      gradient.addColorStop(1, `rgba(192,132,252,${0.3 + glow * 0.4})`);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    prizes.forEach((prize, i) => {
      const startAngle = i * sliceAngle - Math.PI / 2;
      const endAngle = startAngle + sliceAngle;

      // Gradient fill
      const midAngle = startAngle + sliceAngle / 2;
      const gx1 = center + (radius * 0.3) * Math.cos(midAngle);
      const gy1 = center + (radius * 0.3) * Math.sin(midAngle);
      const gx2 = center + radius * Math.cos(midAngle);
      const gy2 = center + radius * Math.sin(midAngle);
      const grad = ctx.createLinearGradient(gx1, gy1, gx2, gy2);
      grad.addColorStop(0, prize.color + 'CC');
      grad.addColorStop(1, prize.color);

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = '#0f0f1a';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Emoji + Text
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';

      // Emoji
      ctx.font = '14px Arial';
      ctx.fillText(prize.emoji || '🎁', radius - 8, -8);

      // Label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px Arial';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(prize.label, radius - 8, 6);
      ctx.restore();
    });

    // Outer border
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(108,58,232,0.6)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Center circle
    const centerGrad = ctx.createRadialGradient(center, center, 0, center, center, 28);
    centerGrad.addColorStop(0, '#2a1060');
    centerGrad.addColorStop(1, '#0f0f1a');
    ctx.beginPath();
    ctx.arc(center, center, 28, 0, 2 * Math.PI);
    ctx.fillStyle = centerGrad;
    ctx.fill();
    ctx.strokeStyle = '#6C3AE8';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Center text
    ctx.fillStyle = '#C084FC';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(192,132,252,0.8)';
    ctx.shadowBlur = 6;
    ctx.fillText('🎡', center, center - 4);
    ctx.font = 'bold 8px Arial';
    ctx.fillText('SPIN!', center, center + 10);
  };

  useEffect(() => {
    if (isSpinning) {
      const animate = () => {
        glowRef.current = (Math.sin(Date.now() / 200) + 1) / 2;
        drawWheel(glowRef.current);
        animRef.current = requestAnimationFrame(animate);
      };
      animRef.current = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animRef.current);
    } else {
      drawWheel(0);
    }
  }, [prizes, isSpinning]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Pointer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
        <div className="flex flex-col items-center">
          <div className="w-4 h-4 bg-purple-400 rounded-full shadow-lg shadow-purple-400/50" />
          <div className="w-0 h-0 -mt-1"
            style={{ borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '16px solid #C084FC' }} />
        </div>
      </div>
      <canvas ref={canvasRef} width={size} height={size} className="rounded-full" />
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────
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
  const [funnyMsg, setFunnyMsg] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [suspense, setSuspense] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bonusUnlocked, setBonusUnlocked] = useState(false);
  const [floatAnim, setFloatAnim] = useState(false);
  const animRef = useRef(null);
  const msgTimerRef = useRef(null);

  useEffect(() => {
    fetchConfig();
    const lastSpin = localStorage.getItem(STORAGE_KEY);
    if (lastSpin && new Date(lastSpin).toDateString() === new Date().toDateString()) {
      setCanSpin(false);
    }
    try {
      const coupon = localStorage.getItem(COUPON_KEY);
      if (coupon) setSavedCoupon(JSON.parse(coupon));
    } catch {}

    // Streak check
    const s = getStreak();
    setStreak(s.count);

    // Floating button animation
    const floatTimer = setInterval(() => setFloatAnim(p => !p), 2000);
    return () => clearInterval(floatTimer);
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch(`${API_URL}/products/spin-config`);
      const data = await res.json();
      setIsActive(data.config.isActive);
      // Add emojis to prizes if not present
      const withEmojis = data.config.prizes.map((p, i) => ({
        ...p,
        emoji: p.emoji || ['🎯','💰','🚀','⭐','👑','😅'][i % 6]
      }));
      setPrizes(withEmojis);
    } catch {
      setPrizes([
        { label: '5% OFF', code: 'SPIN5', discount: 5, type: 'percent', color: '#6C3AE8', probability: 30, emoji: '🎯' },
        { label: '10% OFF', code: 'SPIN10', discount: 10, type: 'percent', color: '#C084FC', probability: 25, emoji: '💰' },
        { label: 'Free Delivery', code: 'FREEDEL', discount: 49, type: 'flat', color: '#22C55E', probability: 20, emoji: '🚀' },
        { label: '15% OFF', code: 'SPIN15', discount: 15, type: 'percent', color: '#F97316', probability: 12, emoji: '⭐' },
        { label: '20% OFF', code: 'SPIN20', discount: 20, type: 'percent', color: '#EAB308', probability: 8, emoji: '👑' },
        { label: 'Better Luck!', code: null, discount: 0, type: 'none', color: '#4B5563', probability: 5, emoji: '😅' },
      ]);
      setIsActive(true);
    }
  };

  // Funny message cycle during spin
  const startFunnyMessages = () => {
    let idx = 0;
    setFunnyMsg(SPINNING_MESSAGES[Math.floor(Math.random() * SPINNING_MESSAGES.length)]);
    msgTimerRef.current = setInterval(() => {
      idx = (idx + 1) % SPINNING_MESSAGES.length;
      setFunnyMsg(SPINNING_MESSAGES[Math.floor(Math.random() * SPINNING_MESSAGES.length)]);
    }, 800);
  };

  const stopFunnyMessages = () => {
    clearInterval(msgTimerRef.current);
    setFunnyMsg('');
  };

  const handleSpin = () => {
    if (spinning || !canSpin || !prizes.length) return;

    // Streak check — 3 din bonus
    const newStreak = updateStreak();
    setStreak(newStreak);
    if (newStreak >= 3) setBonusUnlocked(true);

    let prizesToUse = prizes;
    // Streak bonus — better prizes
    if (newStreak >= 3) {
      prizesToUse = prizes.map(p => ({
        ...p,
        probability: p.code ? p.probability * 1.5 : p.probability * 0.3
      }));
    }

    const prize = getRandomPrize(prizesToUse);
    const prizeIndex = prizes.findIndex(p => p.label === prize.label);
    const sliceAngle = 360 / prizes.length;
    const targetAngle = 360 - (prizeIndex * sliceAngle + sliceAngle / 2);
    const finalRotation = currentRotation + 7 * 360 + targetAngle - (currentRotation % 360);

    setSpinning(true);
    startFunnyMessages();

    const duration = 5000;
    const start = performance.now();
    const startRot = currentRotation;

    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Custom easing — fast start, dramatic slowdown
      const eased = progress < 0.7
        ? 1 - Math.pow(1 - progress / 0.7, 2) * 0.8
        : 0.8 + (1 - Math.pow(1 - (progress - 0.7) / 0.3, 3)) * 0.2;
      const current = startRot + (finalRotation - startRot) * Math.min(eased, 1);
      setRotation(current);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setCurrentRotation(finalRotation % 360);
        setSpinning(false);
        stopFunnyMessages();

        // SUSPENSE BUILD-UP!
        setSuspense(true);
        setTimeout(() => {
          setSuspense(false);
          setResult(prize);

          // Save
          localStorage.setItem(STORAGE_KEY, new Date().toISOString());
          setCanSpin(false);

          if (prize.code) {
            const couponData = { code: prize.code, discount: prize.discount, type: prize.type, label: prize.label };
            localStorage.setItem(COUPON_KEY, JSON.stringify(couponData));
            setSavedCoupon(couponData);
            // CONFETTI!
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3500);
          }
        }, 1500); // 1.5 sec suspense
      }
    };

    animRef.current = requestAnimationFrame(animate);
  };

  const handleCopy = () => {
    if (!result?.code) return;
    navigator.clipboard.writeText(result.code);
    setCopied(true);
    toast.success(`🎉 Code "${result.code}" copy ho gaya! Ab shopping karo!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setShow(false);
    setResult(null);
    setShowConfetti(false);
    setSuspense(false);
    stopFunnyMessages();
  };

  if (!isActive || !prizes.length) return null;

  const randomWinMsg = WIN_MESSAGES[Math.floor(Math.random() * WIN_MESSAGES.length)];
  const randomLoseMsg = LOSE_MESSAGES[Math.floor(Math.random() * LOSE_MESSAGES.length)];

  return (
    <>
      {/* Floating Button */}
      <button onClick={() => setShow(true)}
        className="fixed right-4 bottom-24 md:bottom-6 z-50 flex flex-col items-center gap-1 group">
        <div
          className="relative w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500"
          style={{
            background: 'linear-gradient(135deg,#6C3AE8,#C084FC)',
            transform: floatAnim ? 'scale(1.1) rotate(10deg)' : 'scale(1) rotate(-5deg)',
            boxShadow: floatAnim
              ? '0 0 20px rgba(192,132,252,0.6), 0 8px 20px rgba(108,58,232,0.4)'
              : '0 0 10px rgba(108,58,232,0.3)',
          }}>
          <span className="text-2xl">🎡</span>
          {canSpin && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
              <span className="text-white text-[9px] font-black">!</span>
            </div>
          )}
          {streak >= 2 && (
            <div className="absolute -bottom-1 -left-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
              <Flame size={10} className="text-white fill-white" />
            </div>
          )}
        </div>
        <span className="text-white text-[9px] font-bold bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-sm whitespace-nowrap">
          {canSpin ? '🎯 Spin & Win!' : savedCoupon ? `✅ ${savedCoupon.label}` : '⏰ Kal Aao!'}
        </span>
      </button>

      {/* Modal */}
      {show && (
        <div className="fixed inset-0 bg-black/90 z-[998] flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm bg-[#0f0f1a] border border-purple-500/30 rounded-3xl overflow-hidden shadow-2xl"
            style={{ boxShadow: '0 0 80px rgba(108,58,232,0.4)' }}>

            {/* Confetti */}
            <Confetti active={showConfetti} />

            {/* Close button — HAMESHA dikhega */}
            <button onClick={handleClose}
              className="absolute top-4 right-4 z-20 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition">
              <X size={16} className="text-white" />
            </button>

            {/* Header */}
            <div className="text-center pt-6 pb-3 px-6"
              style={{ background: 'linear-gradient(135deg,rgba(108,58,232,0.4),rgba(192,132,252,0.1))' }}>
              <div className="text-4xl mb-1" style={{ animation: spinning ? 'spin 0.5s linear infinite' : 'none' }}>
                {spinning ? '🌀' : '🎡'}
              </div>
              <h2 className="text-white font-black text-xl">Spin & Win!</h2>
              <p className="text-gray-400 text-xs mt-1">
                {canSpin ? '🎯 Aaj ka spin karo — coupon pakka milega!' : '⏰ Aaj ka spin ho gaya! Kal wapas aao 😊'}
              </p>
            </div>

            {/* Streak */}
            <div className="px-6 pt-2">
              <StreakDisplay streak={streak} />
              {bonusUnlocked && (
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-full px-3 py-1 flex items-center gap-1.5">
                    <Trophy size={12} className="text-yellow-400" />
                    <span className="text-yellow-400 text-xs font-bold">Streak Bonus Active! Better prizes mil rahe hain!</span>
                  </div>
                </div>
              )}
            </div>

            {/* Wheel */}
            <div className="flex justify-center py-2 px-6">
              <div style={{
                transform: `rotate(${rotation}deg)`,
                transition: spinning ? 'none' : 'transform 0.1s',
              }}>
                <WheelCanvas prizes={prizes} isSpinning={spinning} />
              </div>
            </div>

            {/* Funny message during spin */}
            {spinning && funnyMsg && (
              <div className="mx-6 mb-2 bg-purple-500/10 border border-purple-500/20 rounded-xl px-3 py-2 text-center min-h-[36px]">
                <p className="text-purple-300 text-xs font-semibold">{funnyMsg}</p>
              </div>
            )}

            {/* Suspense build-up */}
            {suspense && (
              <div className="mx-6 mb-3">
                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl p-4 text-center">
                  <div className="text-3xl mb-2 animate-bounce">🥁</div>
                  <p className="text-yellow-300 font-black text-lg">Aur winner hai...</p>
                  <p className="text-gray-400 text-xs mt-1">Dhol bajao! 🎺</p>
                  <div className="flex justify-center gap-1 mt-2">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Result */}
            {result && !suspense && (
              <div className="px-6 pb-6">
                {result.code ? (
                  <div className="bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-purple-500/20 border border-purple-500/40 rounded-2xl p-4 text-center mb-3">
                    <div className="text-3xl mb-1">🎊</div>
                    <p className="text-yellow-300 font-black text-sm mb-1">{randomWinMsg}</p>
                    <p className="text-white font-bold text-lg">{result.label} Mila! 🎉</p>
                    <p className="text-gray-400 text-xs mb-3">Checkout pe ye magic code use karo 👇</p>
                    <div className="flex items-center gap-2 bg-black/40 border border-purple-500/30 rounded-xl px-4 py-3">
                      <span className="text-purple-200 font-black text-xl flex-1 text-center tracking-widest">{result.code}</span>
                      <button onClick={handleCopy}
                        className="w-9 h-9 bg-purple-500/30 rounded-xl flex items-center justify-center hover:bg-purple-500/50 transition active:scale-95">
                        {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} className="text-purple-300" />}
                      </button>
                    </div>
                    {copied && <p className="text-green-400 text-xs mt-2 font-semibold">✅ Clipboard mein copy ho gaya!</p>}
                  </div>
                ) : (
                  <div className="bg-gray-500/10 border border-gray-500/20 rounded-2xl p-4 text-center mb-3">
                    <div className="text-3xl mb-1">😭</div>
                    <p className="text-gray-300 font-black text-sm mb-1">{randomLoseMsg}</p>
                    <p className="text-gray-400 text-xs">Kal phir try karo — kal pakka milega! 🤞</p>
                  </div>
                )}
                <div className="flex gap-2">
                  {result.code && (
                    <button onClick={() => { handleClose(); window.location.href = '/products'; }}
                      className="flex-1 py-3 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-1.5 transition active:scale-95"
                      style={{ background: 'linear-gradient(135deg,#6C3AE8,#C084FC)' }}>
                      🛍️ Shopping Karo!
                    </button>
                  )}
                  <button onClick={handleClose}
                    className={`py-3 rounded-2xl font-bold text-sm transition active:scale-95 flex items-center justify-center gap-1.5 ${
                      result.code
                        ? 'px-4 border border-white/10 text-gray-400 hover:border-white/30'
                        : 'flex-1 border border-white/10 text-gray-300 hover:border-white/30'
                    }`}>
                    <X size={14} /> Band Karo
                  </button>
                </div>
              </div>
            )}

            {/* Before spin */}
            {!result && !suspense && (
              <div className="px-6 pb-6">
                {!canSpin && savedCoupon && (
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 mb-3 text-center">
                    <p className="text-purple-300 text-xs font-semibold mb-1">🎟️ Aapka saved coupon:</p>
                    <p className="text-white font-black text-xl tracking-widest">{savedCoupon.code}</p>
                    <p className="text-gray-400 text-xs">{savedCoupon.label}</p>
                  </div>
                )}
                <button onClick={handleSpin} disabled={!canSpin || spinning}
                  className="w-full py-3.5 rounded-2xl font-black text-white text-base disabled:opacity-50 flex items-center justify-center gap-2 transition active:scale-95"
                  style={{ background: canSpin ? 'linear-gradient(135deg,#6C3AE8,#C084FC)' : '#374151' }}>
                  {spinning
                    ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Wheel ghoom rahi hai...</>
                    : canSpin
                    ? <><Zap size={18} className="fill-white" /> 🎡 Spin Karo Bhai!</>
                    : <><Gift size={16} /> Kal Wapas Aao! 👋</>}
                </button>
                {canSpin && <p className="text-gray-600 text-[10px] text-center mt-2">🎯 Din mein sirf 1 spin • Aaj lucky feel ho raha hai!</p>}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default SpinWheel;