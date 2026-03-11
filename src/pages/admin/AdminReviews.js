import { useState, useEffect } from 'react';
import {
  Star, Trash2, Edit2, Check, X, MessageSquare,
  Filter, RotateCcw,  Phone, MapPin,
  ChevronDown, ChevronUp, RefreshCw, Image, AlertTriangle
} from 'lucide-react';
import { getAdminReviews, updateAdminReview, deleteAdminReview } from '../../utils/api';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const StarDisplay = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map(i => (
      <Star key={i} size={12} className={i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'} />
    ))}
  </div>
);

// ─── RETURN REQUEST CARD ──────────────────────────────────
const ReturnCard = ({ order, onResolve }) => {
  const [expanded, setExpanded] = useState(false);
  const [note, setNote] = useState('');
  const [resolving, setResolving] = useState(false);

  const statusConfig = {
    Pending:  { color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', label: '⏳ Pending' },
    Accepted: { color: 'text-green-400 bg-green-400/10 border-green-400/20',   label: '✅ Accepted' },
    Rejected: { color: 'text-red-400 bg-red-400/10 border-red-400/20',         label: '❌ Rejected' },
  };
  const cfg = statusConfig[order.returnRequest?.status] || statusConfig.Pending;

  const handleResolve = async (status) => {
    setResolving(true);
    try {
      await API.put(`/orders/${order._id}/return/resolve`, { status, adminNote: note });
      toast.success(`Return ${status}! ✅`);
      onResolve();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update nahi hua!');
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden hover:border-orange-500/30 transition">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-9 h-9 bg-orange-500/10 rounded-xl flex items-center justify-center shrink-0">
            <RotateCcw size={16} className="text-orange-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-white font-bold text-sm">{order.orderId}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${cfg.color}`}>
                {cfg.label}
              </span>
            </div>
            <p className="text-gray-400 text-xs mt-0.5">
              {order.customer?.name} • {order.customer?.email}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden md:block">
            <p className="text-purple-400 font-bold">₹{order.finalAmount}</p>
            <p className="text-gray-500 text-xs">
              {order.returnRequest?.requestedAt && new Date(order.returnRequest.requestedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </p>
          </div>
          {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border px-5 py-4 space-y-4">

          {/* Return Details */}
          <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4">
            <p className="text-orange-400 text-xs font-bold uppercase tracking-wider mb-2">Return Request Details</p>
            <div className="space-y-2">
              <div className="flex gap-2">
                <span className="text-gray-500 text-sm w-24 shrink-0">Reason:</span>
                <span className="text-white text-sm font-semibold">{order.returnRequest?.reason}</span>
              </div>
              {order.returnRequest?.description && (
                <div className="flex gap-2">
                  <span className="text-gray-500 text-sm w-24 shrink-0">Description:</span>
                  <span className="text-gray-300 text-sm">{order.returnRequest.description}</span>
                </div>
              )}
              <div className="flex gap-2">
                <span className="text-gray-500 text-sm w-24 shrink-0">Requested:</span>
                <span className="text-gray-300 text-sm">
                  {order.returnRequest?.requestedAt && new Date(order.returnRequest.requestedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {order.returnRequest?.adminNote && (
                <div className="flex gap-2">
                  <span className="text-gray-500 text-sm w-24 shrink-0">Admin Note:</span>
                  <span className="text-purple-300 text-sm">{order.returnRequest.adminNote}</span>
                </div>
              )}
            </div>

            {/* Return Images */}
            {order.returnRequest?.images?.length > 0 && (
              <div className="mt-3">
                <p className="text-gray-500 text-xs mb-2">Customer Photos:</p>
                <div className="flex gap-2 flex-wrap">
                  {order.returnRequest.images.map((img, i) => (
                    <a key={i} href={img} target="_blank" rel="noreferrer">
                      <img src={img} alt="" className="w-16 h-16 object-cover rounded-xl border border-border hover:border-orange-400 transition" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Order Items</p>
            <div className="space-y-2">
              {order.items?.map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-secondary rounded-xl p-3">
                  <img src={item.productImage} alt="" className="w-10 h-10 object-cover rounded-lg border border-border" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm line-clamp-1">{item.productName}</p>
                    <p className="text-gray-400 text-xs">Qty: {item.quantity} × ₹{item.price}</p>
                  </div>
                  <p className="text-purple-400 font-bold text-sm">₹{item.price * item.quantity}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Address */}
          <div className="bg-secondary rounded-xl p-3">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-2 flex items-center gap-1">
              <MapPin size={10} /> Delivery Address
            </p>
            <p className="text-white text-sm font-semibold">{order.deliveryAddress?.fullName}</p>
            <p className="text-gray-400 text-xs mt-0.5">
              {order.deliveryAddress?.addressLine}, {order.deliveryAddress?.city}, {order.deliveryAddress?.state} — {order.deliveryAddress?.pincode}
            </p>
            <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1">
              <Phone size={10} /> {order.deliveryAddress?.phone}
            </p>
          </div>

          {/* Resolve — only for Pending */}
          {order.returnRequest?.status === 'Pending' && (
            <div className="bg-secondary rounded-xl p-4">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">Return Resolve Karo</p>
              <textarea value={note} onChange={e => setNote(e.target.value)}
                placeholder="Customer ko note / reason..."
                rows={2}
                className="w-full bg-card border border-border rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 transition resize-none mb-3" />
              <div className="flex gap-2">
                <button onClick={() => handleResolve('Rejected')} disabled={resolving}
                  className="flex-1 border border-red-500/30 text-red-400 py-2.5 rounded-xl text-sm font-bold hover:bg-red-500/10 transition disabled:opacity-50 flex items-center justify-center gap-2">
                  {resolving ? <RefreshCw size={14} className="animate-spin" /> : <X size={14} />} Reject
                </button>
                <button onClick={() => handleResolve('Accepted')} disabled={resolving}
                  className="flex-1 bg-green-500 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-green-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
                  {resolving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />} Accept Return
                </button>
              </div>
            </div>
          )}

          {/* Already resolved */}
          {order.returnRequest?.status !== 'Pending' && (
            <div className={`rounded-xl p-3 text-sm font-semibold text-center ${
              order.returnRequest?.status === 'Accepted'
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {order.returnRequest?.status === 'Accepted' ? '✅ Return Accepted' : '❌ Return Rejected'}
              {order.returnRequest?.resolvedAt && (
                <p className="text-gray-500 text-xs font-normal mt-1">
                  {new Date(order.returnRequest.resolvedAt).toLocaleString('en-IN')}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── MAIN ADMIN REVIEWS ───────────────────────────────────
const AdminReviews = () => {
  const [activeTab, setActiveTab] = useState('reviews');
  const [reviews, setReviews] = useState([]);
  const [returnOrders, setReturnOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returnLoading, setReturnLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ adminReply: '' });
  const [filterRating, setFilterRating] = useState('');
  const [saving, setSaving] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => { fetchReviews(); fetchReturns(); }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data } = await getAdminReviews();
      setReviews(data.reviews);
    } catch {
      toast.error('Reviews load nahi hue!');
    } finally {
      setLoading(false);
    }
  };

  const fetchReturns = async () => {
    setReturnLoading(true);
    try {
      const { data } = await API.get('/orders/admin/returns');
      setReturnOrders(data.orders);
      setPendingCount(data.orders.filter(o => o.returnRequest?.status === 'Pending').length);
    } catch {
      toast.error('Returns load nahi hue!');
    } finally {
      setReturnLoading(false);
    }
  };

  const handleEdit = (review) => {
    setEditId(review._id);
    setEditForm({ adminReply: review.adminReply || '' });
  };

  const handleSave = async (id) => {
    setSaving(true);
    try {
      await updateAdminReview(id, editForm);
      toast.success('Reply save ho gayi! ✅');
      setEditId(null);
      fetchReviews();
    } catch {
      toast.error('Save nahi hua!');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Ye review delete karna chahte ho?')) return;
    try {
      await deleteAdminReview(id);
      toast.success('Review delete ho gaya!');
      fetchReviews();
    } catch {
      toast.error('Delete nahi hua!');
    }
  };

  const filtered = filterRating
    ? reviews.filter(r => r.rating === parseInt(filterRating))
    : reviews;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="text-purple-400" /> Reviews & Returns
          </h1>
          <p className="text-gray-400 text-sm mt-1">Customer feedback manage karo</p>
        </div>
        <button onClick={() => { fetchReviews(); fetchReturns(); }}
          className="flex items-center gap-2 border border-border text-gray-300 px-3 py-2 rounded-xl text-sm hover:border-purple-500 hover:text-purple-400 transition">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border">
        <button onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'reviews' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-white'
          }`}>
          <Star size={16} /> Reviews
          <span className="bg-secondary text-gray-400 text-xs px-2 py-0.5 rounded-full">{reviews.length}</span>
        </button>
        <button onClick={() => setActiveTab('returns')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'returns' ? 'border-orange-500 text-orange-400' : 'border-transparent text-gray-400 hover:text-white'
          }`}>
          <RotateCcw size={16} /> Return Requests
          {pendingCount > 0 && (
            <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">{pendingCount}</span>
          )}
        </button>
      </div>

      {/* ══ REVIEWS TAB ══ */}
      {activeTab === 'reviews' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-5 gap-3 mb-5">
            {[5,4,3,2,1].map(star => {
              const count = reviews.filter(r => r.rating === star).length;
              return (
                <div key={star}
                  className={`bg-card border rounded-xl p-3 text-center cursor-pointer transition ${
                    filterRating === String(star) ? 'border-purple-500 bg-purple-500/10' : 'border-border hover:border-purple-500/50'
                  }`}
                  onClick={() => setFilterRating(filterRating === String(star) ? '' : String(star))}>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span className="text-white font-bold">{star}</span>
                    <Star size={12} className="fill-yellow-400 text-yellow-400" />
                  </div>
                  <p className="text-purple-400 font-bold text-lg">{count}</p>
                  <p className="text-gray-500 text-xs">reviews</p>
                </div>
              );
            })}
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2 mb-4">
            <Filter size={14} className="text-gray-400" />
            <select value={filterRating} onChange={e => setFilterRating(e.target.value)}
              className="bg-card border border-border text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500">
              <option value="">All Ratings</option>
              {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Star</option>)}
            </select>
            {filterRating && (
              <button onClick={() => setFilterRating('')} className="text-gray-400 text-xs hover:text-white">
                Clear ✕
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <MessageSquare size={40} className="mx-auto mb-3 opacity-50" />
              <p>Koi review nahi hai</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map(review => (
                <div key={review._id} className="bg-card border border-border rounded-2xl overflow-hidden hover:border-purple-500/30 transition">

                  {/* Review Header */}
                  <div className="flex items-start justify-between p-4 border-b border-border">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold shrink-0">
                        {review.user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-white font-semibold text-sm">{review.user?.name}</span>
                          <span className="text-gray-500 text-xs">{review.user?.email}</span>
                          {review.isVerifiedPurchase && (
                            <span className="flex items-center gap-1 text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full border border-green-400/20">
                              <Check size={10} /> Verified
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <StarDisplay rating={review.rating} />
                          <span className="text-gray-500 text-xs">
                            {new Date(review.createdAt).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                        {review.product && (
                          <p className="text-gray-500 text-xs mt-0.5">
                            Product: <span className="text-purple-400">{review.product.name}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => handleEdit(review)}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-border rounded-lg text-gray-400 hover:border-purple-500 hover:text-purple-400 transition">
                        <Edit2 size={12} /> Reply
                      </button>
                      <button onClick={() => handleDelete(review._id)}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-red-400/20 rounded-lg text-red-400 hover:border-red-400 transition">
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="p-4">
                    {review.title && <p className="text-white font-semibold text-sm mb-1">{review.title}</p>}
                    <p className="text-gray-300 text-sm leading-relaxed">{review.comment}</p>

                    {/* Review Images */}
                    {review.photos?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-gray-500 text-xs mb-2 flex items-center gap-1">
                          <Image size={12} /> Customer Photos ({review.photos.length})
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          {review.photos.map((photo, i) => (
                            <a key={i} href={photo} target="_blank" rel="noreferrer">
                              <img src={photo} alt="" className="w-20 h-20 object-cover rounded-xl border border-border hover:border-purple-400 transition" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Helpful */}
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-gray-500 text-xs">👍 {review.helpful?.length || 0} helpful</span>
                      <span className="text-gray-500 text-xs">👎 {review.notHelpful?.length || 0} not helpful</span>
                    </div>

                    {/* Existing Reply */}
                    {review.adminReply && editId !== review._id && (
                      <div className="mt-3 bg-purple-500/5 border border-purple-500/20 rounded-xl p-3">
                        <p className="text-purple-400 text-xs font-bold mb-1">👑 Avio Response</p>
                        <p className="text-gray-300 text-sm">{review.adminReply}</p>
                      </div>
                    )}

                    {/* Edit Form */}
                    {editId === review._id && (
                      <div className="mt-3 bg-secondary border border-purple-500/30 rounded-xl p-4">
                        <label className="text-purple-400 text-xs font-bold mb-2 block">👑 Reply as Avio</label>
                        <textarea value={editForm.adminReply}
                          onChange={e => setEditForm({ ...editForm, adminReply: e.target.value })}
                          placeholder="Customer ko reply likho..."
                          rows={3}
                          className="w-full bg-card border border-border rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 transition resize-none mb-3" />
                        <div className="flex gap-2">
                          <button onClick={() => setEditId(null)}
                            className="flex-1 border border-border text-gray-300 py-2 rounded-xl text-sm hover:border-purple-500 transition">
                            Cancel
                          </button>
                          <button onClick={() => handleSave(review._id)} disabled={saving}
                            className="flex-1 text-white py-2 rounded-xl text-sm font-bold transition disabled:opacity-50 flex items-center justify-center gap-2"
                            style={{ background: 'linear-gradient(135deg,#6C3AE8,#C084FC)' }}>
                            {saving
                              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              : <><Check size={14} /> Save Reply</>}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ══ RETURNS TAB ══ */}
      {activeTab === 'returns' && (
        <>
          {/* Return Stats */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: 'Total', count: returnOrders.length, color: 'text-gray-400', bg: 'bg-gray-400/10 border-gray-400/20' },
              { label: 'Pending', count: returnOrders.filter(o => o.returnRequest?.status === 'Pending').length, color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' },
              { label: 'Accepted', count: returnOrders.filter(o => o.returnRequest?.status === 'Accepted').length, color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20' },
            ].map(stat => (
              <div key={stat.label} className={`border rounded-xl p-4 text-center ${stat.bg}`}>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
                <p className="text-gray-500 text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {returnLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : returnOrders.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <RotateCcw size={40} className="mx-auto mb-3 opacity-50" />
              <p>Koi return request nahi hai</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Pending first */}
              {returnOrders.filter(o => o.returnRequest?.status === 'Pending').length > 0 && (
                <>
                  <p className="text-yellow-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle size={12} /> Pending — Action Required
                  </p>
                  {returnOrders
                    .filter(o => o.returnRequest?.status === 'Pending')
                    .map(order => (
                      <ReturnCard key={order._id} order={order} onResolve={fetchReturns} />
                    ))}
                </>
              )}
              {/* Resolved */}
              {returnOrders.filter(o => o.returnRequest?.status !== 'Pending').length > 0 && (
                <>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mt-4">Resolved</p>
                  {returnOrders
                    .filter(o => o.returnRequest?.status !== 'Pending')
                    .map(order => (
                      <ReturnCard key={order._id} order={order} onResolve={fetchReturns} />
                    ))}
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminReviews;