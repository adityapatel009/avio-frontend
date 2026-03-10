import { Heart, ShoppingCart, Trash2, ArrowRight, Tag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Wishlist = () => {
  const { addToCart } = useCart();
  const { wishlist, removeFromWishlist } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Login nahi hai
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <Heart size={44} className="text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Login Karo</h2>
        <p className="text-gray-400 mb-6">Wishlist dekhne ke liye pehle login karna hoga!</p>
        <div className="flex flex-col gap-3">
          <button onClick={() => navigate('/login')}
            className="bg-gold text-black px-8 py-3 rounded-xl font-bold hover:bg-gold-light transition">
            Login Karo
          </button>
          <Link to="/products" className="text-gray-400 text-sm hover:text-gold transition">
            Pehle products dekho →
          </Link>
        </div>
      </div>
    );
  }

  // Wishlist empty hai
  if (wishlist.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <Heart size={44} className="text-red-400 opacity-40" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Wishlist Khali Hai</h2>
        <p className="text-gray-400 mb-2">Koi bhi product pasand aaye to dil ❤️ ka button dabaao!</p>
        <p className="text-gray-500 text-sm mb-8">Woh product yahan save ho jaayega</p>
        <Link to="/products"
          className="bg-gold text-black px-8 py-3 rounded-xl font-bold hover:bg-gold-light transition inline-flex items-center gap-2">
          <ShoppingCart size={18} /> Shopping Shuru Karo
        </Link>
      </div>
    );
  }

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success(`${product.name} cart mein add ho gaya! 🛒`);
  };

  const handleRemove = (productId, productName) => {
    removeFromWishlist(productId);
    toast.success(`${productName} wishlist se hata diya`);
  };

  const handleMoveToCart = (product) => {
    addToCart(product);
    removeFromWishlist(product._id);
    toast.success('Cart mein move kar diya! 🛒');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Heart size={24} className="text-red-400 fill-red-400" /> My Wishlist
          </h1>
          <p className="text-gray-400 text-sm mt-1">{wishlist.length} item{wishlist.length !== 1 ? 's' : ''} saved</p>
        </div>
        <Link to="/products"
          className="flex items-center gap-1.5 text-gold text-sm hover:underline">
          Continue Shopping <ArrowRight size={14} />
        </Link>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {wishlist.map(product => {
          const discount = product.originalPrice > product.sellingPrice
            ? Math.round(((product.originalPrice - product.sellingPrice) / product.originalPrice) * 100)
            : 0;
          const outOfStock = product.stock === 0;

          return (
            <div key={product._id}
              className="bg-card border border-border rounded-2xl overflow-hidden group hover:border-gold/50 transition-all duration-200">

              {/* Image */}
              <div className="relative">
                <Link to={`/product/${product._id}`}>
                  <img
                    src={product.images?.[0]}
                    alt={product.name}
                    className={`w-full h-52 object-cover transition-transform duration-300 group-hover:scale-105 ${outOfStock ? 'opacity-50' : ''}`}
                  />
                </Link>

                {/* Discount badge */}
                {discount > 0 && (
                  <span className="absolute top-2 left-2 bg-gold text-black text-xs font-bold px-2 py-0.5 rounded-full">
                    {discount}% OFF
                  </span>
                )}

                {/* Out of stock overlay */}
                {outOfStock && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-black/70 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                      Out of Stock
                    </span>
                  </div>
                )}

                {/* Remove button */}
                <button
                  onClick={() => handleRemove(product._id, product.name)}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-500/80">
                  <Trash2 size={13} className="text-white" />
                </button>
              </div>

              {/* Info */}
              <div className="p-3">
                <Link to={`/product/${product._id}`}>
                  <p className="text-white text-sm font-medium line-clamp-2 mb-2 hover:text-gold transition">
                    {product.name}
                  </p>
                </Link>

                {/* Price */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-gold font-bold">₹{product.sellingPrice}</span>
                  {product.originalPrice > product.sellingPrice && (
                    <span className="text-gray-500 text-xs line-through">₹{product.originalPrice}</span>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleMoveToCart(product)}
                    disabled={outOfStock}
                    className="w-full flex items-center justify-center gap-1.5 bg-gold text-black py-2 rounded-xl text-xs font-bold hover:bg-gold-light transition disabled:opacity-40 disabled:cursor-not-allowed">
                    <ShoppingCart size={13} /> Move to Cart
                  </button>
                  <button
                    onClick={() => handleRemove(product._id, product.name)}
                    className="w-full flex items-center justify-center gap-1.5 border border-border text-gray-400 py-1.5 rounded-xl text-xs hover:border-red-400 hover:text-red-400 transition">
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom summary */}
      {wishlist.length > 0 && (
        <div className="mt-8 bg-secondary border border-border rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white font-semibold">{wishlist.length} items wishlist mein</p>
            <p className="text-gray-400 text-sm">In-stock items cart mein add kar sakte ho</p>
          </div>
          <button
            onClick={() => {
              const inStock = wishlist.filter(p => p.stock !== 0);
              if (inStock.length === 0) return toast.error('Koi bhi product stock mein nahi hai!');
              inStock.forEach(p => addToCart(p));
              inStock.forEach(p => removeFromWishlist(p._id));
              toast.success(`${inStock.length} items cart mein add ho gaye! 🛒`);
            }}
            className="flex items-center gap-2 bg-gold text-black px-6 py-3 rounded-xl font-bold hover:bg-gold-light transition whitespace-nowrap">
            <ShoppingCart size={16} /> Add All to Cart
          </button>
        </div>
      )}
    </div>
  );
};

export default Wishlist;