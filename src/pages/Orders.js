import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, Truck, CheckCircle, Clock, XCircle, MapPin,
  ChevronDown, ChevronUp, ShoppingBag, ArrowRight,
  RotateCcw, Calendar, AlertTriangle, Search, Star,
  Camera, X, Upload, MessageSquare, Check
} from 'lucide-react';
import { getMyOrders, cancelOrder } from '../utils/api';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const allSteps = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

const stepConfig = {
  Pending:    { icon: Clock,        color: 'text-yellow-400', bg: 'bg-yellow-400', label: 'Order Placed',  desc: 'Aapka order receive ho gaya!' },
  Confirmed:  { icon: CheckCircle,  color: 'text-blue-400',   bg: 'bg-blue-400',   label: 'Confirmed',     desc: 'Order confirm ho gaya!' },
  Processing: { icon: Package,      color: 'text-purple-400', bg: 'bg-purple-400', label: 'Processing',    desc: 'Order pack kiya ja raha hai' },
  Shipped:    { icon: Truck,        color: 'text-cyan-400',   bg: 'bg-cyan-400',   label: 'Shipped',       desc: 'Order raste mein hai!' },
  Delivered:  { icon: CheckCircle,  color: 'text-green-400',  bg: 'bg-green-400',  label: 'Delivered',     desc: 'Order deliver ho gaya! 🎉' },
  Cancelled:  { icon: XCircle,      color: 'text-red-400',    bg: 'bg-red-400',    label: 'Cancelled',     desc: 'Order cancel ho gaya' },
  Returned:   { icon: RotateCcw,    color: 'text-orange-400', bg: 'bg-orange-400', label: 'Returned',      desc: 'Order return ho gaya' },
};

const returnReasons = [
  'Wrong Size / Fit nahi hua',
  'Damaged / Defective Product',
  'Wrong Product Delivered',
  'Quality Expected se Kharaab',
  'Product Description se Alag',
  'Duplicate / Fake Product',
  'Change of Mind',
  'Other',
];

