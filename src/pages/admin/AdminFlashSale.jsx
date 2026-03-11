import { useState, useEffect } from 'react';
import { Zap, Trash2, RefreshCw, CheckCircle, Edit2, X } from 'lucide-react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const AdminFlashSale = () => {
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: 'Flash Sale',
    discount: 40,
    code: 'FLASH40',
    endTime: '',
    message: '',
  });

  useEffect(() => { fetchSale(); }, []);

  const fetchSale = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/flashsale');
      setSale(data.sale);
      if (data.sale) {
        setForm({
          title: data.sale.title,
          discount: data.sale.discount,
          code: data.sale.code,
          endTime: new Date(data.sale.endTime).toISOString().slice(0, 16),
          message: data.sale.message || '',
        });
      }
    } catch {
      toast.error('Flash sale load nahi hua!');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.endTime) return toast.error('End time daalo!');
    if (!form.code) return toast.error('Coupon code daalo!');
    setSaving(true);
    try {
      if (sale) {
        await API.put(`/flashsale/${sale._id}`, { ...form, isActive: true });
        toast.success('Flash sale update ho gaya! ✅');
      } else {
        await API.post('/flashsale', form);
        toast.success('Flash sale create ho gaya! 🎉');
      }
      setShowForm(false);
      fetchSale();
    } catch {
      toast.error('Save nahi hua!');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async () => {
    if (!sale) return;
    setSaving(true);
    try {
      await API.put(`/flashsale/${sale._id}`, { isActive: !sale.isActive });
      toast.success(sale.isActive ? 'Flash sale band ho gaya!' : 'Flash sale chalu ho gaya!');
      fetchSale();
    } catch {
      toast.error('Update nahi hua!');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!sale || !window.confirm('Flash sale delete karna chahte ho?')) return;
    try {
      await API.delete(`/flashsale/${sale._id}`);
      toast.success('Flash sale delete ho gaya!');
      setSale(null);
      setShowForm(false);
    } catch {
      toast.error('Delete nahi hua!');
    }
  };

  const isExpired = sale && new Date(sale.endTime) < new Date();
  const timeLeft = sale ? Math.max(0, new Date(sale.endTime) - new Date()) : 0;
  const hoursLeft = Math.floor(timeLeft / 3600000);
  const minsLeft = Math.floor((timeLeft % 3600000) / 60000);

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
            <Zap size={20} className="text-red-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Flash Sale Manager</h1>
            <p className="text-gray-400 text-xs">Homepage banner control karo</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-gold text-black px-4 py-2 rounded-xl font-bold text-sm hover:bg-gold-light transition">
          {showForm ? <><X size={14} /> Cancel</> : <><Edit2 size={14} /> {sale ? 'Edit Sale' : 'New Sale'}</>}
        </button>
      </div>

      {/* Current Sale Status */}
      {sale ? (
        <div className={`border rounded-2xl p-5 mb-5 ${
          sale.isActive && !isExpired
            ? 'bg-red-500/5 border-red-500/30'
            : 'bg-card border-border'
        }`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-white font-bold text-lg">{sale.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  isExpired ? 'bg-gray-500/20 text-gray-400' :
                  sale.isActive ? 'bg-green-500/20 text-green-400 border border-green-500/20' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {isExpired ? 'Expired' : sale.isActive ? '● Live' : '● Paused'}
                </span>
              </div>
              {sale.message && <p className="text-gray-400 text-sm">{sale.message}</p>}
            </div>
            <button onClick={handleDelete} className="text-gray-500 hover:text-red-400 transition">
              <Trash2 size={16} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-card rounded-xl p-3 text-center border border-border">
              <p className="text-gold font-black text-2xl">{sale.discount}%</p>
              <p className="text-gray-400 text-xs">Discount</p>
            </div>
            <div className="bg-card rounded-xl p-3 text-center border border-border">
              <p className="text-white font-bold text-lg font-mono">{sale.code}</p>
              <p className="text-gray-400 text-xs">Coupon Code</p>
            </div>
            <div className="bg-card rounded-xl p-3 text-center border border-border">
              {isExpired ? (
                <>
                  <p className="text-red-400 font-bold text-sm">Khatam!</p>
                  <p className="text-gray-400 text-xs">Expired</p>
                </>
              ) : (
                <>
                  <p className="text-cyan-400 font-bold text-lg">{hoursLeft}h {minsLeft}m</p>
                  <p className="text-gray-400 text-xs">Time Left</p>
                </>
              )}
            </div>
          </div>

          <div className="text-gray-400 text-xs mb-4">
            End Time: <span className="text-white">
              {new Date(sale.endTime).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <button onClick={handleToggle} disabled={saving || isExpired}
            className={`w-full py-2.5 rounded-xl font-bold text-sm transition disabled:opacity-40 ${
              sale.isActive
                ? 'border border-red-500/30 text-red-400 hover:bg-red-500/10'
                : 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
            }`}>
            {saving ? 'Updating...' : sale.isActive ? '⏸ Banner Band Karo' : '▶ Banner Chalu Karo'}
          </button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-8 text-center mb-5">
          <Zap size={40} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">Koi active flash sale nahi hai</p>
          <p className="text-gray-500 text-sm mt-1">Upar "New Sale" click karo</p>
        </div>
      )}

      {/* Create / Edit Form */}
      {showForm && (
        <div className="bg-card border border-gold/20 rounded-2xl p-5">
          <h3 className="text-white font-bold mb-4">{sale ? 'Sale Update Karo' : 'Nayi Sale Banao'}</h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 text-xs mb-1.5 block">Sale Title</label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                  placeholder="Flash Sale"
                  className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gold transition" />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1.5 block">Discount %</label>
                <input type="number" value={form.discount} onChange={e => setForm({...form, discount: Number(e.target.value)})}
                  min="1" max="100"
                  className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gold transition" />
              </div>
            </div>

            <div>
              <label className="text-gray-400 text-xs mb-1.5 block">Coupon Code (banner pe dikhega)</label>
              <input value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
                placeholder="FLASH40"
                className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-gold transition" />
            </div>

            <div>
              <label className="text-gray-400 text-xs mb-1.5 block">Sale End Time ⏰</label>
              <input type="datetime-local" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})}
                className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gold transition" />
            </div>

            <div>
              <label className="text-gray-400 text-xs mb-1.5 block">Message (optional)</label>
              <input value={form.message} onChange={e => setForm({...form, message: e.target.value})}
                placeholder="e.g. Sirf aaj ke liye!"
                className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gold transition" />
            </div>

            {/* Preview */}
            <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 rounded-xl p-3 text-white text-sm font-bold text-center">
              ⚡ {form.title} — {form.discount}% OFF! Code: {form.code || 'FLASH40'}
            </div>

            <button onClick={handleSave} disabled={saving}
              className="w-full bg-gold text-black py-3 rounded-xl font-bold hover:bg-gold-light transition disabled:opacity-50 flex items-center justify-center gap-2">
              {saving
                ? <><RefreshCw size={16} className="animate-spin" /> Saving...</>
                : <><CheckCircle size={16} /> {sale ? 'Update Flash Sale' : 'Create Flash Sale'}</>
              }
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFlashSale;