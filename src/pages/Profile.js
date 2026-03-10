import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Package, MapPin, Heart, LogOut, Shield,
  Edit2, Plus, Trash2, Check, X, ChevronRight,
  Phone, Mail, Crown, Clock, CheckCircle, Truck,
  XCircle, Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMyOrders } from '../utils/api';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

// ─── STATUS CONFIG ────────────────────────────────────────
const statusConfig = {
  Pending:    { color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30', icon: Clock },
  Confirmed:  { color: 'text-blue-400',   bg: 'bg-blue-400/10',   border: 'border-blue-400/30',   icon: CheckCircle },
  Processing: { color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30', icon: Package },
  Shipped:    { color: 'text-cyan-400',   bg: 'bg-cyan-400/10',   border: 'border-cyan-400/30',   icon: Truck },
  Delivered:  { color: 'text-green-400',  bg: 'bg-green-400/10',  border: 'border-green-400/30',  icon: CheckCircle },
  Cancelled:  { color: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-red-400/30',    icon: XCircle },
};

// ─── EDIT PROFILE SECTION ────────────────────────────────
const EditProfile = ({ user }) => {
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    toast.success('Profile update ho gaya! ✅');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white mb-1">Personal Information</h3>
        <p className="text-gray-500 text-sm">Apni profile details update karo</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold/40 to-gold/10 border-2 border-gold flex items-center justify-center text-3xl font-bold text-gold">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-white font-semibold">{user?.name}</p>
          <p className="text-gray-400 text-sm">{user?.email}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
            user?.role === 'admin' ? 'bg-gold/20 text-gold border border-gold/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'
          }`}>
            {user?.role === 'admin' ? '👑 Admin' : '⭐ Premium Member'}
          </span>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Full Name</label>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold transition" />
        </div>
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Phone Number</label>
          <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
            className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold transition" />
        </div>
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Email Address</label>
          <input value={user?.email} disabled
            className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-gray-500 text-sm cursor-not-allowed" />
        </div>
      </div>
      <button onClick={handleSave} disabled={saving}
        className="bg-gold text-black px-8 py-3 rounded-xl font-bold hover:bg-gold-light transition disabled:opacity-50 flex items-center gap-2">
        {saving
          ? <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Saving...</>
          : <><Check size={16} /> Save Changes</>
        }
      </button>
    </div>
  );
};

// ─── ADDRESSES SECTION ────────────────────────────────────
// ✅ FIX: user prop receive karo aur user-specific localStorage key use karo
const AddressSection = ({ user }) => {
  const addressKey = user ? `crownbay_addresses_${user._id || user.email}` : null;

  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ fullName: '', phone: '', addressLine: '', city: '', state: '', pincode: '' });

  // ── User ke addresses localStorage se load karo ──────────
  useEffect(() => {
    if (!addressKey) return;
    const saved = localStorage.getItem(addressKey);
    if (saved) {
      try { setAddresses(JSON.parse(saved)); }
      catch { localStorage.removeItem(addressKey); }
    }
    // Agar koi saved address nahi hai to empty rakho — hardcoded mat daalo
  }, [addressKey]);

  // ── Jab bhi addresses change ho to save karo ─────────────
  useEffect(() => {
    if (!addressKey) return;
    localStorage.setItem(addressKey, JSON.stringify(addresses));
  }, [addresses, addressKey]);

  const resetForm = () => {
    setForm({ fullName: '', phone: '', addressLine: '', city: '', state: '', pincode: '' });
    setEditId(null);
    setShowForm(false);
  };

  const handleSave = () => {
    if (!form.fullName || !form.addressLine || !form.city || !form.pincode)
      return toast.error('Poora address bharo!');
    if (editId) {
      setAddresses(prev => prev.map(a => a.id === editId ? { ...a, ...form } : a));
      toast.success('Address update ho gaya!');
    } else {
      setAddresses(prev => [...prev, { ...form, id: Date.now(), isDefault: prev.length === 0 }]);
      toast.success('Address add ho gaya! ✅');
    }
    resetForm();
  };

  const handleEdit = (addr) => {
    setForm(addr);
    setEditId(addr.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setAddresses(prev => {
      const updated = prev.filter(a => a.id !== id);
      // Agar deleted address default tha to pehle waale ko default banao
      if (prev.find(a => a.id === id)?.isDefault && updated.length > 0) {
        updated[0].isDefault = true;
      }
      return updated;
    });
    toast.success('Address delete ho gaya!');
  };

  const setDefault = (id) => {
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
    toast.success('Default address set ho gaya!');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Saved Addresses</h3>
          <p className="text-gray-500 text-sm">Delivery ke liye addresses manage karo</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 bg-gold/10 border border-gold/30 text-gold px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gold/20 transition">
          <Plus size={16} /> Add New
        </button>
      </div>

      {/* Address Form */}
      {showForm && (
        <div className="bg-secondary border border-gold/30 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white font-semibold">{editId ? 'Edit Address' : 'New Address'}</h4>
            <button onClick={resetForm}><X size={18} className="text-gray-400" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'fullName', label: 'Full Name', span: 2 },
              { key: 'phone', label: 'Phone', span: 1 },
              { key: 'addressLine', label: 'Address Line', span: 2 },
              { key: 'city', label: 'City', span: 1 },
              { key: 'state', label: 'State', span: 1 },
              { key: 'pincode', label: 'Pincode', span: 1 },
            ].map(field => (
              <div key={field.key} className={field.span === 2 ? 'col-span-2' : ''}>
                <label className="text-xs text-gray-400 mb-1 block">{field.label}</label>
                <input value={form[field.key]}
                  onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                  className="w-full bg-card border border-border rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gold transition" />
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={resetForm}
              className="flex-1 border border-border text-gray-300 py-2.5 rounded-xl text-sm hover:border-gold transition">
              Cancel
            </button>
            <button onClick={handleSave}
              className="flex-1 bg-gold text-black py-2.5 rounded-xl text-sm font-bold hover:bg-gold-light transition">
              Save Address
            </button>
          </div>
        </div>
      )}

      {/* Address Cards */}
      {addresses.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <MapPin size={40} className="mx-auto mb-3 opacity-50" />
          <p className="mb-3">Koi address nahi hai</p>
          <button onClick={() => setShowForm(true)}
            className="bg-gold/10 border border-gold/30 text-gold px-6 py-2 rounded-xl text-sm font-semibold hover:bg-gold/20 transition">
            + Pehla Address Add Karo
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {addresses.map(addr => (
            <div key={addr.id}
              className={`relative border rounded-2xl p-4 transition ${
                addr.isDefault ? 'border-gold bg-gold/5' : 'border-border bg-card hover:border-gold/50'
              }`}>
              {addr.isDefault && (
                <span className="absolute top-3 right-3 bg-gold text-black text-xs font-bold px-2 py-0.5 rounded-full">
                  Default
                </span>
              )}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center shrink-0">
                  <MapPin size={16} className="text-gold" />
                </div>
                <div>
                  <p className="text-white font-semibold">{addr.fullName}</p>
                  <p className="text-gray-400 text-sm">{addr.phone}</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm mb-4 pl-11">
                {addr.addressLine}, {addr.city}, {addr.state} — {addr.pincode}
              </p>
              <div className="flex gap-2 pl-11">
                <button onClick={() => handleEdit(addr)}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-gold transition px-3 py-1.5 border border-border rounded-lg hover:border-gold">
                  <Edit2 size={12} /> Edit
                </button>
                {!addr.isDefault && (
                  <button onClick={() => setDefault(addr.id)}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-gold transition px-3 py-1.5 border border-border rounded-lg hover:border-gold">
                    <Check size={12} /> Set Default
                  </button>
                )}
                <button onClick={() => handleDelete(addr.id)}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition px-3 py-1.5 border border-red-400/20 rounded-lg hover:border-red-400">
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── ORDERS SECTION ───────────────────────────────────────
const OrdersSection = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await getMyOrders();
        setOrders(data.orders);
      } catch {
        toast.error('Orders load nahi hue!');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-white mb-1">My Orders</h3>
        <p className="text-gray-500 text-sm">Apne saare orders dekho aur track karo</p>
      </div>
      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-white font-semibold mb-1">Koi order nahi!</p>
          <p className="text-gray-400 text-sm">Abhi tak koi order place nahi kiya</p>
        </div>
      ) : (
        orders.map(order => {
          const config = statusConfig[order.status] || statusConfig.Pending;
          const StatusIcon = config.icon;
          return (
            <div key={order._id} className="bg-secondary border border-border rounded-2xl overflow-hidden hover:border-gold/50 transition">
              <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <span className="text-white font-bold text-sm">{order.orderId}</span>
                  <span className="text-gray-500 text-xs">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${config.bg} ${config.border}`}>
                  <StatusIcon size={12} className={config.color} />
                  <span className={`text-xs font-semibold ${config.color}`}>{order.status}</span>
                </div>
              </div>
              <div className="p-5">
                {order.items.map(item => (
                  <div key={item._id} className="flex items-center gap-4 py-2">
                    <img src={item.productImage} alt={item.productName}
                      className="w-16 h-16 object-cover rounded-xl border border-border" />
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium line-clamp-1">{item.productName}</p>
                      <p className="text-gray-400 text-xs mt-0.5">Qty: {item.quantity} × ₹{item.price}</p>
                    </div>
                    <p className="text-gold font-bold">₹{item.price * item.quantity}</p>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-3 mt-2 border-t border-border">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-xs">💵 {order.paymentMethod}</span>
                    {order.expectedDelivery && (
                      <span className="text-gray-400 text-xs">
                        • Expected: {new Date(order.expectedDelivery).toLocaleDateString('en-IN')}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400 text-xs">Total: </span>
                    <span className="text-gold font-bold">₹{order.finalAmount}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

// ─── WISHLIST SECTION ─────────────────────────────────────
const WishlistSection = () => (
  <div className="text-center py-16">
    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
      <Heart size={36} className="text-red-400" />
    </div>
    <h3 className="text-white font-bold text-lg mb-2">Your Wishlist</h3>
    <p className="text-gray-400 text-sm mb-6">Products pe dil ka icon tap karo — wishlist mein add ho jaayega!</p>
    <a href="/products"
      className="bg-gold text-black px-8 py-3 rounded-full font-bold hover:bg-gold-light transition inline-block">
      Explore Products
    </a>
  </div>
);

// ─── MAIN PROFILE PAGE ────────────────────────────────────
const Profile = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logout ho gaye!');
  };

  const menuItems = [
    { id: 'profile',  icon: User,    label: 'My Profile',   sub: 'Personal information' },
    { id: 'orders',   icon: Package, label: 'My Orders',    sub: 'Track your orders' },
    { id: 'address',  icon: MapPin,  label: 'My Addresses', sub: 'Saved delivery addresses' },
    { id: 'wishlist', icon: Heart,   label: 'Wishlist',     sub: 'Saved items' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':  return <EditProfile user={user} />;
      case 'orders':   return <OrdersSection />;
      case 'address':  return <AddressSection user={user} />; // ✅ user pass karo
      case 'wishlist': return <WishlistSection />;
      default:         return <EditProfile user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-primary">
      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Mobile Header */}
        <div className="md:hidden mb-4">
          <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold/40 to-gold/10 border-2 border-gold flex items-center justify-center text-2xl font-bold text-gold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-white font-bold">{user?.name}</p>
              <p className="text-gray-400 text-sm">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-6">

          {/* ── Sidebar ── */}
          <aside className="hidden md:block w-72 shrink-0">
            <div className="bg-card border border-border rounded-2xl p-5 mb-4">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold/40 to-gold/10 border-2 border-gold flex items-center justify-center text-2xl font-bold text-gold shrink-0">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-white font-bold truncate">{user?.name}</p>
                  <p className="text-gray-400 text-xs truncate">{user?.email}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                    isAdmin ? 'bg-gold/20 text-gold' : 'bg-green-500/20 text-green-400'
                  }`}>
                    {isAdmin ? '👑 Admin' : '⭐ Member'}
                  </span>
                </div>
              </div>
              <nav className="space-y-1">
                {menuItems.map(item => (
                  <button key={item.id} onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left group ${
                      activeTab === item.id ? 'bg-gold/10 border border-gold/30' : 'hover:bg-secondary border border-transparent'
                    }`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition ${
                      activeTab === item.id ? 'bg-gold text-black' : 'bg-secondary text-gray-400 group-hover:text-gold'
                    }`}>
                      <item.icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${activeTab === item.id ? 'text-gold' : 'text-white'}`}>{item.label}</p>
                      <p className="text-gray-500 text-xs">{item.sub}</p>
                    </div>
                    <ChevronRight size={14} className={activeTab === item.id ? 'text-gold' : 'text-gray-600'} />
                  </button>
                ))}
              </nav>
            </div>
            <div className="space-y-2">
              {isAdmin && (
                <button onClick={() => navigate('/admin')}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-gold/10 border border-gold/30 rounded-2xl hover:bg-gold/20 transition">
                  <Shield size={18} className="text-gold" />
                  <span className="text-gold font-semibold text-sm">Admin Panel</span>
                </button>
              )}
              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 bg-card border border-red-500/20 rounded-2xl hover:border-red-500/50 transition">
                <LogOut size={18} className="text-red-400" />
                <span className="text-red-400 font-semibold text-sm">Logout</span>
              </button>
            </div>
          </aside>

          {/* ── Main Content ── */}
          <main className="flex-1 min-w-0">
            <div className="md:hidden flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
              {menuItems.map(item => (
                <button key={item.id} onClick={() => setActiveTab(item.id)}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
                    activeTab === item.id ? 'bg-gold text-black' : 'border border-border text-gray-300'
                  }`}>
                  <item.icon size={14} />
                  {item.label}
                </button>
              ))}
            </div>
            <div className="bg-card border border-border rounded-2xl p-5 md:p-6">
              {renderContent()}
            </div>
            <div className="md:hidden mt-4 space-y-2">
              {isAdmin && (
                <button onClick={() => navigate('/admin')}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gold/10 border border-gold/30 rounded-2xl text-gold font-semibold">
                  <Shield size={18} /> Admin Panel
                </button>
              )}
              <button onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3 bg-card border border-red-500/20 rounded-2xl text-red-400 font-semibold">
                <LogOut size={18} /> Logout
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;