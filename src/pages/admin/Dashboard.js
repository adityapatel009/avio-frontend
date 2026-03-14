import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, ShoppingBag, TrendingUp, Users, Crown,
  MessageSquare, Tag, ArrowUp, ArrowRight, Clock,
  CheckCircle, BarChart2, IndianRupee, Zap, Bell,
  ChevronDown, ChevronUp, Grid2X2
} from 'lucide-react';
import { adminGetOrders, getProducts } from '../../utils/api';
import LowStockWidget from './LowStockWidget';
import AdminDealOfDay from './AdminDealOfDay';

const MiniBarChart = ({ data, color = 'bg-gold' }) => {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1 h-12">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col justify-end">
          <div className={`${color} rounded-sm opacity-80 hover:opacity-100 transition-all`}
            style={{ height: `${(v / max) * 100}%`, minHeight: v > 0 ? '2px' : '0' }} />
        </div>
      ))}
    </div>
  );
};

const StatusRing = ({ breakdown }) => {
  const total = breakdown.reduce((s, b) => s + b.count, 0);
  if (total === 0) return <div className="w-20 h-20 rounded-full border-4 border-border mx-auto" />;
  const colors = {
    Pending: '#FBBF24', Confirmed: '#60A5FA', Processing: '#A78BFA',
    Shipped: '#22D3EE', Delivered: '#4ADE80', Cancelled: '#F87171'
  };
  let offset = 0;
  const radius = 30, circumference = 2 * Math.PI * radius;
  const segments = breakdown.map(b => {
    const pct = b.count / total;
    const seg = { ...b, pct, offset, dashArray: `${pct * circumference} ${circumference}` };
    offset += pct * circumference;
    return seg;
  }).filter(s => s.count > 0);
  return (
    <svg width="80" height="80" viewBox="0 0 80 80">
      <circle cx="40" cy="40" r={radius} fill="none" stroke="#1e1e2e" strokeWidth="10" />
      {segments.map((seg, i) => (
        <circle key={i} cx="40" cy="40" r={radius} fill="none"
          stroke={colors[seg.status] || '#6B7280'} strokeWidth="10"
          strokeDasharray={seg.dashArray} strokeDashoffset={-seg.offset}
          transform="rotate(-90 40 40)" />
      ))}
    </svg>
  );
};

