import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MapPin, Plus, Check, ChevronRight, ShoppingBag,
  Tag, Truck, Shield, Crown, X, Edit2, ArrowLeft,
  CheckCircle, Package
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { placeOrder } from '../utils/api';
import toast from 'react-hot-toast';

// ─── ORDER SUCCESS SCREEN ────────────────────────────────
const OrderSuccess = ({ orderId, onContinue }) => (
  <div className="fixed inset-0 bg-primary z-50 flex items-center justify-center px-4">
    <div className="max-w-sm w-full text-center">
      <div className="relative mb-6">
        <div className="w-28 h-28 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border-2 border-green-500/40 animate-pulse">
          <CheckCircle size={56} className="text-green-400" />
        </div>
        <div className="absolute -top-1 -right-1 w-8 h-8 bg-gold rounded-full flex items-center justify-center">
          <Crown size={16} className="text-black" />
        </div>
      </div>
      <h2 className="text-3xl font-bold text-white mb-2">Order Placed! 🎉</h2>
      <p className="text-gray-400 mb-1">Aapka order successfully place ho gaya!</p>
      <div className="bg-gold/10 border border-gold/30 rounded-xl px-4 py-3 mb-6 inline-block">
        <p className="text-gray-400 text-xs mb-1">Order ID</p>
        <p className="text-gold font-bold text-lg font-mono">{orderId}</p>
      </div>
      <div className="bg-card border border-border rounded-2xl p-4 mb-6 text-left">
        {[
          { icon: Package, text: 'Order confirm hone ka wait karo' },
          { icon: Truck, text: '5-7 business days mein delivery' },
          { icon: Shield, text: 'COD — delivery pe payment karo' },
        ].map((item, i) => (
          <div key={i} className={`flex items-center gap-3 text-sm ${i < 2 ? 'mb-3' : ''}`}>
            <div className="w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center shrink-0">
              <item.icon size={16} className="text-gold" />
            </div>
            <span className="text-gray-300">{item.text}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <button onClick={() => onContinue('orders')}
          className="flex-1 border border-gold text-gold py-3 rounded-xl font-semibold hover:bg-gold/10 transition text-sm">
          Track Order
        </button>
        <button onClick={() => onContinue('home')}
          className="flex-1 bg-gold text-black py-3 rounded-xl font-bold hover:bg-gold-light transition text-sm">
          Continue Shopping
        </button>
      </div>
    </div>
  </div>
);

// ─── ADDRESS FORM ────────────────────────────────────────
const AddressForm = ({ initial = {}, onSave, onCancel }) => {
  const [form, setForm] = useState({
    fullName: '', phone: '', addressLine: '', city: '', state: '', pincode: '',
    ...initial
  });

  const states = ['Andhra Pradesh', 'Delhi', 'Gujarat', 'Karnataka', 'Kerala',
    'Madhya Pradesh', 'Maharashtra', 'Punjab', 'Rajasthan', 'Tamil Nadu',
    'Telangana', 'Uttar Pradesh', 'West Bengal'];

  const handleSave = () => {
    if (!form.fullName || !form.phone || !form.addressLine || !form.city || !form.state || !form.pincode)
      return toast.error('Poori details bharo!');
    if (form.phone.length !== 10) return toast.error('Valid phone number daalo!');
    if (form.pincode.length !== 6) return toast.error('Valid pincode daalo!');
    onSave(form);
  };

  return (
    <div className="bg-secondary border border-gold/30 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-white font-bold flex items-center gap-2">
          <MapPin size={16} className="text-gold" /> Add New Address
        </h4>
        {onCancel && <button onClick={onCancel}><X size={18} className="text-gray-400 hover:text-white" /></button>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { key: 'fullName', label: 'Full Name *', placeholder: 'Poora naam', span: 2 },
          { key: 'phone', label: 'Phone Number *', placeholder: '10 digit number', span: 1, type: 'tel' },
          { key: 'pincode', label: 'Pincode *', placeholder: '6 digit pincode', span: 1, type: 'tel' },
          { key: 'addressLine', label: 'Address *', placeholder: 'House no, Street, Area', span: 2 },
          { key: 'city', label: 'City *', placeholder: 'Shehar ka naam', span: 1 },
        ].map(field => (
          <div key={field.key} className={field.span === 2 ? 'col-span-2' : ''}>
            <label className="text-gray-400 text-xs mb-1.5 block">{field.label}</label>
            <input type={field.type || 'text'} value={form[field.key]}
              onChange={e => setForm({ ...form, [field.key]: e.target.value })}
              placeholder={field.placeholder}
              className="w-full bg-card border border-border rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gold transition placeholder-gray-600" />
          </div>
        ))}
        <div>
          <label className="text-gray-400 text-xs mb-1.5 block">State *</label>
          <select value={form.state} onChange={e => setForm({ ...form, state: e.target.value })}
            className="w-full bg-card border border-border rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gold transition">
            <option value="">Select State</option>
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-3 mt-4">
        {onCancel && (
          <button onClick={onCancel}
            className="flex-1 border border-border text-gray-300 py-2.5 rounded-xl text-sm hover:border-gold transition">
            Cancel
          </button>
        )}
        <button onClick={handleSave}
          className="flex-1 bg-gold text-black py-2.5 rounded-xl text-sm font-bold hover:bg-gold-light transition">
          Save Address
        </button>
      </div>
    </div>
  );
};

// ─── MAIN CHECKOUT ────────────────────────────────────────
const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart: cartItems, clearCart, markCartRecovered } = useCart(); // ✅ FIX 1
  const { user } = useAuth();

  const passedState = location.state || {};
  const coupon = passedState.coupon || null;
  const couponDiscount = passedState.couponDiscount || 0;

  const subtotal = cartItems.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0);
  const deliveryCharge = subtotal >= 499 ? 0 : 49;
  const finalTotal = subtotal - couponDiscount + deliveryCharge;

  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const addressKey = user ? `crownbay_addresses_${user._id || user.email}` : null;

  // Spin wheel coupon notify karo
  useEffect(() => {
    try {
      const spinCoupon = JSON.parse(localStorage.getItem('avio_spin_coupon') || 'null');
      if (spinCoupon && !coupon) {
        toast.success(`🎡 Spin coupon available: ${spinCoupon.code} (${spinCoupon.label})`, { duration: 4000 });
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!addressKey) return;
    const saved = localStorage.getItem(addressKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAddresses(parsed);
        const def = parsed.find(a => a.isDefault) || parsed[0];
        if (def) setSelectedAddressId(def.id);
      } catch {
        localStorage.removeItem(addressKey);
        initDefault();
      }
    } else {
      initDefault();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressKey]);

  const initDefault = () => {
    const defaultAddr = {
      id: Date.now(),
      fullName: user?.name || '',
      phone: user?.phone || '',
      addressLine: '', city: '', state: '', pincode: '',
      isDefault: true,
    };
    setAddresses([defaultAddr]);
    setSelectedAddressId(defaultAddr.id);
  };

  useEffect(() => {
    if (!addressKey || addresses.length === 0) return;
    localStorage.setItem(addressKey, JSON.stringify(addresses));
  }, [addresses, addressKey]);

  useEffect(() => {
    if (cartItems.length === 0 && !orderId) navigate('/cart');
  }, [cartItems, orderId]);

  const selectedAddress = addresses.find(a => a.id === selectedAddressId);

  const handleAddAddress = (form) => {
    const newAddr = { ...form, id: Date.now(), isDefault: false };
    setAddresses(prev => [...prev, newAddr]);
    setSelectedAddressId(newAddr.id);
    setShowAddForm(false);
    toast.success('Address add ho gaya! ✅');
  };

  const handleUpdateAddress = (id, form) => {
    setAddresses(prev => prev.map(a => a.id === id ? { ...a, ...form } : a));
    toast.success('Address update ho gaya!');
  };

  const handleDeleteAddress = (id) => {
    const updated = addresses.filter(a => a.id !== id);
    setAddresses(updated);
    if (selectedAddressId === id) setSelectedAddressId(updated[0]?.id || null);
    toast.success('Address delete ho gaya!');
  };

  const handleSetDefault = (id) => {
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
    setSelectedAddressId(id);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress || !selectedAddress.addressLine)
      return toast.error('Delivery address complete karo!');
    setPlacing(true);
    try {
      const orderData = {
        items: cartItems.map(item => ({
          product: item._id,
          productName: item.name,
          productImage: item.images?.[0],
          quantity: item.quantity,
          price: item.sellingPrice,
        })),
        deliveryAddress: selectedAddress,
        totalAmount: subtotal,
        discount: couponDiscount,
        finalAmount: finalTotal,
        couponUsed: coupon?.code || null,
        paymentMethod: 'COD',
      };
      const { data } = await placeOrder(orderData);
      setOrderId(data.order.orderId);
      clearCart();
      await markCartRecovered(); // ✅ FIX 2
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order place nahi hua!');
    } finally {
      setPlacing(false);
    }
  };

  const handleContinue = (dest) => {
    if (dest === 'orders') navigate('/orders');
    else navigate('/');
  };

  if (orderId) return <OrderSuccess orderId={orderId} onContinue={handleContinue} />;

  return (
    <div className="min-h-screen bg-primary pb-32 md:pb-8">
      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/cart')}
            className="flex items-center gap-1 text-gray-400 hover:text-gold transition text-sm">
            <ArrowLeft size={16} /> Back
          </button>
          <div className="h-4 w-px bg-border" />
          <h1 className="text-xl font-bold text-white">Checkout</h1>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-3 mb-6">
          {[{ n: 1, label: 'Delivery Address' }, { n: 2, label: 'Review & Pay' }].map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 cursor-pointer ${step >= s.n ? 'opacity-100' : 'opacity-40'}`}
                onClick={() => step > s.n && setStep(s.n)}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                  step > s.n ? 'bg-green-500 text-white' : step === s.n ? 'bg-gold text-black' : 'bg-border text-gray-400'
                }`}>
                  {step > s.n ? <Check size={14} /> : s.n}
                </div>
                <span className={`text-sm font-medium hidden md:block ${step === s.n ? 'text-white' : 'text-gray-400'}`}>
                  {s.label}
                </span>
              </div>
              {i < 1 && <ChevronRight size={16} className="text-gray-600" />}
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Left ── */}
          <div className="flex-1">

            {/* STEP 1: Address */}
            {step === 1 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-bold text-base flex items-center gap-2">
                    <MapPin size={18} className="text-gold" /> Select Delivery Address
                  </h2>
                  <button onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-1.5 text-gold text-sm border border-gold/30 px-3 py-1.5 rounded-lg hover:bg-gold/10 transition">
                    <Plus size={14} /> Add New
                  </button>
                </div>

                {showAddForm && (
                  <div className="mb-4">
                    <AddressForm onSave={handleAddAddress} onCancel={() => setShowAddForm(false)} />
                  </div>
                )}

                <div className="space-y-3 mb-5">
                  {addresses.map(addr => (
                    <div key={addr.id} onClick={() => setSelectedAddressId(addr.id)}
                      className={`relative border rounded-2xl p-4 cursor-pointer transition ${
                        selectedAddressId === addr.id ? 'border-gold bg-gold/5' : 'border-border bg-card hover:border-gold/40'
                      }`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 transition ${
                          selectedAddressId === addr.id ? 'border-gold bg-gold' : 'border-gray-500'
                        }`}>
                          {selectedAddressId === addr.id && <div className="w-2 h-2 bg-black rounded-full" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-white font-semibold text-sm">{addr.fullName}</span>
                            <span className="text-gray-400 text-xs">{addr.phone}</span>
                            {addr.isDefault && (
                              <span className="bg-gold/20 text-gold text-xs px-2 py-0.5 rounded-full border border-gold/30">Default</span>
                            )}
                          </div>
                          {addr.addressLine ? (
                            <p className="text-gray-300 text-sm">
                              {addr.addressLine}, {addr.city}, {addr.state} — {addr.pincode}
                            </p>
                          ) : (
                            <p className="text-red-400 text-sm">Address details add karo ↓</p>
                          )}
                          {selectedAddressId === addr.id && addr.addressLine && (
                            <div className="flex gap-3 mt-2" onClick={e => e.stopPropagation()}>
                              {!addr.isDefault && (
                                <button onClick={() => handleSetDefault(addr.id)}
                                  className="text-xs text-gold hover:underline">Set as Default</button>
                              )}
                              {addresses.length > 1 && (
                                <button onClick={() => handleDeleteAddress(addr.id)}
                                  className="text-xs text-red-400 hover:underline">Delete</button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      {selectedAddressId === addr.id && !addr.addressLine && (
                        <div className="mt-3" onClick={e => e.stopPropagation()}>
                          <AddressForm initial={addr}
                            onSave={(form) => handleUpdateAddress(addr.id, form)} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    if (!selectedAddress?.addressLine) return toast.error('Address complete karo!');
                    setStep(2);
                    window.scrollTo(0, 0);
                  }}
                  className="w-full bg-gold text-black py-3.5 rounded-xl font-bold hover:bg-gold-light transition flex items-center justify-center gap-2">
                  Continue to Review <ChevronRight size={18} />
                </button>
              </div>
            )}

            {/* STEP 2: Review & Pay */}
            {step === 2 && (
              <div>
                <h2 className="text-white font-bold text-base mb-4 flex items-center gap-2">
                  <ShoppingBag size={18} className="text-gold" /> Review Your Order
                </h2>

                <div className="bg-card border border-border rounded-2xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gold text-xs font-bold uppercase tracking-wider">Delivering To</span>
                    <button onClick={() => setStep(1)}
                      className="flex items-center gap-1 text-gray-400 text-xs hover:text-gold transition">
                      <Edit2 size={12} /> Change
                    </button>
                  </div>
                  <p className="text-white font-semibold">{selectedAddress?.fullName}</p>
                  <p className="text-gray-400 text-sm">{selectedAddress?.phone}</p>
                  <p className="text-gray-300 text-sm">
                    {selectedAddress?.addressLine}, {selectedAddress?.city}, {selectedAddress?.state} — {selectedAddress?.pincode}
                  </p>
                </div>

                <div className="bg-card border border-border rounded-2xl p-4 mb-4">
                  <h3 className="text-white font-semibold text-sm mb-3">
                    {cartItems.length} Item{cartItems.length > 1 ? 's' : ''}
                  </h3>
                  <div className="space-y-3">
                    {cartItems.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <img src={item.images?.[0]} alt={item.name}
                          className="w-14 h-14 object-cover rounded-xl border border-border shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium line-clamp-1">{item.name}</p>
                          <p className="text-gray-400 text-xs mt-0.5">Qty: {item.quantity} × ₹{item.sellingPrice}</p>
                        </div>
                        <p className="text-gold font-bold shrink-0">₹{item.sellingPrice * item.quantity}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card border border-gold/20 rounded-2xl p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center">
                      <span className="text-xl">💵</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold">Cash on Delivery</p>
                      <p className="text-gray-400 text-xs">Delivery ke time payment karo</p>
                    </div>
                    <div className="ml-auto w-5 h-5 rounded-full border-2 border-gold bg-gold flex items-center justify-center">
                      <div className="w-2 h-2 bg-black rounded-full" />
                    </div>
                  </div>
                </div>

                <button onClick={handlePlaceOrder} disabled={placing}
                  className="w-full bg-gold text-black py-4 rounded-xl font-bold text-base hover:bg-gold-light transition disabled:opacity-50 flex items-center justify-center gap-2">
                  {placing
                    ? <><div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> Placing Order...</>
                    : <><Crown size={20} /> Place Order — ₹{finalTotal}</>
                  }
                </button>
                <p className="text-gray-500 text-xs text-center mt-3">
                  By placing order, you agree to our terms & conditions
                </p>
              </div>
            )}
          </div>

          {/* ── Right: Order Summary ── */}
          <div className="lg:w-72 shrink-0">
            <div className="bg-card border border-border rounded-2xl p-5 sticky top-24">
              <h3 className="text-white font-bold text-sm mb-4 pb-3 border-b border-border">Order Summary</h3>
              <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                {cartItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <img src={item.images?.[0]} alt={item.name}
                      className="w-10 h-10 object-cover rounded-lg border border-border shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs line-clamp-1">{item.name}</p>
                      <p className="text-gray-500 text-xs">×{item.quantity}</p>
                    </div>
                    <p className="text-gold text-xs font-bold shrink-0">₹{item.sellingPrice * item.quantity}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2 border-t border-border pt-3 mb-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">₹{subtotal}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400 flex items-center gap-1">
                      <Tag size={12} /> {coupon?.code}
                    </span>
                    <span className="text-green-400">− ₹{couponDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Delivery</span>
                  {deliveryCharge === 0
                    ? <span className="text-green-400 font-semibold">FREE</span>
                    : <span className="text-white">₹{deliveryCharge}</span>
                  }
                </div>
              </div>
              <div className="border-t border-border pt-3 flex justify-between font-bold">
                <span className="text-white">Total</span>
                <span className="text-gold text-lg">₹{finalTotal}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="mt-3 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2 text-center">
                  <p className="text-green-400 text-xs font-semibold">🎉 Saving ₹{couponDiscount}!</p>
                </div>
              )}
              {deliveryCharge === 0 && (
                <div className="mt-2 bg-blue-500/10 border border-blue-500/20 rounded-xl px-3 py-2 text-center">
                  <p className="text-blue-400 text-xs font-semibold">🚚 Free Delivery!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;