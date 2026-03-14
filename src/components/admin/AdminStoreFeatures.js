import { useState, useEffect } from 'react';
import { Zap, Search, X, Check, Settings, ToggleLeft, ToggleRight, Plus, Trash2, Edit3 } from 'lucide-react';
import { getProducts } from '../../utils/api';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const DEFAULT_PRIZES = [
  { label: '5% OFF', code: 'SPIN5', discount: 5, type: 'percent', color: '#6C3AE8', probability: 30 },
  { label: '10% OFF', code: 'SPIN10', discount: 10, type: 'percent', color: '#C084FC', probability: 25 },
  { label: 'Free Delivery', code: 'FREEDEL', discount: 49, type: 'flat', color: '#22C55E', probability: 20 },
  { label: '15% OFF', code: 'SPIN15', discount: 15, type: 'percent', color: '#F97316', probability: 12 },
  { label: '20% OFF', code: 'SPIN20', discount: 20, type: 'percent', color: '#EAB308', probability: 8 },
  { label: 'Better Luck!', code: null, discount: 0, type: 'none', color: '#4B5563', probability: 5 },
];

const AdminStoreFeatures = () => {
  // ── Deal of Day ──
  const [currentDeal, setCurrentDeal] = useState(null);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [dealPrice, setDealPrice] = useState('');
  const [savingDeal, setSavingDeal] = useState(false);

  // ── Spin Wheel ──
  const [spinActive, setSpinActive] = useState(true);
  const [prizes, setPrizes] = useState(DEFAULT_PRIZES);
  const [editingPrize, setEditingPrize] = useState(null);
  const [savingSpin, setSavingSpin] = useState(false);
  const [showPrizeEditor, setShowPrizeEditor] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [dealRes, spinRes, prodRes] = await Promise.all([
        fetch(`${API_URL}/products/deal-of-day`),
        fetch(`${API_URL}/products/spin-config`),
        getProducts({ limit: 500 }),
      ]);
      const dealData = await dealRes.json();
      const spinData = await spinRes.json();
      setCurrentDeal(dealData.deal?.product ? dealData.deal : null);
      setSpinActive(spinData.config.isActive);
      setPrizes(spinData.config.prizes);
      setProducts(prodRes.data.products || []);
    } catch {} finally { setLoading(false); }
  };

  const token = () => localStorage.getItem('crownbay_token');

  // ── Deal handlers ──
  const handleSaveDeal = async () => {
    if (!selected) return toast.error('Product select karo!');
    if (!dealPrice || Number(dealPrice) <= 0) return toast.error('Deal price daalo!');
    if (Number(dealPrice) >= selected.sellingPrice) return toast.error('Deal price selling price se kam hona chahiye!');
    setSavingDeal(true);
    try {
      const res = await fetch(`${API_URL}/products/deal-of-day`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ productId: selected._id, dealPrice: Number(dealPrice) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('Deal of Day set ho gaya! 🔥');
      setCurrentDeal(data.deal);
      setSelected(null); setSearch(''); setDealPrice('');
    } catch (err) { toast.error(err.message || 'Error aaya!'); }
    finally { setSavingDeal(false); }
  };

  const handleRemoveDeal = async () => {
    if (!window.confirm('Deal remove karna chahte ho?')) return;
    try {
      await fetch(`${API_URL}/products/deal-of-day`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token()}` },
      });
      toast.success('Deal remove ho gaya!');
      setCurrentDeal(null);
    } catch { toast.error('Error aaya!'); }
  };

  // ── Spin handlers ──
  const handleSpinToggle = async () => {
    const newVal = !spinActive;
    setSavingSpin(true);
    try {
      const res = await fetch(`${API_URL}/products/spin-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ isActive: newVal, prizes }),
      });
      if (!res.ok) throw new Error('Error');
      setSpinActive(newVal);
      toast.success(newVal ? 'Spin Wheel ON ho gaya! 🎡' : 'Spin Wheel OFF ho gaya!');
    } catch { toast.error('Error aaya!'); }
    finally { setSavingSpin(false); }
  };

  const handleSavePrizes = async () => {
    setSavingSpin(true);
    try {
      const res = await fetch(`${API_URL}/products/spin-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ isActive: spinActive, prizes }),
      });
      if (!res.ok) throw new Error('Error');
      toast.success('Prizes save ho gaye! ✅');
      setShowPrizeEditor(false);
      setEditingPrize(null);
    } catch { toast.error('Error aaya!'); }
    finally { setSavingSpin(false); }
  };

  const handlePrizeEdit = (idx, field, value) => {
    setPrizes(prev => prev.map((p, i) => i === idx ? { ...p, [field]: field === 'discount' || field === 'probability' ? Number(value) : value } : p));
  };

  const filteredProducts = products.filter(p =>
    search ? p.name.toLowerCase().includes(search.toLowerCase()) : false
  ).slice(0, 6);

  if (loading) return (
    <div className="bg-card border border-border rounded-2xl p-5 mb-6 flex items-center justify-center h-24">
      <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="bg-card border border-border rounded-2xl p-5 mb-6">
      <h3 className="text-white font-bold flex items-center gap-2 mb-5">
        <Settings size={18} className="text-gold" /> Store Features Control
      </h3>

      <div className="grid md:grid-cols-2 gap-5">

        {/* ── DEAL OF THE DAY ── */}
        <div className="bg-secondary border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={16} className="text-gold fill-gold" />
            <h4 className="text-white font-bold text-sm">Deal of The Day</h4>
          </div>

          {/* Current Deal */}
          {currentDeal ? (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 mb-3">
              <div className="flex items-center gap-3">
                <img src={currentDeal.product?.images?.[0]} alt=""
                  className="w-12 h-12 object-cover rounded-lg border border-border shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-bold line-clamp-1">{currentDeal.product?.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-gray-400 line-through text-xs">₹{currentDeal.product?.sellingPrice}</span>
                    <span className="text-green-400 font-bold text-sm">₹{currentDeal.dealPrice}</span>
                  </div>
                  <p className="text-gray-500 text-[10px] mt-0.5">
                    ⏰ Expires: {new Date(currentDeal.endsAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <button onClick={handleRemoveDeal}
                  className="w-7 h-7 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-center hover:bg-red-500/20 transition shrink-0">
                  <X size={12} className="text-red-400" />
                </button>
              </div>
              <p className="text-green-400 text-[10px] font-semibold mt-2 text-center">✅ Live on Home Page</p>
            </div>
          ) : (
            <div className="bg-gray-500/10 border border-gray-500/20 rounded-xl p-3 mb-3 text-center">
              <p className="text-gray-400 text-xs">Koi deal active nahi hai</p>
              <p className="text-gray-500 text-[10px] mt-0.5">Deal set karo — home page pe dikhegi</p>
            </div>
          )}

          {/* Set Deal */}
          <div className="space-y-2">
            <div className="relative">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input value={search} onChange={e => { setSearch(e.target.value); setSelected(null); }}
                placeholder="Product search karo..."
                className="w-full bg-card border border-border rounded-xl pl-8 pr-3 py-2 text-white text-xs focus:outline-none focus:border-gold transition" />
            </div>
            {filteredProducts.length > 0 && !selected && (
              <div className="border border-border rounded-xl overflow-hidden max-h-36 overflow-y-auto">
                {filteredProducts.map(p => (
                  <button key={p._id} type="button"
                    onClick={() => { setSelected(p); setSearch(p.name); setDealPrice(Math.round(p.sellingPrice * 0.85).toString()); }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-card transition text-left border-b border-border last:border-0">
                    <img src={p.images?.[0]} alt="" className="w-8 h-8 object-cover rounded-lg shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs line-clamp-1">{p.name}</p>
                      <p className="text-gray-400 text-[10px]">₹{p.sellingPrice}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {selected && (
              <div className="flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-xl px-3 py-2">
                <img src={selected.images?.[0]} alt="" className="w-7 h-7 object-cover rounded-lg shrink-0" />
                <span className="text-gold text-xs font-medium flex-1 line-clamp-1">{selected.name}</span>
                <button onClick={() => { setSelected(null); setSearch(''); setDealPrice(''); }}>
                  <X size={12} className="text-gray-400" />
                </button>
              </div>
            )}
            {selected && (
              <input type="number" value={dealPrice} onChange={e => setDealPrice(e.target.value)}
                placeholder={`Deal price (max ₹${selected.sellingPrice - 1})`}
                className="w-full bg-card border border-border rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-gold transition" />
            )}
            <button onClick={handleSaveDeal} disabled={savingDeal || !selected || !dealPrice}
              className="w-full py-2 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-1.5 disabled:opacity-40 transition"
              style={{ background: 'linear-gradient(135deg,#6C3AE8,#C084FC)' }}>
              {savingDeal ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <><Zap size={12} /> {currentDeal ? 'Update Deal' : 'Set Deal'}</>}
            </button>
          </div>
        </div>

        {/* ── SPIN WHEEL ── */}
        <div className="bg-secondary border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎡</span>
              <h4 className="text-white font-bold text-sm">Spin Wheel</h4>
            </div>
            <button onClick={handleSpinToggle} disabled={savingSpin}
              className="flex items-center gap-2 transition">
              {spinActive
                ? <ToggleRight size={32} className="text-green-400" />
                : <ToggleLeft size={32} className="text-gray-500" />}
              <span className={`text-xs font-bold ${spinActive ? 'text-green-400' : 'text-gray-500'}`}>
                {spinActive ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>

          {/* Status */}
          <div className={`rounded-xl p-2.5 mb-3 text-center text-xs font-semibold ${
            spinActive
              ? 'bg-green-500/10 border border-green-500/20 text-green-400'
              : 'bg-gray-500/10 border border-gray-500/20 text-gray-400'
          }`}>
            {spinActive ? '✅ Spin Wheel site pe visible hai' : '❌ Spin Wheel hidden hai'}
          </div>

          {/* Prizes List */}
          <div className="space-y-1.5 mb-3">
            {prizes.map((prize, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: prize.color }} />
                <span className="text-white text-xs flex-1">{prize.label}</span>
                {prize.code && <span className="text-purple-400 text-[10px] font-bold">{prize.code}</span>}
                <span className="text-gray-500 text-[10px]">{prize.probability}%</span>
              </div>
            ))}
          </div>

          {/* Edit Prizes Toggle */}
          <button onClick={() => setShowPrizeEditor(!showPrizeEditor)}
            className="w-full py-2 rounded-xl border border-border text-gray-300 text-xs font-semibold hover:border-gold hover:text-gold transition flex items-center justify-center gap-1.5">
            <Edit3 size={12} /> {showPrizeEditor ? 'Close Editor' : 'Edit Prizes'}
          </button>

          {/* Prize Editor */}
          {showPrizeEditor && (
            <div className="mt-3 space-y-2">
              <p className="text-gray-400 text-[10px] uppercase tracking-wider">Prizes Edit Karo</p>
              {prizes.map((prize, idx) => (
                <div key={idx} className="bg-card border border-border rounded-xl p-2.5 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: prize.color }} />
                    <input value={prize.label} onChange={e => handlePrizeEdit(idx, 'label', e.target.value)}
                      className="flex-1 bg-secondary border border-border rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:border-gold" />
                    <input value={prize.code || ''} onChange={e => handlePrizeEdit(idx, 'code', e.target.value || null)}
                      placeholder="CODE"
                      className="w-20 bg-secondary border border-border rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:border-gold" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 flex-1">
                      <span className="text-gray-500 text-[10px]">Prob%:</span>
                      <input type="number" value={prize.probability}
                        onChange={e => handlePrizeEdit(idx, 'probability', e.target.value)}
                        className="w-14 bg-secondary border border-border rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:border-gold" />
                    </div>
                    <div className="flex items-center gap-1 flex-1">
                      <span className="text-gray-500 text-[10px]">Color:</span>
                      <input type="color" value={prize.color}
                        onChange={e => handlePrizeEdit(idx, 'color', e.target.value)}
                        className="w-8 h-6 rounded border border-border cursor-pointer bg-secondary" />
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={handleSavePrizes} disabled={savingSpin}
                className="w-full py-2 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-1.5 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg,#6C3AE8,#C084FC)' }}>
                {savingSpin ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><Check size={12} /> Prizes Save Karo</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminStoreFeatures;