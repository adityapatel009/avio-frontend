import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Trash2, Plus, Minus, Tag, ArrowRight,
  ShoppingBag, Crown, Truck, Shield, RotateCcw, X, ChevronRight
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

// Valid coupons
const COUPONS = {
  'CROWN10': { discount: 10, type: 'percent', desc: '10% off' },
  'FIRST50': { discount: 50, type: 'flat', desc: '₹50 off' },
  'SAVE100': { discount: 100, type: 'flat', desc: '₹100 off' },
  'ROYAL20': { discount: 20, type: 'percent', desc: '20% off' },
};

const Cart = () => {
  const { cart: cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [showCouponInput, setShowCouponInput] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0);
  const originalTotal = cartItems.reduce((sum, item) => sum + (item.originalPrice || item.sellingPrice) * item.quantity, 0);
  const productDiscount = originalTotal - subtotal;

  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percent') {
      couponDiscount = Math.round(subtotal * appliedCoupon.discount / 100);
    } else {
      couponDiscount = appliedCoupon.discount;
    }
  }

  const deliveryCharge = subtotal >= 499 ? 0 : 49;
  const finalTotal = subtotal - couponDiscount + deliveryCharge;
  const totalSavings = productDiscount + couponDiscount + (deliveryCharge === 0 && subtotal > 0 ? 49 : 0);

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return setCouponError('Coupon code daalo!');
    const coupon = COUPONS[code];
    if (!coupon) {
      setCouponError('Invalid coupon code!');
      setAppliedCoupon(null);
      return;
    }
    setAppliedCoupon({ ...coupon, code });
    setCouponError('');
    setShowCouponInput(false);
    toast.success(`Coupon "${code}" apply ho gaya! ${coupon.desc} 🎉`);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.success('Coupon remove ho gaya!');
  };

  // Empty cart
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-primary flex flex-col items-center justify-center px-4 pb-24 md:pb-0">
        <div className="text-center max-w-sm">
          <div className="relative mb-6">
            <div className="w-32 h-32 bg-gold/10 rounded-full flex items-center justify-center mx-auto border border-gold/20">
              <ShoppingCart size={56} className="text-gold/50" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-secondary border border-border rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">0</span>
            </div>
          </div>
          <Crown size={24} className="text-gold mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-white mb-2">Cart Khali Hai!</h2>
          <p className="text-gray-400 mb-8 text-sm">Koi item cart mein nahi hai. Premium products explore karo aur apni pasand add karo!</p>
          <Link to="/products"
            className="inline-flex items-center gap-2 bg-gold text-black px-8 py-3.5 rounded-full font-bold hover:bg-gold-light transition">
            <ShoppingBag size={18} /> Shop Now
          </Link>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { icon: Truck, text: 'Free Delivery', sub: 'Above ₹499' },
              { icon: Shield, text: 'Secure Pay', sub: 'COD Available' },
              { icon: RotateCcw, text: 'Easy Returns', sub: '7 Days' },
            ].map(b => (
              <div key={b.text} className="bg-card border border-border rounded-xl p-3 text-center">
                <b.icon size={16} className="text-gold mx-auto mb-1" />
                <p className="text-white text-xs font-semibold">{b.text}</p>
                <p className="text-gray-500 text-xs">{b.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary pb-36 md:pb-8">
      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <ShoppingCart className="text-gold" /> My Cart
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">{cartItems.length} item{cartItems.length > 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => { clearCart(); toast.success('Cart clear ho gaya!'); }}
            className="text-red-400 text-sm border border-red-400/20 px-3 py-1.5 rounded-lg hover:border-red-400 transition flex items-center gap-1.5">
            <Trash2 size={14} /> Clear All
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Left: Cart Items ── */}
          <div className="flex-1 space-y-3">
            {cartItems.map((item, index) => {
              const discount = item.originalPrice > item.sellingPrice
                ? Math.round(((item.originalPrice - item.sellingPrice) / item.originalPrice) * 100) : 0;
              return (
                <div key={`${item._id}-${index}`}
                  className="bg-card border border-border rounded-2xl p-4 flex gap-4 hover:border-gold/30 transition group">

                  {/* Image */}
                  <Link to={`/product/${item._id}`} className="shrink-0">
                    <div className="relative w-24 h-28 md:w-28 md:h-32 rounded-xl overflow-hidden border border-border">
                      <img src={item.images?.[0]} alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      {discount > 0 && (
                        <span className="absolute top-1 left-1 bg-gold text-black text-xs font-bold px-1.5 py-0.5 rounded-full">
                          {discount}%
                        </span>
                      )}
                    </div>
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <p className="text-gray-400 text-xs mb-0.5">{item.category}</p>
                      <Link to={`/product/${item._id}`}>
                        <p className="text-white font-semibold text-sm md:text-base line-clamp-2 hover:text-gold transition">
                          {item.name}
                        </p>
                      </Link>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-gold font-bold text-lg">₹{item.sellingPrice}</span>
                        {item.originalPrice > item.sellingPrice && (
                          <span className="text-gray-500 text-sm line-through">₹{item.originalPrice}</span>
                        )}
                        {discount > 0 && (
                          <span className="text-green-400 text-xs font-semibold">{discount}% off</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity */}
                      <div className="flex items-center bg-secondary border border-border rounded-xl overflow-hidden">
                        <button onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-white hover:bg-card transition">
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-white text-sm font-semibold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-white hover:bg-card transition">
                          <Plus size={14} />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-white font-bold">₹{item.sellingPrice * item.quantity}</span>
                        <button onClick={() => { removeFromCart(item._id); toast.success('Item remove ho gaya!'); }}
                          className="w-8 h-8 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-center hover:bg-red-500/20 hover:border-red-500 transition">
                          <Trash2 size={14} className="text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Coupon Section */}
            <div className="bg-card border border-border rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag size={18} className="text-gold" />
                  <span className="text-white font-semibold text-sm">Coupon Code</span>
                </div>
                {appliedCoupon ? (
                  <div className="flex items-center gap-2">
                    <span className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs px-3 py-1 rounded-full font-semibold">
                      {appliedCoupon.code} — {appliedCoupon.desc}
                    </span>
                    <button onClick={handleRemoveCoupon}
                      className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center hover:bg-red-500/30 transition">
                      <X size={12} className="text-red-400" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setShowCouponInput(!showCouponInput)}
                    className="text-gold text-sm font-semibold hover:underline flex items-center gap-1">
                    Apply <ChevronRight size={14} />
                  </button>
                )}
              </div>

              {showCouponInput && !appliedCoupon && (
                <div className="mt-3 flex gap-2">
                  <input
                    value={couponCode}
                    onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                    placeholder="Enter coupon code"
                    className="flex-1 bg-secondary border border-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold transition placeholder-gray-500"
                  />
                  <button onClick={handleApplyCoupon}
                    className="bg-gold text-black px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gold-light transition">
                    Apply
                  </button>
                </div>
              )}
              {couponError && <p className="text-red-400 text-xs mt-2">{couponError}</p>}

              {/* Available coupons hint */}
              {showCouponInput && !appliedCoupon && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.entries(COUPONS).map(([code, c]) => (
                    <button key={code} onClick={() => { setCouponCode(code); setCouponError(''); }}
                      className="text-xs bg-secondary border border-border px-3 py-1.5 rounded-full text-gray-300 hover:border-gold hover:text-gold transition">
                      {code} — {c.desc}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Price Summary ── */}
          <div className="lg:w-80 shrink-0">
            <div className="bg-card border border-border rounded-2xl p-5 sticky top-24">
              <h3 className="text-white font-bold text-base mb-4 pb-3 border-b border-border">
                Price Details
              </h3>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Price ({cartItems.length} items)</span>
                  <span className="text-white">₹{originalTotal}</span>
                </div>
                {productDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Product Discount</span>
                    <span className="text-green-400">− ₹{productDiscount}</span>
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Coupon ({appliedCoupon.code})</span>
                    <span className="text-green-400">− ₹{couponDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Delivery</span>
                  {deliveryCharge === 0 ? (
                    <span className="text-green-400 font-semibold">FREE</span>
                  ) : (
                    <span className="text-white">₹{deliveryCharge}</span>
                  )}
                </div>
              </div>

              <div className="border-t border-border pt-3 mb-4">
                <div className="flex justify-between font-bold">
                  <span className="text-white">Total Amount</span>
                  <span className="text-gold text-xl">₹{finalTotal}</span>
                </div>
              </div>

              {totalSavings > 0 && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2 mb-4 text-center">
                  <p className="text-green-400 text-sm font-semibold">
                    🎉 You are saving ₹{totalSavings} on this order!
                  </p>
                </div>
              )}

              <button
                onClick={() => navigate('/checkout', { state: { coupon: appliedCoupon, couponDiscount, finalTotal, subtotal } })}
                className="w-full bg-gold text-black py-3.5 rounded-xl font-bold hover:bg-gold-light transition flex items-center justify-center gap-2 text-base">
                Proceed to Checkout <ArrowRight size={18} />
              </button>

              <div className="mt-4 space-y-2">
                {[
                  { icon: Truck, text: subtotal >= 499 ? 'Free delivery applied!' : `Add ₹${499 - subtotal} more for free delivery` },
                  { icon: Shield, text: 'Cash on Delivery available' },
                  { icon: RotateCcw, text: '7-day easy returns' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                    <item.icon size={13} className="text-gold shrink-0" />
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bottom bar */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 bg-secondary border-t border-border px-4 py-3 z-40">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-gray-400 text-xs">Total Amount</p>
            <p className="text-gold font-bold text-xl">₹{finalTotal}</p>
          </div>
          {totalSavings > 0 && (
            <p className="text-green-400 text-xs font-semibold">Saving ₹{totalSavings}!</p>
          )}
        </div>
        <button
          onClick={() => navigate('/checkout', { state: { coupon: appliedCoupon, couponDiscount, finalTotal, subtotal } })}
          className="w-full bg-gold text-black py-3 rounded-xl font-bold flex items-center justify-center gap-2">
          Proceed to Checkout <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Cart;