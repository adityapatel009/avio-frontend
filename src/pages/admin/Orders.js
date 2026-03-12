import { useState, useEffect } from 'react';
import {
  Search, ChevronDown, ChevronUp, Phone,
  Package, Truck, CheckCircle, XCircle, Clock,
  RefreshCw, Copy, ShoppingBag, Trash2
} from 'lucide-react';
import API, { adminGetOrders, adminUpdateOrder } from '../../utils/api';
import toast from 'react-hot-toast';

const statuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const allSteps = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

const statusConfig = {
  Pending:    { color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', dot: 'bg-yellow-400', icon: Clock },
  Confirmed:  { color: 'text-blue-400 bg-blue-400/10 border-blue-400/20',       dot: 'bg-blue-400',   icon: CheckCircle },
  Processing: { color: 'text-purple-400 bg-purple-400/10 border-purple-400/20', dot: 'bg-purple-400', icon: Package },
  Shipped:    { color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',       dot: 'bg-cyan-400',   icon: Truck },
  Delivered:  { color: 'text-green-400 bg-green-400/10 border-green-400/20',    dot: 'bg-green-400',  icon: CheckCircle },
  Cancelled:  { color: 'text-red-400 bg-red-400/10 border-red-400/20',          dot: 'bg-red-400',    icon: XCircle },
};

const stepLabels = {
  Pending:    { label: 'Order Placed',  emoji: '📦' },
  Confirmed:  { label: 'Confirmed',     emoji: '✅' },
  Processing: { label: 'Processing',    emoji: '⚙️' },
  Shipped:    { label: 'Shipped',       emoji: '🚚' },
  Delivered:  { label: 'Delivered',     emoji: '🎉' },
};

// ─── TRACKING TIMELINE ────────────────────────────────────
const TrackingTimeline = ({ order }) => {
  const currentStep = allSteps.indexOf(order.status);
  const isCancelled = order.status === 'Cancelled';

  if (isCancelled) {
    return (
      <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
        <XCircle size={20} className="text-red-400 shrink-0" />
        <div>
          <p className="text-red-400 font-bold text-sm">Order Cancelled</p>
          <p className="text-gray-400 text-xs">
            {order.statusHistory?.find(h => h.status === 'Cancelled')?.note || 'Order cancel ho gaya'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="hidden md:block relative">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-border" />
          <div className="absolute top-4 left-0 h-0.5 bg-gold transition-all duration-700"
            style={{ width: currentStep >= 0 ? `${(currentStep / (allSteps.length - 1)) * 100}%` : '0%' }} />
          {allSteps.map((step, i) => {
            const cfg = statusConfig[step];
            const sl = stepLabels[step];
            const Icon = cfg.icon;
            const isDone = i <= currentStep;
            const isCurrent = i === currentStep;
            const histEntry = order.statusHistory?.find(h => h.status === step);
            return (
              <div key={step} className="relative flex flex-col items-center z-10 gap-1">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                  isDone ? `${cfg.dot} border-transparent` : 'bg-card border-border'
                } ${isCurrent ? 'ring-4 ring-gold/30' : ''}`}>
                  <Icon size={14} className={isDone ? 'text-black' : 'text-gray-600'} />
                </div>
                <p className={`text-xs font-semibold ${isDone ? 'text-white' : 'text-gray-600'}`}>{sl.label}</p>
                {histEntry && (
                  <p className="text-gray-500 text-xs">
                    {new Date(histEntry.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="md:hidden">
        {allSteps.map((step, i) => {
          const cfg = statusConfig[step];
          const sl = stepLabels[step];
          const Icon = cfg.icon;
          const isDone = i <= currentStep;
          const isCurrent = i === currentStep;
          const isLast = i === allSteps.length - 1;
          const histEntry = order.statusHistory?.find(h => h.status === step);
          return (
            <div key={step} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  isDone ? `${cfg.dot} border-transparent` : 'bg-card border-border'
                } ${isCurrent ? 'ring-3 ring-gold/30' : ''}`}>
                  <Icon size={13} className={isDone ? 'text-black' : 'text-gray-600'} />
                </div>
                {!isLast && <div className={`w-0.5 h-8 mt-0.5 ${i < currentStep ? 'bg-gold' : 'bg-border'}`} />}
              </div>
              <div className="pb-4 pt-1 flex-1">
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-semibold ${isDone ? 'text-white' : 'text-gray-500'}`}>
                    {sl.emoji} {sl.label}
                  </p>
                  {histEntry && (
                    <p className="text-gray-500 text-xs">
                      {new Date(histEntry.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
                {histEntry?.note && <p className="text-gray-400 text-xs mt-0.5">{histEntry.note}</p>}
                {isCurrent && !histEntry?.note && <p className="text-gold text-xs mt-0.5">Current status</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── DELETE CONFIRM MODAL ─────────────────────────────────
const DeleteModal = ({ order, onConfirm, onCancel, deleting }) => (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-card border border-red-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
      <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <Trash2 size={22} className="text-red-400" />
      </div>
      <h3 className="text-white font-bold text-lg text-center mb-1">Order Delete Karo?</h3>
      <p className="text-gray-400 text-sm text-center mb-1">
        Order <span className="text-white font-semibold">{order.orderId}</span> permanently delete ho jayega.
      </p>
      <p className="text-red-400 text-xs text-center mb-5">⚠️ Ye action undo nahi ho sakta!</p>
      <div className="flex gap-3">
        <button onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-border text-gray-300 text-sm font-semibold hover:border-gray-500 transition">
          Cancel
        </button>
        <button onClick={onConfirm} disabled={deleting}
          className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition disabled:opacity-50 flex items-center justify-center gap-2">
          {deleting ? <><RefreshCw size={14} className="animate-spin" /> Deleting...</> : <><Trash2 size={14} /> Delete</>}
        </button>
      </div>
    </div>
  </div>
);

// ─── ORDER CARD ───────────────────────────────────────────
const OrderCard = ({ order, onUpdate, onDelete, updating, deleting }) => {
  const [expanded, setExpanded] = useState(false);
  const [meeshoId, setMeeshoId] = useState(order.meeshoOrderId || '');
  const [note, setNote] = useState('');
  const [expectedDelivery, setExpectedDelivery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const cfg = statusConfig[order.status] || statusConfig.Pending;
  const StatusIcon = cfg.icon;

  const handleUpdate = (newStatus) => onUpdate(order._id, newStatus, meeshoId, note, expectedDelivery);

  const copyAddress = () => {
    const addr = `${order.deliveryAddress?.fullName}, ${order.deliveryAddress?.addressLine}, ${order.deliveryAddress?.city}, ${order.deliveryAddress?.state} - ${order.deliveryAddress?.pincode}. Phone: ${order.deliveryAddress?.phone}`;
    navigator.clipboard.writeText(addr);
    toast.success('Address copied!');
  };

  return (
    <>
      {showDeleteModal && (
        <DeleteModal
          order={order}
          onConfirm={() => { onDelete(order._id); setShowDeleteModal(false); }}
          onCancel={() => setShowDeleteModal(false)}
          deleting={deleting === order._id}
        />
      )}
      <div className={`bg-card border rounded-2xl overflow-hidden transition ${
        expanded ? 'border-gold/40' : 'border-border hover:border-gold/20'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-4 min-w-0 cursor-pointer flex-1"
            onClick={() => setExpanded(!expanded)}>
            <div className="w-9 h-9 bg-gold/10 rounded-xl flex items-center justify-center shrink-0">
              <ShoppingBag size={16} className="text-gold" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-white font-bold text-sm">{order.orderId}</p>
                {order.meeshoOrderId && (
                  <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded-full">
                    M: {order.meeshoOrderId}
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-xs mt-0.5">
                {order.customer?.name} • {order.customer?.phone}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right hidden md:block">
              <p className="text-gold font-bold">₹{order.finalAmount}</p>
              <p className="text-gray-500 text-xs">
                {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-semibold ${cfg.color}`}>
              <StatusIcon size={11} /> {order.status}
            </span>
            {/* DELETE BUTTON */}
            <button
              onClick={(e) => { e.stopPropagation(); setShowDeleteModal(true); }}
              className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center hover:bg-red-500/20 hover:border-red-500/40 transition group"
              title="Delete Order">
              <Trash2 size={14} className="text-red-400 group-hover:text-red-300" />
            </button>
            <div className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
              {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </div>
          </div>
        </div>

        {expanded && (
          <div className="border-t border-border px-5 py-4 space-y-4">
            {/* Tracking */}
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-3 flex items-center gap-1">
                <Truck size={12} /> Order Tracking
              </p>
              <TrackingTimeline order={order} />
            </div>

            {/* Status History */}
            {order.statusHistory?.length > 0 && (
              <div className="bg-secondary rounded-xl p-3">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Status History</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {[...order.statusHistory].reverse().map((h, i) => {
                    const hCfg = statusConfig[h.status] || statusConfig.Pending;
                    const HIcon = hCfg.icon;
                    return (
                      <div key={i} className="flex items-start gap-2">
                        <div className={`w-6 h-6 rounded-full ${hCfg.dot} flex items-center justify-center shrink-0 mt-0.5`}>
                          <HIcon size={12} className="text-black" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-white text-xs font-semibold">{h.status}</p>
                            {h.updatedAt && (
                              <p className="text-gray-500 text-xs">
                                {new Date(h.updatedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            )}
                          </div>
                          {h.note && <p className="text-gray-400 text-xs">{h.note}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Items */}
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Order Items</p>
              <div className="bg-secondary rounded-xl p-3 space-y-2">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <img src={item.productImage} alt=""
                      className="w-12 h-12 object-cover rounded-lg border border-border shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium line-clamp-1">{item.productName}</p>
                      <p className="text-gray-400 text-xs">Qty: {item.quantity} × ₹{item.price}</p>
                    </div>
                    <p className="text-gold font-bold text-sm shrink-0">₹{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Price + Address */}
            <div className="grid md:grid-cols-2 gap-3">
              <div className="bg-secondary rounded-xl p-3">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Price Breakdown</p>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Subtotal</span>
                    <span className="text-white">₹{order.totalAmount}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Discount</span>
                      <span className="text-green-400">− ₹{order.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-border pt-1.5">
                    <span className="text-white font-semibold">Total</span>
                    <span className="text-gold font-bold">₹{order.finalAmount}</span>
                  </div>
                </div>
              </div>
              <div className="bg-secondary rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-400 text-xs uppercase tracking-wider">Delivery Address</p>
                  <button onClick={copyAddress} className="flex items-center gap-1 text-xs text-gold hover:underline">
                    <Copy size={11} /> Copy
                  </button>
                </div>
                <p className="text-white text-sm font-medium">{order.deliveryAddress?.fullName}</p>
                <p className="text-gray-300 text-xs mt-0.5">
                  {order.deliveryAddress?.addressLine}, {order.deliveryAddress?.city}, {order.deliveryAddress?.state} — {order.deliveryAddress?.pincode}
                </p>
                <p className="text-gray-400 text-xs mt-1 flex items-center gap-1">
                  <Phone size={11} /> {order.deliveryAddress?.phone}
                </p>
              </div>
            </div>

            {/* Meesho ID + Note + Expected Delivery */}
            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1.5">Meesho Order ID</p>
                <input value={meeshoId} onChange={e => setMeeshoId(e.target.value)}
                  placeholder="Meesho ID daalo"
                  className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-gold transition placeholder-gray-600" />
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1.5">Expected Delivery</p>
                <input type="date" value={expectedDelivery} onChange={e => setExpectedDelivery(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-gold transition" />
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1.5">Note</p>
                <input value={note} onChange={e => setNote(e.target.value)}
                  placeholder="Customer ko note..."
                  className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-gold transition placeholder-gray-600" />
              </div>
            </div>

            {/* Status Update */}
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {statuses.filter(s => s !== order.status).map(s => {
                  const sCfg = statusConfig[s];
                  return (
                    <button key={s} onClick={() => handleUpdate(s)}
                      disabled={updating === order._id}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border transition disabled:opacity-50 ${sCfg.color} hover:opacity-80`}>
                      {updating === order._id
                        ? <span className="flex items-center gap-1"><RefreshCw size={10} className="animate-spin" /> Updating...</span>
                        : `→ ${s}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Delete button inside expanded too */}
            <div className="pt-2 border-t border-border">
              <button onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 text-red-400 text-sm hover:text-red-300 transition border border-red-500/20 px-4 py-2 rounded-xl hover:bg-red-500/10">
                <Trash2 size={14} /> Is order ko delete karo
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// ─── MAIN ADMIN ORDERS ────────────────────────────────────
const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [counts, setCounts] = useState({});

 // eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => { fetchOrders(); }, [filter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await adminGetOrders({ status: filter || undefined, limit: 100 });
      setOrders(data.orders);
      const all = data.orders;
      const c = { All: data.totalOrders || all.length };
      statuses.forEach(s => { c[s] = all.filter(o => o.status === s).length; });
      setCounts(c);
    } catch {
      toast.error('Orders load nahi hue!');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (orderId, newStatus, meeshoOrderId, note, expectedDelivery) => {
    setUpdating(orderId);
    try {
      await adminUpdateOrder(orderId, {
        status: newStatus,
        meeshoOrderId: meeshoOrderId || undefined,
        note: note || `Status updated to ${newStatus}`,
        expectedDelivery: expectedDelivery || undefined,
      });
      toast.success(`Order → ${newStatus}! ✅`);
      fetchOrders();
    } catch {
      toast.error('Update nahi hua!');
    } finally {
      setUpdating(null);
    }
  };

 const handleDelete = async (orderId) => {
  setDeleting(orderId);
  try {
    const res = await API.delete(`/orders/admin/${orderId}`);
    toast.success('Order delete ho gaya! 🗑️');
    setOrders(prev => prev.filter(o => o._id !== orderId));
    setCounts(prev => ({ ...prev, All: (prev.All || 1) - 1 }));
  } catch (err) {
    console.error('Delete error:', err.response?.status, err.response?.data);
    toast.error(`Error: ${err.response?.data?.message || err.message}`);
  } finally {
    setDeleting(null);
  }
};

  const filtered = orders.filter(o => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o.orderId?.toLowerCase().includes(q) ||
      o.customer?.name?.toLowerCase().includes(q) ||
      o.customer?.phone?.includes(q) ||
      o.meeshoOrderId?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Orders</h1>
          <p className="text-gray-400 text-sm mt-0.5">{counts.All || 0} total orders</p>
        </div>
        <button onClick={fetchOrders}
          className="flex items-center gap-2 border border-border text-gray-300 px-3 py-2 rounded-xl text-sm hover:border-gold hover:text-gold transition">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by Order ID, customer name, phone, Meesho ID..."
          className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold transition" />
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-2 scrollbar-hide">
        <button onClick={() => setFilter('')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm whitespace-nowrap font-medium transition ${
            !filter ? 'bg-gold text-black' : 'border border-border text-gray-300 hover:border-gold/50'
          }`}>
          All <span className={`text-xs px-1.5 py-0.5 rounded-full ${!filter ? 'bg-black/20' : 'bg-border'}`}>{counts.All || 0}</span>
        </button>
        {statuses.map(s => {
          const cfg = statusConfig[s];
          return (
            <button key={s} onClick={() => setFilter(s)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm whitespace-nowrap font-medium transition ${
                filter === s ? 'bg-gold text-black' : 'border border-border text-gray-300 hover:border-gold/50'
              }`}>
              {s}
              {counts[s] > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === s ? 'bg-black/20 text-black' : cfg.color}`}>
                  {counts[s]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" />
          <p>Koi order nahi mila</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => (
            <OrderCard key={order._id} order={order}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              updating={updating}
              deleting={deleting} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;