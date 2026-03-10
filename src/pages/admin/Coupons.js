import { useState } from 'react';
import { Plus, Trash2, Tag, Copy, Check, X, Percent, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';

// Note: Ye frontend-only coupon manager hai.
// Backend mein Coupon model already hai — baad mein API connect kar sakte ho.
// Abhi localStorage mein save hoga.

const defaultCoupons = [
  { id: 1, code: 'CROWN10', type: 'percent', discount: 10, minOrder: 0, active: true, uses: 0, desc: '10% off on all orders' },
  { id: 2, code: 'FIRST50', type: 'flat', discount: 50, minOrder: 299, active: true, uses: 0, desc: '₹50 off on orders above ₹299' },
  { id: 3, code: 'SAVE100', type: 'flat', discount: 100, minOrder: 499, active: true, uses: 0, desc: '₹100 off on orders above ₹499' },
  { id: 4, code: 'ROYAL20', type: 'percent', discount: 20, minOrder: 599, active: false, uses: 0, desc: '20% off on orders above ₹599' },
];

const emptyForm = { code: '', type: 'percent', discount: '', minOrder: 0, desc: '' };

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState(() => {
    try {
      const saved = localStorage.getItem('crownbay_coupons');
      return saved ? JSON.parse(saved) : defaultCoupons;
    } catch { return defaultCoupons; }
  });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [copiedId, setCopiedId] = useState(null);

  const save = (updated) => {
    setCoupons(updated);
    try { localStorage.setItem('crownbay_coupons', JSON.stringify(updated)); } catch {}
  };

  const handleAdd = () => {
    if (!form.code || !form.discount) return toast.error('Code aur discount daalo!');
    const code = form.code.trim().toUpperCase();
    if (coupons.find(c => c.code === code)) return toast.error('Ye code already exist karta hai!');

    const newCoupon = {
      id: Date.now(), ...form, code,
      discount: Number(form.discount),
      minOrder: Number(form.minOrder) || 0,
      active: true, uses: 0,
    };
    save([...coupons, newCoupon]);
    setForm(emptyForm);
    setShowForm(false);
    toast.success('Coupon add ho gaya! 🎉');
  };

  const handleToggle = (id) => {
    save(coupons.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  const handleDelete = (id) => {
    if (!window.confirm('Coupon delete karna chahte ho?')) return;
    save(coupons.filter(c => c.id !== id));
    toast.success('Coupon delete ho gaya!');
  };

  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success('Coupon code copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const activeCoupons = coupons.filter(c => c.active).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Tag size={22} className="text-gold" /> Coupon Management
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {activeCoupons} active • {coupons.length} total coupons
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-gold text-black px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-gold-light transition text-sm">
          <Plus size={18} /> New Coupon
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-card border border-gold/30 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold">Create New Coupon</h3>
            <button onClick={() => setShowForm(false)}>
              <X size={18} className="text-gray-400 hover:text-white" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 md:col-span-1">
              <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Coupon Code *</label>
              <input
                value={form.code}
                onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="SAVE50"
                className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold transition uppercase tracking-widest"
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Type *</label>
              <div className="flex gap-2">
                {[
                  { v: 'percent', label: '% Percent', icon: Percent },
                  { v: 'flat', label: '₹ Flat', icon: IndianRupee },
                ].map(t => (
                  <button key={t.v} onClick={() => setForm({ ...form, type: t.v })}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-sm font-semibold transition ${
                      form.type === t.v ? 'border-gold bg-gold/10 text-gold' : 'border-border text-gray-400 hover:border-gold/50'
                    }`}>
                    <t.icon size={14} /> {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">
                Discount {form.type === 'percent' ? '(%)' : '(₹)'} *
              </label>
              <input type="number"
                value={form.discount}
                onChange={e => setForm({ ...form, discount: e.target.value })}
                placeholder={form.type === 'percent' ? '10' : '100'}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold transition"
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Min Order (₹)</label>
              <input type="number"
                value={form.minOrder}
                onChange={e => setForm({ ...form, minOrder: e.target.value })}
                placeholder="0 = no minimum"
                className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold transition"
              />
            </div>
            <div className="col-span-2">
              <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Description</label>
              <input
                value={form.desc}
                onChange={e => setForm({ ...form, desc: e.target.value })}
                placeholder="10% off on all orders"
                className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold transition"
              />
            </div>
          </div>

          {/* Preview */}
          {form.code && form.discount && (
            <div className="mt-3 bg-gold/5 border border-gold/20 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Preview</p>
                <p className="text-white font-bold font-mono tracking-widest">{form.code}</p>
              </div>
              <div className="text-right">
                <p className="text-gold font-bold text-lg">
                  {form.type === 'percent' ? `${form.discount}% OFF` : `₹${form.discount} OFF`}
                </p>
                {Number(form.minOrder) > 0 && (
                  <p className="text-gray-400 text-xs">Min order: ₹{form.minOrder}</p>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <button onClick={() => setShowForm(false)}
              className="flex-1 border border-border text-gray-300 py-2.5 rounded-xl text-sm hover:border-gold transition">
              Cancel
            </button>
            <button onClick={handleAdd}
              className="flex-1 bg-gold text-black py-2.5 rounded-xl font-bold text-sm hover:bg-gold-light transition">
              Create Coupon
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Total Coupons', value: coupons.length, color: 'text-white' },
          { label: 'Active', value: activeCoupons, color: 'text-green-400' },
          { label: 'Inactive', value: coupons.length - activeCoupons, color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Coupons List */}
      <div className="space-y-3">
        {coupons.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Tag size={36} className="mx-auto mb-3 opacity-30" />
            <p>Koi coupon nahi hai. Pehla coupon create karo!</p>
          </div>
        ) : (
          coupons.map(coupon => (
            <div key={coupon.id}
              className={`border rounded-2xl p-4 transition ${
                coupon.active
                  ? 'bg-card border-border hover:border-gold/30'
                  : 'bg-card/50 border-border/50 opacity-60'
              }`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-4 min-w-0">
                  {/* Discount Badge */}
                  <div className={`shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center border ${
                    coupon.active
                      ? 'bg-gold/10 border-gold/30'
                      : 'bg-secondary border-border'
                  }`}>
                    {coupon.type === 'percent'
                      ? <><span className={`font-bold text-lg leading-none ${coupon.active ? 'text-gold' : 'text-gray-400'}`}>{coupon.discount}%</span>
                          <span className="text-gray-500 text-xs">OFF</span></>
                      : <><span className={`font-bold text-lg leading-none ${coupon.active ? 'text-gold' : 'text-gray-400'}`}>₹{coupon.discount}</span>
                          <span className="text-gray-500 text-xs">OFF</span></>
                    }
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-bold font-mono tracking-widest">{coupon.code}</span>
                      <button onClick={() => handleCopy(coupon.code, coupon.id)}
                        className="text-gray-400 hover:text-gold transition">
                        {copiedId === coupon.id
                          ? <Check size={14} className="text-green-400" />
                          : <Copy size={14} />}
                      </button>
                    </div>
                    <p className="text-gray-400 text-xs mt-0.5">{coupon.desc || `${coupon.type === 'percent' ? coupon.discount + '%' : '₹' + coupon.discount} off`}</p>
                    {coupon.minOrder > 0 && (
                      <p className="text-gray-500 text-xs">Min order: ₹{coupon.minOrder}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Toggle */}
                  <button onClick={() => handleToggle(coupon.id)}
                    className={`relative w-10 h-6 rounded-full transition ${
                      coupon.active ? 'bg-green-500' : 'bg-gray-600'
                    }`}>
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                      coupon.active ? 'left-4' : 'left-0.5'
                    }`} />
                  </button>

                  {/* Delete */}
                  <button onClick={() => handleDelete(coupon.id)}
                    className="w-8 h-8 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-center hover:bg-red-500/20 hover:border-red-500 transition">
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Note */}
      <div className="mt-6 bg-gold/5 border border-gold/20 rounded-xl p-4">
        <p className="text-gold text-xs font-bold mb-1">💡 Note</p>
        <p className="text-gray-400 text-xs">
          Ye coupons Cart page mein already kaam kar rahe hain (CROWN10, FIRST50, SAVE100, ROYAL20).
          Naye coupons ke liye Cart.js mein bhi COUPONS object update karo, ya backend Coupon API se connect karo.
        </p>
      </div>
    </div>
  );
};

export default AdminCoupons;