import { useState, useEffect } from 'react';
import { Zap, Search, X, Check, Package } from 'lucide-react';
import { getProducts } from '../../utils/api';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminDealOfDay = () => {
  const [currentDeal, setCurrentDeal] = useState(null);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [dealPrice, setDealPrice] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeal();
    fetchProducts();
  }, []);

  const fetchDeal = async () => {
    try {
      const res = await fetch(`${API_URL}/products/deal-of-day`);
      const data = await res.json();
      setCurrentDeal(data.deal?.product ? data.deal : null);
    } catch {} finally { setLoading(false); }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await getProducts({ limit: 500 });
      setProducts(data.products || []);
    } catch {}
  };

  const filteredProducts = products.filter(p =>
    search ? p.name.toLowerCase().includes(search.toLowerCase()) : false
  ).slice(0, 8);

  const handleSave = async () => {
    if (!selected) return toast.error('Product select karo!');
    if (!dealPrice || Number(dealPrice) <= 0) return toast.error('Deal price daalo!');
    if (Number(dealPrice) >= selected.sellingPrice) return toast.error('Deal price selling price se kam hona chahiye!');
    setSaving(true);
    try {
      const token = localStorage.getItem('crownbay_token');
      const res = await fetch(`${API_URL}/products/deal-of-day`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId: selected._id, dealPrice: Number(dealPrice) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('Deal of Day set ho gaya! 🔥');
      setCurrentDeal(data.deal);
      setSelected(null); setSearch(''); setDealPrice('');
    } catch (err) { toast.error(err.message || 'Error aaya!'); }
    finally { setSaving(false); }
  };

  const handleRemove = async () => {
    if (!window.confirm('Deal remove karna chahte ho?')) return;
    try {
      const token = localStorage.getItem('crownbay_token');
      await fetch(`${API_URL}/products/deal-of-day`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Deal remove ho gaya!');
      setCurrentDeal(null);
    } catch { toast.error('Error aaya!'); }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5 mb-6">
      <h3 className="text-white font-bold flex items-center gap-2 mb-4">
        <Zap size={18} className="text-gold fill-gold" /> Deal of The Day
      </h3>

      {/* Current Deal */}
      {currentDeal && (
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <img src={currentDeal.product?.images?.[0]} alt="" className="w-14 h-14 object-cover rounded-xl border border-border" />
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm line-clamp-1">{currentDeal.product?.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-red-400 line-through text-xs">₹{currentDeal.product?.sellingPrice}</span>
                <span className="text-green-400 font-bold text-sm">₹{currentDeal.dealPrice}</span>
                <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full border border-green-500/30">
                  {Math.round(((currentDeal.product?.sellingPrice - currentDeal.dealPrice) / currentDeal.product?.sellingPrice) * 100)}% OFF
                </span>
              </div>
              <p className="text-gray-500 text-xs mt-0.5">
                Expires: {new Date(currentDeal.endsAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                {currentDeal.setBy === 'auto' && <span className="ml-2 text-purple-400">(Auto)</span>}
              </p>
            </div>
            <button onClick={handleRemove}
              className="w-8 h-8 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-center hover:bg-red-500/20 transition">
              <X size={14} className="text-red-400" />
            </button>
          </div>
        </div>
      )}

      {/* Set New Deal */}
      <div className="space-y-3">
        <p className="text-gray-400 text-xs uppercase tracking-wider">
          {currentDeal ? 'Override Deal' : 'Set Deal of The Day'}
        </p>

        {/* Product Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => { setSearch(e.target.value); setSelected(null); }}
            placeholder="Product search karo..."
            className="w-full bg-secondary border border-border rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold transition" />
        </div>

        {/* Search Results */}
        {filteredProducts.length > 0 && !selected && (
          <div className="border border-border rounded-xl overflow-hidden max-h-48 overflow-y-auto">
            {filteredProducts.map(p => (
              <button key={p._id} type="button"
                onClick={() => { setSelected(p); setSearch(p.name); setDealPrice(Math.round(p.sellingPrice * 0.85).toString()); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-secondary transition text-left border-b border-border last:border-0">
                <img src={p.images?.[0]} alt="" className="w-9 h-9 object-cover rounded-lg border border-border shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm line-clamp-1">{p.name}</p>
                  <p className="text-gray-400 text-xs">₹{p.sellingPrice} • Stock: {p.stock}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {selected && (
          <div className="flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-xl px-3 py-2">
            <img src={selected.images?.[0]} alt="" className="w-8 h-8 object-cover rounded-lg border border-border shrink-0" />
            <span className="text-gold text-sm font-medium flex-1 line-clamp-1">{selected.name}</span>
            <button onClick={() => { setSelected(null); setSearch(''); setDealPrice(''); }}>
              <X size={14} className="text-gray-400" />
            </button>
          </div>
        )}

        {/* Deal Price */}
        {selected && (
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">
              Deal Price (Original: ₹{selected.sellingPrice})
            </label>
            <input type="number" value={dealPrice} onChange={e => setDealPrice(e.target.value)}
              placeholder={Math.round(selected.sellingPrice * 0.85).toString()}
              className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold transition" />
            {dealPrice && Number(dealPrice) < selected.sellingPrice && (
              <p className="text-green-400 text-xs mt-1">
                ✅ {Math.round(((selected.sellingPrice - Number(dealPrice)) / selected.sellingPrice) * 100)}% discount • Customer saves ₹{selected.sellingPrice - Number(dealPrice)}
              </p>
            )}
          </div>
        )}

        <button onClick={handleSave} disabled={saving || !selected || !dealPrice}
          className="w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg,#6C3AE8,#C084FC)', color: 'white' }}>
          {saving
            ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
            : <><Zap size={16} /> Set Deal of The Day</>}
        </button>
      </div>
    </div>
  );
};

export default AdminDealOfDay;