import { useState, useEffect } from 'react';
import {
  TrendingUp, Package, RefreshCw, Crown,
  ShoppingBag, Users, Search,
  BarChart2, Trash2, Ban, RotateCcw
} from 'lucide-react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

// ════════════════════════════════════════════════════
// BEST SELLING TAB
// ════════════════════════════════════════════════════
const BestSellingTab = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchBestSelling(); }, []);

  const fetchBestSelling = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/products?sort=popular&limit=20');
      const sorted = [...data.products].sort((a, b) => (b.purchaseCount || 0) - (a.purchaseCount || 0));
      setProducts(sorted);
    } catch {
      toast.error('Load nahi hua!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold flex items-center gap-2">
          <TrendingUp size={16} className="text-gold" /> Best Selling Products
        </h3>
        <button onClick={fetchBestSelling} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gold transition">
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Package size={40} className="mx-auto mb-3 opacity-30" />
          <p>Koi product nahi mila</p>
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((product, i) => (
            <div key={product._id} className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3 hover:border-gold/30 transition">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                i === 0 ? 'bg-gold text-black' :
                i === 1 ? 'bg-gray-400 text-black' :
                i === 2 ? 'bg-amber-700 text-white' :
                'bg-secondary text-gray-400'
              }`}>{i + 1}</span>
              <img src={product.images?.[0]} alt={product.name}
                className="w-10 h-10 rounded-lg object-cover border border-border shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium line-clamp-1">{product.name}</p>
                <p className="text-gray-400 text-xs">{product.category} • ₹{product.sellingPrice}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-gold font-bold text-sm">{product.purchaseCount || 0}</p>
                <p className="text-gray-500 text-xs">sold</p>
              </div>
              {/* Stock badge */}
              <div className={`px-2 py-1 rounded-lg text-xs font-semibold shrink-0 ${
                product.stock === 0 ? 'bg-red-500/20 text-red-400' :
                product.stock <= 5 ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-green-500/20 text-green-400'
              }`}>
                {product.stock === 0 ? 'Out' : `${product.stock} left`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════
// BULK ORDERS TAB
// ════════════════════════════════════════════════════
const BulkOrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('Confirmed');
  const [updating, setUpdating] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Pending');

  const statuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  useEffect(() => { fetchOrders(); }, [filterStatus]);

  const fetchOrders = async () => {
    setLoading(true);
    setSelected([]);
    try {
      const { data } = await API.get(`/orders?status=${filterStatus}&limit=100`);
      setOrders(data.orders);
    } catch {
      toast.error('Orders load nahi hue!');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectAll = () => {
    setSelected(selected.length === orders.length ? [] : orders.map(o => o._id));
  };

  const handleBulkUpdate = async () => {
    if (selected.length === 0) return toast.error('Koi order select nahi kiya!');
    setUpdating(true);
    try {
      await Promise.all(selected.map(id =>
        API.put(`/orders/${id}/status`, { status: bulkStatus, note: `Bulk update: ${bulkStatus}` })
      ));
      toast.success(`${selected.length} orders → ${bulkStatus}! ✅`);
      fetchOrders();
    } catch {
      toast.error('Update nahi hua!');
    } finally {
      setUpdating(false);
    }
  };

  const statusColors = {
    Pending: 'text-yellow-400', Confirmed: 'text-blue-400',
    Processing: 'text-purple-400', Shipped: 'text-cyan-400',
    Delivered: 'text-green-400', Cancelled: 'text-red-400',
  };

  return (
    <div>
      {/* Filter + Bulk Action Bar */}
      <div className="bg-card border border-border rounded-xl p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div>
            <p className="text-gray-400 text-xs mb-1">Filter by Status</p>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="bg-secondary border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gold">
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1">Change Selected To</p>
            <select value={bulkStatus} onChange={e => setBulkStatus(e.target.value)}
              className="bg-secondary border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gold">
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button onClick={handleBulkUpdate} disabled={updating || selected.length === 0}
              className="bg-gold text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-gold-light transition disabled:opacity-40 flex items-center gap-2">
              {updating ? <><RefreshCw size={14} className="animate-spin" /> Updating...</> : `Update ${selected.length > 0 ? `(${selected.length})` : ''}`}
            </button>
          </div>
        </div>
      </div>

      {/* Select All */}
      {orders.length > 0 && (
        <div className="flex items-center gap-3 mb-3 px-1">
          <input type="checkbox"
            checked={selected.length === orders.length && orders.length > 0}
            onChange={selectAll}
            className="w-4 h-4 accent-gold cursor-pointer" />
          <span className="text-gray-400 text-sm">
            {selected.length > 0 ? `${selected.length} selected` : `Select All (${orders.length})`}
          </span>
        </div>
      )}

      {/* Orders List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" />
          <p>Is status mein koi order nahi</p>
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map(order => (
            <div key={order._id}
              onClick={() => toggleSelect(order._id)}
              className={`bg-card border rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer transition ${
                selected.includes(order._id) ? 'border-gold/60 bg-gold/5' : 'border-border hover:border-gold/30'
              }`}>
              <input type="checkbox" checked={selected.includes(order._id)}
                onChange={() => toggleSelect(order._id)}
                onClick={e => e.stopPropagation()}
                className="w-4 h-4 accent-gold cursor-pointer shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white font-bold text-sm">{order.orderId}</p>
                  <span className={`text-xs font-semibold ${statusColors[order.status]}`}>• {order.status}</span>
                </div>
                <p className="text-gray-400 text-xs">{order.customer?.name} • {order.customer?.phone}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-gold font-bold text-sm">₹{order.finalAmount}</p>
                <p className="text-gray-500 text-xs">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════
// STOCK UPDATE TAB
// ════════════════════════════════════════════════════
const StockUpdateTab = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editStock, setEditStock] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/products?limit=100');
      setProducts(data.products);
    } catch {
      toast.error('Products load nahi hue!');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (product) => {
    setEditingId(product._id);
    setEditStock(product.stock);
  };

  const saveStock = async (productId) => {
    setSaving(true);
    try {
      await API.put(`/products/${productId}`, { stock: editStock });
      setProducts(prev => prev.map(p => p._id === productId ? { ...p, stock: editStock } : p));
      toast.success('Stock update ho gaya! ✅');
      setEditingId(null);
    } catch {
      toast.error('Update nahi hua!');
    } finally {
      setSaving(false);
    }
  };

  const filtered = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Product name ya category se search..."
          className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold transition" />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(product => (
            <div key={product._id} className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3 hover:border-gold/30 transition">
              <img src={product.images?.[0]} alt={product.name}
                className="w-10 h-10 rounded-lg object-cover border border-border shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium line-clamp-1">{product.name}</p>
                <p className="text-gray-400 text-xs">{product.category} • ₹{product.sellingPrice}</p>
              </div>

              {editingId === product._id ? (
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => setEditStock(s => Math.max(0, s - 1))}
                    className="w-7 h-7 bg-secondary border border-border rounded-lg text-white font-bold hover:border-gold transition">−</button>
                  <input type="number" value={editStock}
                    onChange={e => setEditStock(Math.max(0, Number(e.target.value)))}
                    className="w-16 bg-secondary border border-gold rounded-lg px-2 py-1 text-white text-center text-sm focus:outline-none" />
                  <button onClick={() => setEditStock(s => s + 1)}
                    className="w-7 h-7 bg-secondary border border-border rounded-lg text-white font-bold hover:border-gold transition">+</button>
                  <button onClick={() => saveStock(product._id)} disabled={saving}
                    className="bg-gold text-black px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gold-light transition disabled:opacity-50">
                    {saving ? '...' : '✓'}
                  </button>
                  <button onClick={() => setEditingId(null)}
                    className="text-gray-400 hover:text-white text-xs px-2 py-1.5 rounded-lg border border-border transition">✕</button>
                </div>
              ) : (
                <div className="flex items-center gap-3 shrink-0">
                  <div className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                    product.stock === 0 ? 'bg-red-500/20 border-red-500/30 text-red-400' :
                    product.stock <= 5 ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400' :
                    'bg-green-500/20 border-green-500/30 text-green-400'
                  }`}>
                    {product.stock === 0 ? 'Out of Stock' : `${product.stock} in stock`}
                  </div>
                  <button onClick={() => startEdit(product)}
                    className="text-xs border border-border text-gray-300 px-3 py-1.5 rounded-lg hover:border-gold hover:text-gold transition">
                    Edit
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════
// USERS MANAGE TAB (Block/Delete)
// ════════════════════════════════════════════════════
const UsersManageTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/auth/admin/users');
      setUsers(data.users);
    } catch {
      toast.error('Users load nahi hue!');
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async (userId, isBlocked) => {
    setActionLoading(userId);
    try {
      await API.put(`/auth/admin/users/${userId}/block`, { isBlocked: !isBlocked });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isBlocked: !isBlocked } : u));
      toast.success(isBlocked ? 'User unblock ho gaya!' : 'User block ho gaya!');
    } catch {
      toast.error('Action nahi hua!');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`"${userName}" ko permanently delete karna chahte ho?`)) return;
    setActionLoading(userId);
    try {
      await API.delete(`/auth/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u._id !== userId));
      toast.success('User delete ho gaya!');
    } catch {
      toast.error('Delete nahi hua!');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.phone?.includes(q);
  });

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-white font-bold text-xl">{users.length}</p>
          <p className="text-gray-400 text-xs">Total Users</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-green-400 font-bold text-xl">{users.filter(u => !u.isBlocked).length}</p>
          <p className="text-gray-400 text-xs">Active</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-red-400 font-bold text-xl">{users.filter(u => u.isBlocked).length}</p>
          <p className="text-gray-400 text-xs">Blocked</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Name, email ya phone se search..."
          className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold transition" />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(user => (
            <div key={user._id} className={`bg-card border rounded-xl px-4 py-3 flex items-center gap-3 transition ${
              user.isBlocked ? 'border-red-500/30 bg-red-500/5' : 'border-border hover:border-gold/30'
            }`}>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 border border-gold/30 flex items-center justify-center text-gold font-bold shrink-0">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white font-semibold text-sm">{user.name}</p>
                  {user.isBlocked && (
                    <span className="bg-red-500/20 text-red-400 text-xs px-1.5 py-0.5 rounded-full border border-red-500/20">Blocked</span>
                  )}
                </div>
                <p className="text-gray-400 text-xs">{user.email}</p>
                {user.phone && <p className="text-gray-500 text-xs">{user.phone}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleBlock(user._id, user.isBlocked)}
                  disabled={actionLoading === user._id}
                  className={`p-2 rounded-lg border transition ${
                    user.isBlocked
                      ? 'border-green-500/30 text-green-400 hover:bg-green-500/10'
                      : 'border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10'
                  } disabled:opacity-40`}
                  title={user.isBlocked ? 'Unblock' : 'Block'}>
                  {actionLoading === user._id ? <RefreshCw size={14} className="animate-spin" /> :
                    user.isBlocked ? <RotateCcw size={14} /> : <Ban size={14} />}
                </button>
                <button
                  onClick={() => handleDelete(user._id, user.name)}
                  disabled={actionLoading === user._id}
                  className="p-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition disabled:opacity-40"
                  title="Delete User">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════
// SEARCH ANALYTICS TAB
// ════════════════════════════════════════════════════
const SearchAnalyticsTab = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAnalytics(); }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { data: res } = await API.get('/auth/admin/search-analytics');
      setData(res);
    } catch {
      toast.error('Analytics load nahi hui!');
    } finally {
      setLoading(false);
    }
  };

  const maxCount = data?.topSearches?.[0]?.count || 1;

  return (
    <div>
      {data && (
        <div className="bg-card border border-border rounded-2xl p-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <BarChart2 size={18} className="text-purple-400" />
            </div>
            <div>
              <p className="text-gray-400 text-xs">Total Searches</p>
              <p className="text-white font-bold text-xl">{data.totalSearches}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-bold text-sm flex items-center gap-2">
          <TrendingUp size={16} className="text-gold" /> Top Searched Keywords
        </h3>
        <button onClick={fetchAnalytics} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gold transition">
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !data?.topSearches?.length ? (
        <div className="text-center py-16 text-gray-400">
          <Search size={40} className="mx-auto mb-3 opacity-30" />
          <p>Abhi koi search data nahi hai</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.topSearches.map((item, i) => (
            <div key={item.keyword} className="bg-card border border-border rounded-xl px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-gold text-black' : i === 1 ? 'bg-gray-400 text-black' :
                    i === 2 ? 'bg-amber-700 text-white' : 'bg-secondary text-gray-400'
                  }`}>{i + 1}</span>
                  <span className="text-white font-semibold text-sm capitalize">{item.keyword}</span>
                </div>
                <div className="text-right">
                  <span className="text-gold font-bold text-sm">{item.count}x</span>
                  <p className="text-gray-500 text-xs">{item.avgResults} results avg</p>
                </div>
              </div>
              <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-gold to-gold/60 transition-all duration-700"
                  style={{ width: `${(item.count / maxCount) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════
const AdminAnalytics = () => {
  const [activeTab, setActiveTab] = useState('bestselling');

  const tabs = [
    { id: 'bestselling', label: 'Best Selling', icon: TrendingUp },
    { id: 'bulk', label: 'Bulk Orders', icon: ShoppingBag },
    { id: 'stock', label: 'Stock Update', icon: Package },
    { id: 'users', label: 'Manage Users', icon: Users },
    { id: 'analytics', label: 'Search Data', icon: BarChart2 },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center">
          <Crown size={20} className="text-gold" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Tools</h1>
          <p className="text-gray-400 text-sm">Store management tools</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1 scrollbar-hide border-b border-border">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
              activeTab === tab.id ? 'border-gold text-gold' : 'border-transparent text-gray-400 hover:text-white'
            }`}>
            <tab.icon size={13} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'bestselling' && <BestSellingTab />}
      {activeTab === 'bulk' && <BulkOrdersTab />}
      {activeTab === 'stock' && <StockUpdateTab />}
      {activeTab === 'users' && <UsersManageTab />}
      {activeTab === 'analytics' && <SearchAnalyticsTab />}
    </div>
  );
};

export default AdminAnalytics;