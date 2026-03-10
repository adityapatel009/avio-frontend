import { useState, useEffect } from 'react';
import {
  Users, Search, RefreshCw, Mail, Phone,
  Calendar, TrendingUp, BarChart2, Eye,
  ShoppingBag, Crown
} from 'lucide-react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

// ─── CUSTOMERS TAB ────────────────────────────────────────
const CustomersTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  const filtered = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.name?.toLowerCase().includes(q) ||
           u.email?.toLowerCase().includes(q) ||
           u.phone?.includes(q);
  });

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Users size={18} className="text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-xs">Total Users</p>
              <p className="text-white font-bold text-xl">{users.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
              <Calendar size={18} className="text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-xs">Is Mahine</p>
              <p className="text-white font-bold text-xl">
                {users.filter(u => {
                  const d = new Date(u.createdAt);
                  const now = new Date();
                  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Name, email ya phone se search karo..."
          className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold transition" />
      </div>

      {/* Users List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Users size={40} className="mx-auto mb-3 opacity-30" />
          <p>Koi user nahi mila</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((user, i) => (
            <div key={user._id} className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-4 hover:border-gold/30 transition">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 border border-gold/30 flex items-center justify-center text-gold font-bold shrink-0">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">{user.name}</p>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  <span className="flex items-center gap-1 text-gray-400 text-xs">
                    <Mail size={10} /> {user.email}
                  </span>
                  {user.phone && (
                    <span className="flex items-center gap-1 text-gray-400 text-xs">
                      <Phone size={10} /> {user.phone}
                    </span>
                  )}
                </div>
              </div>
              {/* Date */}
              <div className="text-right shrink-0">
                <p className="text-gray-500 text-xs">
                  {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <p className="text-gray-600 text-xs">Joined</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── ANALYTICS TAB ────────────────────────────────────────
const AnalyticsTab = () => {
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
      {/* Total Searches */}
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

      {/* Top Keywords */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-bold text-sm flex items-center gap-2">
          <TrendingUp size={16} className="text-gold" /> Top Searched Keywords
        </h3>
        <button onClick={fetchAnalytics}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gold transition">
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
          <p className="text-xs mt-1">Jab users search karenge, yahan dikhega</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.topSearches.map((item, i) => (
            <div key={item.keyword} className="bg-card border border-border rounded-xl px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-gold text-black' :
                    i === 1 ? 'bg-gray-400 text-black' :
                    i === 2 ? 'bg-amber-700 text-white' :
                    'bg-secondary text-gray-400'
                  }`}>{i + 1}</span>
                  <span className="text-white font-semibold text-sm capitalize">{item.keyword}</span>
                </div>
                <div className="text-right">
                  <span className="text-gold font-bold text-sm">{item.count}x</span>
                  <p className="text-gray-500 text-xs">{item.avgResults} results avg</p>
                </div>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-gold to-gold/60 transition-all duration-700"
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── MAIN PAGE ────────────────────────────────────────────
const AdminCustomers = () => {
  const [activeTab, setActiveTab] = useState('customers');

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center">
          <Crown size={20} className="text-gold" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Customers & Analytics</h1>
          <p className="text-gray-400 text-sm">Users aur search trends dekho</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border">
        {[
          { id: 'customers', label: 'Customer List', icon: Users },
          { id: 'analytics', label: 'Search Analytics', icon: TrendingUp },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition ${
              activeTab === tab.id ? 'border-gold text-gold' : 'border-transparent text-gray-400 hover:text-white'
            }`}>
            <tab.icon size={15} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'customers' ? <CustomersTab /> : <AnalyticsTab />}
    </div>
  );
};

export default AdminCustomers;