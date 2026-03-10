// ═══════════════════════════════════════════════════
// src/pages/admin/AdminNotifications.jsx — NAYI FILE
// ═══════════════════════════════════════════════════
import { useState, useEffect } from 'react';
import { Bell, Send, Users, Image, Link, RefreshCw, CheckCircle } from 'lucide-react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const templates = [
  { label: '🔥 Flash Sale', title: 'Flash Sale Live! ⚡', body: 'Aaj sirf! 40% OFF on everything. Code: FLASH40' },
  { label: '✨ New Arrivals', title: 'New Arrivals! ✨', body: 'Fresh styles aa gaye hain. Check karo abhi!' },
  { label: '🎉 Special Offer', title: 'Special Offer Sirf Aapke Liye! 🎁', body: 'Limited time offer — hurry up!' },
  { label: '🚚 Free Delivery', title: 'Free Delivery Today! 🚚', body: '₹499 se upar saare orders pe free delivery.' },
  { label: '⭐ Weekend Sale', title: 'Weekend Sale Start! 🎊', body: 'Sabse saste damm pe shopping karo is weekend.' },
];

const AdminNotifications = () => {
  const [form, setForm] = useState({ title: '', body: '', image: '', url: '/' });
  const [sending, setSending] = useState(false);
  const [stats, setStats] = useState({ total: 0 });
  const [lastResult, setLastResult] = useState(null);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const { data } = await API.get('/notifications/stats');
      setStats(data);
    } catch {}
  };

  const applyTemplate = (t) => {
    setForm(f => ({ ...f, title: t.title, body: t.body }));
  };

  const handleSend = async () => {
    if (!form.title || !form.body) return toast.error('Title aur message daalo!');
    setSending(true);
    try {
      const { data } = await API.post('/notifications/send', form);
      setLastResult(data);
      toast.success(`${data.sent} users ko notification bhej diya! 🔔`);
      setForm({ title: '', body: '', image: '', url: '/' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Send nahi hua!');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#6C3AE8,#C084FC)' }}>
            <Bell size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Push Notifications</h1>
            <p className="text-gray-400 text-xs">Saare users ko ek saath notify karo</p>
          </div>
        </div>
        <button onClick={fetchStats}
          className="flex items-center gap-1 text-gray-400 hover:text-white text-xs border border-border px-3 py-1.5 rounded-xl transition">
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {/* Subscriber Count */}
      <div className="border rounded-2xl p-5 mb-5"
        style={{ background: 'rgba(108,58,232,0.08)', borderColor: 'rgba(108,58,232,0.3)' }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#6C3AE8,#C084FC)' }}>
            <Users size={22} className="text-white" />
          </div>
          <div>
            <p className="text-4xl font-black text-white">{stats.total}</p>
            <p className="text-gray-400 text-sm">Total Subscribers</p>
          </div>
        </div>
        {stats.total === 0 && (
          <p className="text-gray-500 text-xs mt-3">
            💡 Jab users website visit karenge aur notification allow karenge — tab count badhega
          </p>
        )}
      </div>

      {/* Last Result */}
      {lastResult && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 mb-5 flex items-center gap-3">
          <CheckCircle size={20} className="text-green-400 shrink-0" />
          <div>
            <p className="text-green-400 font-bold text-sm">Successfully Sent!</p>
            <p className="text-gray-400 text-xs">{lastResult.sent} users ko mila • {lastResult.failed} failed</p>
          </div>
        </div>
      )}

      {/* Quick Templates */}
      <div className="mb-5">
        <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">Quick Templates</p>
        <div className="flex flex-wrap gap-2">
          {templates.map((t, i) => (
            <button key={i} onClick={() => applyTemplate(t)}
              className="text-xs px-3 py-1.5 rounded-xl border border-border text-gray-300 hover:border-purple-500/50 hover:text-white transition">
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Compose Form */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <p className="text-white font-bold flex items-center gap-2">
          <Send size={16} className="text-purple-400" /> Notification Compose Karo
        </p>

        <div>
          <label className="text-gray-400 text-xs mb-1.5 block">Title *</label>
          <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
            placeholder="e.g. Flash Sale Live! ⚡"
            className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 transition" />
        </div>

        <div>
          <label className="text-gray-400 text-xs mb-1.5 block">Message *</label>
          <textarea value={form.body} onChange={e => setForm({...form, body: e.target.value})}
            placeholder="e.g. Aaj sirf! 40% OFF on everything. Code: FLASH40"
            rows={3}
            className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 transition resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-gray-400 text-xs mb-1.5 flex items-center gap-1 block">
              <Image size={11} /> Image URL (optional)
            </label>
            <input value={form.image} onChange={e => setForm({...form, image: e.target.value})}
              placeholder="https://..."
              className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 transition" />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1.5 flex items-center gap-1 block">
              <Link size={11} /> Click URL (optional)
            </label>
            <input value={form.url} onChange={e => setForm({...form, url: e.target.value})}
              placeholder="/products"
              className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 transition" />
          </div>
        </div>

        {/* Preview */}
        {(form.title || form.body) && (
          <div className="bg-secondary rounded-xl p-3 border border-border">
            <p className="text-gray-400 text-xs mb-2">Preview:</p>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg,#6C3AE8,#C084FC)' }}>
                <span className="text-white text-xs font-bold">A</span>
              </div>
              <div>
                <p className="text-white text-sm font-bold">{form.title || 'Title...'}</p>
                <p className="text-gray-400 text-xs mt-0.5">{form.body || 'Message...'}</p>
              </div>
            </div>
          </div>
        )}

        <button onClick={handleSend} disabled={sending || stats.total === 0}
          className="w-full text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg,#6C3AE8,#C084FC)' }}>
          {sending
            ? <><RefreshCw size={16} className="animate-spin" /> Sending...</>
            : <><Send size={16} /> Send to {stats.total} Subscribers</>
          }
        </button>
      </div>
    </div>
  );
};

export default AdminNotifications;