// ─── STAR INPUT ───────────────────────────────────────────
const StarInput = ({ value, onChange }) => (
  <div className="flex items-center gap-1">
    {[1,2,3,4,5].map(i => (
      <button key={i} type="button" onClick={() => onChange(i)}>
        <Star size={28} className={i <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600 hover:text-yellow-400 transition'} />
      </button>
    ))}
  </div>
);

// ─── CANCEL MODAL ─────────────────────────────────────────
const CancelModal = ({ order, onConfirm, onClose, cancelling }) => (
  <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
    <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full">
      <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertTriangle size={28} className="text-red-400" />
      </div>
      <h3 className="text-white font-bold text-lg text-center mb-1">Order Cancel Karo?</h3>
      <p className="text-gray-400 text-sm text-center mb-2">
        Order <span className="text-yellow-400 font-mono font-bold">{order.orderId}</span> cancel karna chahte ho?
      </p>
      <p className="text-gray-500 text-xs text-center mb-5">⚠️ Yeh action undo nahi ho sakta</p>
      <div className="flex gap-3">
        <button onClick={onClose} disabled={cancelling}
          className="flex-1 border border-border text-gray-300 py-2.5 rounded-xl text-sm hover:border-yellow-400 transition disabled:opacity-50">
          Nahi, Rakho
        </button>
        <button onClick={onConfirm} disabled={cancelling}
          className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
          {cancelling
            ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Cancel ho raha...</>
            : <><XCircle size={16} /> Haan, Cancel Karo</>}
        </button>
      </div>
    </div>
  </div>
);

// ─── RETURN MODAL ─────────────────────────────────────────
const ReturnModal = ({ order, onClose, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef();

  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    setImages(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async () => {
    if (!reason) return toast.error('Return ka reason select karo!');
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('reason', reason);
      formData.append('description', description);
      images.forEach(img => formData.append('photos', img));

      await API.post(`/orders/${order._id}/return`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Return request submit ho gayi! 📦');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Return request submit nahi hui!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full my-4">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <RotateCcw size={20} className="text-orange-400" /> Return Request
          </h3>
          <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-white" /></button>
        </div>

        {/* Order info */}
        <div className="bg-secondary rounded-xl p-3 mb-4 flex items-center gap-3">
          <img src={order.items[0]?.productImage} alt="" className="w-12 h-12 rounded-lg object-cover border border-border" />
          <div>
            <p className="text-white text-sm font-semibold">{order.orderId}</p>
            <p className="text-gray-400 text-xs">{order.items[0]?.productName}{order.items.length > 1 ? ` +${order.items.length - 1} more` : ''}</p>
          </div>
        </div>

        {/* Reason */}
        <div className="mb-4">
          <label className="text-gray-400 text-sm mb-2 block">Return ka reason *</label>
          <div className="grid grid-cols-1 gap-2">
            {returnReasons.map(r => (
              <button key={r} onClick={() => setReason(r)}
                className={`text-left px-3 py-2 rounded-xl border text-sm transition ${
                  reason === r ? 'border-orange-400 bg-orange-400/10 text-orange-300' : 'border-border text-gray-400 hover:border-orange-400/50'
                }`}>
                {reason === r && <Check size={12} className="inline mr-1 text-orange-400" />}{r}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="text-gray-400 text-sm mb-2 block">Description (optional)</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Problem ke baare mein thoda detail mein batao..."
            rows={3}
            className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-400 transition resize-none" />
        </div>

        {/* Image upload */}
        <div className="mb-5">
          <label className="text-gray-400 text-sm mb-2 block">Photos (optional, max 3)</label>
          <div className="flex gap-2 flex-wrap">
            {previews.map((p, i) => (
              <div key={i} className="relative w-20 h-20">
                <img src={p} alt="" className="w-full h-full object-cover rounded-xl border border-border" />
                <button onClick={() => { setImages(imgs => imgs.filter((_, j) => j !== i)); setPreviews(ps => ps.filter((_, j) => j !== i)); }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <X size={10} className="text-white" />
                </button>
              </div>
            ))}
            {previews.length < 3 && (
              <button onClick={() => fileRef.current?.click()}
                className="w-20 h-20 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-1 hover:border-orange-400 transition">
                <Camera size={18} className="text-gray-500" />
                <span className="text-gray-600 text-xs">Add</span>
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 border border-border text-gray-300 py-2.5 rounded-xl text-sm hover:border-orange-400 transition">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={submitting || !reason}
            className="flex-1 bg-orange-500 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-orange-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting
              ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</>
              : <><RotateCcw size={16} /> Submit Return</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── REVIEW MODAL ─────────────────────────────────────────
const ReviewModal = ({ order, onClose, onSuccess }) => {
  const [selectedProduct, setSelectedProduct] = useState(order.items[0]);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [reviewedProducts, setReviewedProducts] = useState([]);
  const fileRef = useRef();

  useEffect(() => {
    // Fetch already reviewed products
    const checkReviewed = async () => {
      try {
        const res = await API.get(`/reviews/pending/${order.customer || order.customerId}`);
        const pendingIds = res.data.pendingItems.map(p => p.productId?.toString());
        const reviewed = order.items
          .filter(item => !pendingIds.includes(item.product?.toString()))
          .map(item => item.product?.toString());
        setReviewedProducts(reviewed);
      } catch {}
    };
    checkReviewed();
  }, []);

  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    setImages(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async () => {
    if (!rating) return toast.error('Rating do!');
    if (!comment.trim()) return toast.error('Review likho!');
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('rating', rating);
      formData.append('title', title);
      formData.append('comment', comment);
      formData.append('orderId', order._id);
      images.forEach(img => formData.append('photos', img));

      await API.post(`/reviews/${selectedProduct.product}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Review submit ho gaya! Shukriya 🙏');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Review submit nahi hua!');
    } finally {
      setSubmitting(false);
    }
  };

  const ratingLabels = { 1: 'Bahut Kharaab 😞', 2: 'Kharaab 😕', 3: 'Theek Hai 😐', 4: 'Accha 😊', 5: 'Zabardast! 🤩' };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full my-4">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <Star size={20} className="text-yellow-400" /> Write Review
          </h3>
          <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-white" /></button>
        </div>

        {/* Product select (agar multiple items hain) */}
        {order.items.length > 1 && (
          <div className="mb-4">
            <label className="text-gray-400 text-sm mb-2 block">Kaunse product ka review dena hai?</label>
            <div className="space-y-2">
              {order.items.map((item, i) => {
                const alreadyReviewed = reviewedProducts.includes(item.product?.toString());
                return (
                  <button key={i} onClick={() => !alreadyReviewed && setSelectedProduct(item)}
                    disabled={alreadyReviewed}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition ${
                      selectedProduct?.product === item.product
                        ? 'border-yellow-400 bg-yellow-400/10'
                        : alreadyReviewed
                        ? 'border-border opacity-40 cursor-not-allowed'
                        : 'border-border hover:border-yellow-400/50'
                    }`}>
                    <img src={item.productImage} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm line-clamp-1">{item.productName}</p>
                      {alreadyReviewed && <p className="text-green-400 text-xs">✅ Already reviewed</p>}
                    </div>
                    {selectedProduct?.product === item.product && !alreadyReviewed && (
                      <Check size={16} className="text-yellow-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Single product preview */}
        {order.items.length === 1 && (
          <div className="bg-secondary rounded-xl p-3 mb-4 flex items-center gap-3">
            <img src={selectedProduct?.productImage} alt="" className="w-12 h-12 rounded-lg object-cover border border-border" />
            <p className="text-white text-sm font-medium">{selectedProduct?.productName}</p>
          </div>
        )}

        {/* Rating */}
        <div className="mb-4 text-center">
          <label className="text-gray-400 text-sm mb-3 block">Rating do *</label>
          <StarInput value={rating} onChange={setRating} />
          {rating > 0 && <p className="text-yellow-400 text-sm mt-2 font-semibold">{ratingLabels[rating]}</p>}
        </div>

        {/* Title */}
        <div className="mb-3">
          <label className="text-gray-400 text-sm mb-1.5 block">Title (optional)</label>
          <input value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Ek line mein summary..."
            className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-400 transition" />
        </div>

        {/* Comment */}
        <div className="mb-4">
          <label className="text-gray-400 text-sm mb-1.5 block">Review *</label>
          <textarea value={comment} onChange={e => setComment(e.target.value)}
            placeholder="Product ke baare mein apna experience share karo..."
            rows={3}
            className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-400 transition resize-none" />
        </div>

        {/* Image upload */}
        <div className="mb-5">
          <label className="text-gray-400 text-sm mb-2 block flex items-center gap-1">
            <Camera size={14} /> Photos add karo (optional, max 3)
          </label>
          <div className="flex gap-2 flex-wrap">
            {previews.map((p, i) => (
              <div key={i} className="relative w-20 h-20">
                <img src={p} alt="" className="w-full h-full object-cover rounded-xl border border-border" />
                <button onClick={() => { setImages(imgs => imgs.filter((_, j) => j !== i)); setPreviews(ps => ps.filter((_, j) => j !== i)); }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <X size={10} className="text-white" />
                </button>
              </div>
            ))}
            {previews.length < 3 && (
              <button onClick={() => fileRef.current?.click()}
                className="w-20 h-20 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-1 hover:border-yellow-400 transition">
                <Upload size={18} className="text-gray-500" />
                <span className="text-gray-600 text-xs">Upload</span>
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 border border-border text-gray-300 py-2.5 rounded-xl text-sm hover:border-yellow-400 transition">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={submitting || !rating || !comment.trim()}
            className="flex-1 text-black py-2.5 rounded-xl text-sm font-bold transition disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,#6C3AE8,#C084FC)' }}>
            {submitting
              ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</>
              : <><Star size={16} className="text-white" /> <span className="text-white">Submit Review</span></>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── PROGRESS BAR ─────────────────────────────────────────
const ProgressBar = ({ status }) => {
  const currentIndex = allSteps.indexOf(status);
  const isCancelled = status === 'Cancelled' || status === 'Returned';

  if (isCancelled) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-2xl px-6 py-4">
          <XCircle size={24} className="text-red-400" />
          <div>
            <p className="text-red-400 font-bold">{status === 'Cancelled' ? 'Order Cancelled' : 'Order Returned'}</p>
            <p className="text-gray-400 text-sm">Aapka order {status.toLowerCase()} ho gaya hai</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="hidden md:block">
        <div className="relative flex items-center justify-between">
          <div className="absolute top-5 left-0 right-0 h-1 bg-border rounded-full" />
          <div className="absolute top-5 left-0 h-1 rounded-full transition-all duration-1000"
            style={{ width: currentIndex >= 0 ? `${(currentIndex / (allSteps.length - 1)) * 100}%` : '0%', background: 'linear-gradient(90deg,#6C3AE8,#C084FC)' }} />
          {allSteps.map((step, i) => {
            const cfg = stepConfig[step];
            const Icon = cfg.icon;
            const isDone = i <= currentIndex;
            const isCurrent = i === currentIndex;
            return (
              <div key={step} className="relative flex flex-col items-center z-10">
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                  isDone ? `${cfg.bg} border-transparent` : 'bg-card border-border'
                } ${isCurrent ? 'ring-4 ring-purple-500/30' : ''}`}>
                  <Icon size={18} className={isDone ? 'text-black' : 'text-gray-600'} />
                </div>
                <p className={`text-xs font-semibold mt-2 ${isDone ? cfg.color : 'text-gray-600'}`}>{cfg.label}</p>
              </div>
            );
          })}
        </div>
      </div>
      <div className="md:hidden space-y-0">
        {allSteps.map((step, i) => {
          const cfg = stepConfig[step];
          const Icon = cfg.icon;
          const isDone = i <= currentIndex;
          const isCurrent = i === currentIndex;
          const isLast = i === allSteps.length - 1;
          return (
            <div key={step} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                  isDone ? `${cfg.bg} border-transparent` : 'bg-card border-border'
                } ${isCurrent ? 'ring-4 ring-purple-500/20' : ''}`}>
                  <Icon size={16} className={isDone ? 'text-black' : 'text-gray-600'} />
                </div>
                {!isLast && <div className={`w-0.5 h-8 mt-1 rounded-full ${isDone && i < currentIndex ? 'bg-purple-500' : 'bg-border'}`} />}
              </div>
              <div className="pt-1.5 pb-6">
                <p className={`text-sm font-semibold ${isDone ? cfg.color : 'text-gray-600'}`}>{cfg.label}</p>
                {isCurrent && <p className="text-gray-400 text-xs mt-0.5">{cfg.desc}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── RETURN STATUS BADGE ──────────────────────────────────
const ReturnStatusBadge = ({ returnRequest }) => {
  if (!returnRequest || returnRequest.status === 'None') return null;
  const config = {
    Pending:  { color: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10', label: '⏳ Return Pending' },
    Accepted: { color: 'text-green-400 border-green-400/30 bg-green-400/10',   label: '✅ Return Accepted' },
    Rejected: { color: 'text-red-400 border-red-400/30 bg-red-400/10',         label: '❌ Return Rejected' },
  };
  const cfg = config[returnRequest.status];
  return (
    <div className={`rounded-xl px-3 py-2 mb-3 border text-xs font-semibold ${cfg.color}`}>
      <p>{cfg.label}</p>
      {returnRequest.reason && <p className="text-gray-400 mt-0.5">Reason: {returnRequest.reason}</p>}
      {returnRequest.adminNote && <p className="text-gray-300 mt-0.5">Admin Note: {returnRequest.adminNote}</p>}
    </div>
  );
};

// ─── ORDER CARD ───────────────────────────────────────────
const OrderCard = ({ order, onCancelClick, onReturnClick, onReviewClick }) => {
  const [expanded, setExpanded] = useState(false);
  const cfg = stepConfig[order.status] || stepConfig.Pending;
  const StatusIcon = cfg.icon;

  const progressPercent = order.status === 'Delivered' ? 100
    : order.status === 'Shipped' ? 75
    : order.status === 'Processing' ? 50
    : order.status === 'Confirmed' ? 25
    : order.status === 'Pending' ? 10 : 0;

  const canCancel = ['Pending', 'Confirmed'].includes(order.status);
  const canReturn = order.status === 'Delivered' &&
    (!order.returnRequest || order.returnRequest.status === 'None');
  const canReview = order.status === 'Delivered';
  const hasReturnRequest = order.returnRequest && order.returnRequest.status !== 'None';

  return (
    <div className={`bg-card border rounded-2xl overflow-hidden transition-all duration-300 ${
      expanded ? 'border-purple-500/50' : 'border-border hover:border-purple-500/30'
    }`}>
      <div className="p-4 md:p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-white font-bold">{order.orderId}</span>
              <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${cfg.color} border-current/30`}
                style={{ backgroundColor: `${cfg.color.replace('text-', '')}15` }}>
                <StatusIcon size={10} /> {order.status}
              </span>
            </div>
            <p className="text-gray-400 text-xs mt-0.5">
              {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-bold text-lg" style={{ color: '#C084FC' }}>₹{order.finalAmount}</p>
            <p className="text-gray-500 text-xs">{order.items?.length} item{order.items?.length > 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Progress */}
        {!['Cancelled', 'Returned'].includes(order.status) && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <MapPin size={10} className="text-purple-400" /> Order Progress
              </span>
              <span className="text-xs font-semibold" style={{ color: '#C084FC' }}>{progressPercent}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${progressPercent}%`, background: 'linear-gradient(90deg,#6C3AE8,#C084FC)' }} />
            </div>
          </div>
        )}

        {order.expectedDelivery && !['Delivered', 'Cancelled', 'Returned'].includes(order.status) && (
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2 mb-3">
            <Calendar size={14} className="text-green-400 shrink-0" />
            <span className="text-green-400 text-xs font-semibold">Expected: </span>
            <span className="text-white text-xs font-bold">
              {new Date(order.expectedDelivery).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long' })}
            </span>
          </div>
        )}

        {order.status === 'Delivered' && (
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2 mb-3">
            <CheckCircle size={14} className="text-green-400 shrink-0" />
            <span className="text-green-400 text-xs font-semibold">Delivered Successfully! 🎉</span>
          </div>
        )}

        {/* Return status */}
        <ReturnStatusBadge returnRequest={order.returnRequest} />

        {order.items?.[0] && (
          <div className="flex items-center gap-3 bg-secondary rounded-xl p-3 mb-3">
            <img src={order.items[0].productImage} alt={order.items[0].productName}
              className="w-12 h-12 object-cover rounded-lg border border-border" />
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium line-clamp-1">{order.items[0].productName}</p>
              <p className="text-gray-400 text-xs">Qty: {order.items[0].quantity} × ₹{order.items[0].price}</p>
            </div>
            {order.items.length > 1 && (
              <span className="text-xs px-2 py-1 rounded-full shrink-0" style={{ color: '#C084FC', background: 'rgba(108,58,232,0.15)' }}>
                +{order.items.length - 1} more
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setExpanded(!expanded)}
            className="flex-1 flex items-center justify-center gap-2 text-sm border rounded-xl py-2 hover:bg-purple-500/5 transition"
            style={{ color: '#C084FC', borderColor: 'rgba(108,58,232,0.3)' }}>
            {expanded ? <><ChevronUp size={14} /> Hide Details</> : <><ChevronDown size={14} /> Track Order</>}
          </button>

          {canReview && (
            <button onClick={() => onReviewClick(order)}
              className="flex items-center gap-1.5 text-yellow-400 text-sm border border-yellow-400/20 rounded-xl px-3 py-2 hover:bg-yellow-400/10 hover:border-yellow-400/50 transition">
              <Star size={14} /> Review
            </button>
          )}

          {canReturn && (
            <button onClick={() => onReturnClick(order)}
              className="flex items-center gap-1.5 text-orange-400 text-sm border border-orange-400/20 rounded-xl px-3 py-2 hover:bg-orange-500/10 hover:border-orange-400/50 transition">
              <RotateCcw size={14} /> Return
            </button>
          )}

          {canCancel && (
            <button onClick={() => onCancelClick(order)}
              className="flex items-center gap-1.5 text-red-400 text-sm border border-red-400/20 rounded-xl px-3 py-2 hover:bg-red-500/10 hover:border-red-400/50 transition">
              <XCircle size={14} /> Cancel
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border">
          {/* Tracking */}
          <div className="px-4 md:px-5 pt-4">
            <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
              <Truck size={16} style={{ color: '#C084FC' }} /> Tracking Timeline
            </h4>
            <ProgressBar status={order.status} />
          </div>

          {/* Status History */}
          {order.statusHistory?.length > 0 && (
            <div className="px-4 md:px-5 py-4 border-t border-border">
              <h4 className="text-white font-semibold text-sm mb-3">Status History</h4>
              <div className="space-y-3">
                {[...order.statusHistory].reverse().map((h, i) => {
                  const hCfg = stepConfig[h.status] || stepConfig.Pending;
                  const HIcon = hCfg.icon;
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-full ${hCfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                        <HIcon size={14} className="text-black" />
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${hCfg.color}`}>{h.status}</p>
                        {h.note && <p className="text-gray-400 text-xs">{h.note}</p>}
                        {h.updatedAt && (
                          <p className="text-gray-500 text-xs">
                            {new Date(h.updatedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Items */}
          <div className="px-4 md:px-5 py-4 border-t border-border">
            <h4 className="text-white font-semibold text-sm mb-3">Order Items</h4>
            <div className="space-y-3">
              {order.items?.map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-secondary rounded-xl p-3">
                  <img src={item.productImage} alt={item.productName}
                    className="w-14 h-14 object-cover rounded-lg border border-border" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium line-clamp-1">{item.productName}</p>
                    <p className="text-gray-400 text-xs mt-0.5">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-bold shrink-0" style={{ color: '#C084FC' }}>₹{item.price * item.quantity}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="px-4 md:px-5 py-4 border-t border-border">
            <h4 className="text-white font-semibold text-sm mb-3">Price Details</h4>
            <div className="bg-secondary rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white">₹{order.totalAmount}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Discount {order.couponUsed && `(${order.couponUsed})`}</span>
                  <span className="text-green-400">- ₹{order.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Delivery</span>
                <span className="text-green-400">FREE</span>
              </div>
              <div className="flex justify-between font-bold border-t border-border pt-2">
                <span className="text-white">Total Paid</span>
                <span className="text-lg" style={{ color: '#C084FC' }}>₹{order.finalAmount}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Payment</span>
                <span className="text-gray-300">💵 {order.paymentMethod}</span>
              </div>
            </div>
          </div>

          {/* Address */}
          {order.deliveryAddress && (
            <div className="px-4 md:px-5 py-4 border-t border-border">
              <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                <MapPin size={14} style={{ color: '#C084FC' }} /> Delivery Address
              </h4>
              <div className="bg-secondary rounded-xl p-3">
                <p className="text-white font-semibold text-sm">{order.deliveryAddress.fullName}</p>
                <p className="text-gray-400 text-sm">{order.deliveryAddress.phone}</p>
                <p className="text-gray-400 text-sm">
                  {order.deliveryAddress.addressLine}, {order.deliveryAddress.city}, {order.deliveryAddress.state} — {order.deliveryAddress.pincode}
                </p>
              </div>
            </div>
          )}

          {order.meeshoOrderId && (
            <div className="px-4 md:px-5 py-3 border-t border-border">
              <p className="text-gray-500 text-xs">
                Meesho Order ID: <span className="font-mono" style={{ color: '#C084FC' }}>{order.meeshoOrderId}</span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── MAIN ORDERS PAGE ─────────────────────────────────────
const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [returnTarget, setReturnTarget] = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [trackId, setTrackId] = useState('');
  const [tracking, setTracking] = useState(false);
  const [trackedOrder, setTrackedOrder] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchOrders(); }, []);

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

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await cancelOrder(cancelTarget._id);
      toast.success('Order cancel ho gaya! ✅');
      setCancelTarget(null);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel nahi hua!');
    } finally {
      setCancelling(false);
    }
  };

  const handleTrack = async () => {
    if (!trackId.trim()) return toast.error('Order ID daalo!');
    setTracking(true);
    try {
      const { data } = await API.get(`/orders/track/${trackId.trim()}`);
      setTrackedOrder(data.order);
    } catch {
      toast.error('Order nahi mila! ID check karo.');
      setTrackedOrder(null);
    } finally {
      setTracking(false);
    }
  };

  const filters = ['All', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  const filtered = filter === 'All' ? orders : orders.filter(o => o.status === filter);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-3">
      <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#6C3AE8', borderTopColor: 'transparent' }} />
      <p className="text-gray-400 text-sm">Loading your orders...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-primary pb-24 md:pb-8">
      <div className="max-w-3xl mx-auto px-4 py-6">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Package style={{ color: '#C084FC' }} /> My Orders
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">{orders.length} total orders</p>
          </div>
          <button onClick={() => navigate('/products')}
            className="flex items-center gap-2 text-sm border px-3 py-2 rounded-xl transition"
            style={{ color: '#C084FC', borderColor: 'rgba(108,58,232,0.3)' }}>
            Shop More <ArrowRight size={14} />
          </button>
        </div>

        {/* Track Order */}
        <div className="bg-card border border-border rounded-2xl p-4 mb-5">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-3 flex items-center gap-1">
            <Search size={12} /> Track Order by ID
          </p>
          <div className="flex gap-2">
            <input value={trackId} onChange={e => setTrackId(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleTrack()}
              placeholder="e.g. AV-2026-1234"
              className="flex-1 bg-secondary border border-border rounded-xl px-3 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-purple-500 transition placeholder-gray-600" />
            <button onClick={handleTrack} disabled={tracking}
              className="text-white px-4 py-2.5 rounded-xl font-bold text-sm transition disabled:opacity-50 flex items-center gap-1"
              style={{ background: 'linear-gradient(135deg,#6C3AE8,#C084FC)' }}>
              {tracking ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Search size={14} />}
              Track
            </button>
          </div>
          {trackedOrder && (
            <div className="mt-4 border-t border-border pt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold font-mono" style={{ color: '#C084FC' }}>#{trackedOrder.orderId}</p>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${stepConfig[trackedOrder.status]?.color} border-current/30`}>
                  {trackedOrder.status}
                </span>
              </div>
              <ProgressBar status={trackedOrder.status} />
              <button onClick={() => setTrackedOrder(null)} className="w-full text-gray-400 text-xs mt-3 hover:text-white transition">
                Close ✕
              </button>
            </div>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
          {filters.map(f => {
            const count = f === 'All' ? orders.length : orders.filter(o => o.status === f).length;
            return (
              <button key={f} onClick={() => setFilter(f)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                  filter === f ? 'text-white' : 'border border-border text-gray-400 hover:border-purple-500'
                }`}
                style={filter === f ? { background: 'linear-gradient(135deg,#6C3AE8,#C084FC)' } : {}}>
                {f}
                {count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                    filter === f ? 'bg-white/20 text-white' : 'bg-secondary text-gray-400'
                  }`}>{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag size={56} className="text-gray-600 mx-auto mb-4" />
            <p className="text-white font-semibold text-lg mb-1">
              {filter === 'All' ? 'Koi order nahi hai!' : `Koi ${filter} order nahi hai`}
            </p>
            <p className="text-gray-400 text-sm mb-5">
              {filter === 'All' ? 'Abhi tak koi order place nahi kiya' : 'Is category mein koi order nahi'}
            </p>
            <button onClick={() => navigate('/products')}
              className="text-white px-8 py-3 rounded-full font-bold transition"
              style={{ background: 'linear-gradient(135deg,#6C3AE8,#C084FC)' }}>
              Shop Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(order => (
              <OrderCard key={order._id} order={order}
                onCancelClick={setCancelTarget}
                onReturnClick={setReturnTarget}
                onReviewClick={setReviewTarget} />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {cancelTarget && (
        <CancelModal order={cancelTarget} onConfirm={handleCancelConfirm}
          onClose={() => setCancelTarget(null)} cancelling={cancelling} />
      )}
      {returnTarget && (
        <ReturnModal order={returnTarget} onClose={() => setReturnTarget(null)} onSuccess={fetchOrders} />
      )}
      {reviewTarget && (
        <ReviewModal order={reviewTarget} onClose={() => setReviewTarget(null)} onSuccess={fetchOrders} />
      )}
    </div>
  );
};

export default Orders;