// ─── CATEGORY BREAKDOWN SECTION ───────────────────────────
const CategoryBreakdown = ({ products }) => {
  const [expandedCat, setExpandedCat] = useState(null);
  const [activeFilter, setActiveFilter] = useState({ category: null, subCategory: null });
  const productsRef = useRef(null);

  const categories = ['Women', 'Men', 'Electronics', 'Home Decor', 'Beauty', 'Footwear', 'Jewellery & Accessories', 'Sports & Fitness'];

  const catColors = {
    Women: 'from-pink-500/20 to-pink-500/5 border-pink-500/30 text-pink-400',
    Men: 'from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-400',
    Electronics: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 text-cyan-400',
    'Home Decor': 'from-orange-500/20 to-orange-500/5 border-orange-500/30 text-orange-400',
    Beauty: 'from-purple-500/20 to-purple-500/5 border-purple-500/30 text-purple-400',
    Footwear: 'from-green-500/20 to-green-500/5 border-green-500/30 text-green-400',
    'Jewellery & Accessories': 'from-gold/20 to-gold/5 border-gold/30 text-gold',
    'Sports & Fitness': 'from-red-500/20 to-red-500/5 border-red-500/30 text-red-400',
  };

  // Category wise stats compute karo
  const catStats = categories.map(cat => {
    const catProducts = products.filter(p => p.category === cat);
    const subCatMap = {};
    catProducts.forEach(p => {
      const sub = p.subCategory || 'Uncategorized';
      if (!subCatMap[sub]) subCatMap[sub] = [];
      subCatMap[sub].push(p);
    });
    return { cat, total: catProducts.length, subCats: subCatMap };
  }).filter(c => c.total > 0);

  const handleSubCatClick = (cat, subCat) => {
    setActiveFilter({ category: cat, subCategory: subCat });
    setTimeout(() => {
      productsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleCatClick = (cat) => {
    setActiveFilter({ category: cat, subCategory: null });
    setTimeout(() => {
      productsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Filtered products
  const filteredProducts = products.filter(p => {
    if (!activeFilter.category) return false;
    if (p.category !== activeFilter.category) return false;
    if (activeFilter.subCategory && p.subCategory !== activeFilter.subCategory) return false;
    return true;
  });

  if (catStats.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-bold flex items-center gap-2">
          <Grid2X2 size={18} className="text-gold" /> Category Inventory
        </h2>
        {activeFilter.category && (
          <button onClick={() => setActiveFilter({ category: null, subCategory: null })}
            className="text-gray-400 text-xs hover:text-red-400 transition">
            Clear Filter ✕
          </button>
        )}
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {catStats.map(({ cat, total, subCats }) => {
          const colorClass = catColors[cat] || 'from-gray-500/20 to-gray-500/5 border-gray-500/30 text-gray-400';
          const isExpanded = expandedCat === cat;
          const isActive = activeFilter.category === cat;
          return (
            <div key={cat}
              className={`bg-gradient-to-br ${colorClass} border rounded-2xl overflow-hidden transition-all duration-300 ${isActive ? 'ring-2 ring-gold/50' : ''}`}>
              {/* Card Header */}
              <button
                className="w-full p-4 text-left"
                onClick={() => {
                  setExpandedCat(isExpanded ? null : cat);
                  handleCatClick(cat);
                }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-bold text-sm">{cat}</p>
                    <p className="text-2xl font-bold text-white mt-1">{total}</p>
                    <p className="text-xs opacity-70 mt-0.5">products</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs opacity-70">{Object.keys(subCats).length} types</span>
                    {isExpanded
                      ? <ChevronUp size={16} className="opacity-70" />
                      : <ChevronDown size={16} className="opacity-70" />}
                  </div>
                </div>
              </button>

              {/* SubCategory Breakdown */}
              {isExpanded && (
                <div className="border-t border-white/10 px-3 pb-3">
                  <div className="space-y-1 mt-2 max-h-48 overflow-y-auto scrollbar-hide">
                    {Object.entries(subCats)
                      .sort((a, b) => b[1].length - a[1].length)
                      .map(([sub, prods]) => {
                        const isSubActive = activeFilter.category === cat && activeFilter.subCategory === sub;
                        return (
                          <button key={sub}
                            onClick={() => handleSubCatClick(cat, sub)}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition ${
                              isSubActive ? 'bg-white/20' : 'hover:bg-white/10'
                            }`}>
                            <span className="text-white text-xs truncate flex-1">{sub}</span>
                            <span className="text-xs font-bold ml-2 bg-white/20 px-2 py-0.5 rounded-full text-white shrink-0">
                              {prods.length}
                            </span>
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Filtered Products Grid */}
      {activeFilter.category && (
        <div ref={productsRef} className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <h3 className="text-white font-bold flex items-center gap-2">
                <Package size={16} className="text-gold" />
                {activeFilter.category}
                {activeFilter.subCategory && <span className="text-gray-400">› {activeFilter.subCategory}</span>}
              </h3>
              <p className="text-gray-500 text-xs mt-0.5">{filteredProducts.length} products</p>
            </div>
            <Link to={`/admin/products`}
              className="text-gold text-xs flex items-center gap-1 hover:gap-2 transition-all">
              Manage <ArrowRight size={12} />
            </Link>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <Package size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Is category mein koi product nahi</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 p-4">
              {filteredProducts.map(product => {
                const profit = product.sellingPrice - (product.meeshoPrice || 0);
                return (
                  <div key={product._id}
                    className="bg-secondary border border-border rounded-xl overflow-hidden hover:border-gold/40 transition group">
                    <div className="relative">
                      <img src={product.images?.[0]} alt={product.name}
                        className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300" />
                      {product.stock < 5 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-red-500/80 text-white text-[9px] text-center py-0.5">
                          ⚠️ Stock: {product.stock}
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-white text-xs font-semibold line-clamp-2 mb-1">{product.name}</p>
                      {product.subCategory && (
                        <span className="text-[9px] bg-gold/10 text-gold px-1.5 py-0.5 rounded-full border border-gold/20">
                          {product.subCategory}
                        </span>
                      )}
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-gold text-xs font-bold">₹{product.sellingPrice}</span>
                        {profit > 0 && (
                          <span className="text-green-400 text-[9px]">+₹{profit}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── MAIN DASHBOARD ────────────────────────────────────────
const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0, pendingOrders: 0, totalProducts: 0,
    todayOrders: 0, totalRevenue: 0, deliveredOrders: 0,
  });
  const [allProducts, setAllProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [statusBreakdown, setStatusBreakdown] = useState([]);
  const [weeklyOrders, setWeeklyOrders] = useState([0,0,0,0,0,0,0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        adminGetOrders({ limit: 100 }),
        getProducts({ limit: 500 })
      ]);
      const orders = ordersRes.data.orders || [];
      const products = productsRes.data.products || [];
      const today = new Date().toDateString();
      const weekly = Array(7).fill(0);
      orders.forEach(o => {
        const diff = Math.floor((new Date() - new Date(o.createdAt)) / 86400000);
        if (diff < 7) weekly[6 - diff]++;
      });
      const statuses = ['Pending','Confirmed','Processing','Shipped','Delivered','Cancelled'];
      const breakdown = statuses.map(s => ({ status: s, count: orders.filter(o => o.status === s).length }));
      const revenue = orders.filter(o => o.status === 'Delivered').reduce((sum, o) => sum + o.finalAmount, 0);
      setStats({
        totalOrders: ordersRes.data.totalOrders || orders.length,
        pendingOrders: orders.filter(o => o.status === 'Pending').length,
        totalProducts: products.length,
        todayOrders: orders.filter(o => new Date(o.createdAt).toDateString() === today).length,
        totalRevenue: revenue,
        deliveredOrders: orders.filter(o => o.status === 'Delivered').length,
      });
      setWeeklyOrders(weekly);
      setStatusBreakdown(breakdown);
      setRecentOrders(orders.slice(0, 6));
      setAllProducts(products);
    } catch (error) {
      console.log('Dashboard load error');
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    Pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    Confirmed: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    Processing: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    Shipped: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
    Delivered: 'text-green-400 bg-green-400/10 border-green-400/20',
    Cancelled: 'text-red-400 bg-red-400/10 border-red-400/20',
  };

  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const today = new Date().getDay();
  const orderedDays = [...days.slice(today), ...days.slice(0, today)].slice(-7);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gold/20 rounded-xl flex items-center justify-center">
            <Crown size={22} className="text-gold" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm">Avio Store Management</p>
          </div>
        </div>
        <p className="text-gray-500 text-xs hidden md:block">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Pending', value: stats.pendingOrders, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
          { label: 'Delivered', value: stats.deliveredOrders, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10' },
          { label: 'Products', value: stats.totalProducts, icon: Package, color: 'text-purple-400', bg: 'bg-purple-400/10' },
          { label: 'Today', value: stats.todayOrders, icon: TrendingUp, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
          { label: 'Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-gold', bg: 'bg-gold/10', small: true },
        ].map(stat => (
          <div key={stat.label} className="bg-card border border-border rounded-2xl p-4 hover:border-gold/30 transition">
            <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center mb-2`}>
              <stat.icon size={16} className={stat.color} />
            </div>
            <p className={`font-bold text-white ${stat.small ? 'text-base' : 'text-2xl'}`}>{stat.value}</p>
            <p className="text-gray-500 text-xs mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-2 bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-bold">Weekly Orders</h3>
              <p className="text-gray-500 text-xs">Last 7 days</p>
            </div>
            <div className="flex items-center gap-1 text-green-400 text-xs bg-green-400/10 px-2 py-1 rounded-full">
              <ArrowUp size={12} /> Active
            </div>
          </div>
          <MiniBarChart data={weeklyOrders} />
          <div className="flex justify-between mt-2">
            {orderedDays.map((d, i) => (
              <span key={i} className="text-gray-600 text-xs flex-1 text-center">{d}</span>
            ))}
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-white font-bold mb-1">Order Status</h3>
          <p className="text-gray-500 text-xs mb-4">Distribution</p>
          <div className="flex justify-center mb-4">
            <StatusRing breakdown={statusBreakdown} />
          </div>
          <div className="space-y-1.5">
            {statusBreakdown.filter(b => b.count > 0).map(b => (
              <div key={b.status} className="flex items-center justify-between">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[b.status]}`}>{b.status}</span>
                <span className="text-white text-xs font-bold">{b.count}</span>
              </div>
            ))}
            {statusBreakdown.every(b => b.count === 0) && (
              <p className="text-gray-500 text-xs text-center">Koi orders nahi</p>
            )}
          </div>
        </div>
      </div>

      {/* ── CATEGORY BREAKDOWN ── */}
      <CategoryBreakdown products={allProducts} />
<AdminDealOfDay />
      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { to: '/admin/products', icon: Package, label: 'Products', sub: 'Add, edit, delete', color: 'from-purple-500/20 to-purple-500/5' },
          { to: '/admin/orders', icon: ShoppingBag, label: 'Orders', sub: 'Update status', color: 'from-blue-500/20 to-blue-500/5' },
          { to: '/admin/reviews', icon: MessageSquare, label: 'Reviews', sub: 'Reply, delete', color: 'from-green-500/20 to-green-500/5' },
          { to: '/admin/coupons', icon: Tag, label: 'Coupons', sub: 'Manage discounts', color: 'from-gold/20 to-gold/5' },
          { to: '/admin/customers', icon: Users, label: 'Customers', sub: 'Users & Analytics', color: 'from-blue-500/20 to-blue-500/5' },
          { to: '/admin/analytics', icon: BarChart2, label: 'Tools', sub: 'Stock, Bulk, Users', color: 'from-red-500/20 to-red-500/5' },
          { to: '/admin/flashsale', icon: Zap, label: 'Flash Sale', sub: 'Banner manage karo', color: 'from-red-500/20 to-red-500/5' },
          { to: '/admin/notifications', icon: Bell, label: 'Notifications', sub: 'Push bhejo users ko', color: 'from-purple-500/20 to-purple-500/5' },
        ].map(item => (
          <Link key={item.to} to={item.to}
            className={`bg-gradient-to-br ${item.color} border border-border rounded-2xl p-4 hover:border-gold/50 transition group`}>
            <item.icon size={22} className="text-gold mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-white font-bold text-sm">{item.label}</p>
            <p className="text-gray-400 text-xs">{item.sub}</p>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-white font-bold flex items-center gap-2">
            <BarChart2 size={18} className="text-gold" /> Recent Orders
          </h2>
          <Link to="/admin/orders" className="text-gold text-sm flex items-center gap-1 hover:gap-2 transition-all">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-gray-400 text-center py-10">Koi order nahi hai abhi</p>
        ) : (
          <div className="divide-y divide-border">
            {recentOrders.map(order => (
              <div key={order._id} className="flex items-center justify-between px-5 py-3 hover:bg-secondary/50 transition">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gold/10 rounded-lg flex items-center justify-center shrink-0">
                    <ShoppingBag size={14} className="text-gold" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{order.orderId}</p>
                    <p className="text-gray-400 text-xs">{order.customer?.name}</p>
                  </div>
                </div>
                <div className="hidden md:block text-gray-500 text-xs">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </div>
                <div className="text-right">
                  <p className="text-gold font-bold text-sm">₹{order.finalAmount}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[order.status] || 'text-gray-400'}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <LowStockWidget />
    </div>
  );
};

export default Dashboard;