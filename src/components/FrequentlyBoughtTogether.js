import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Check, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const FrequentlyBoughtTogether = ({ product }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    if (!product) return;
    fetchSuggestions();
  }, [product?._id]);

  const fetchSuggestions = async () => {
    try {
      // Same category ke products fetch karo
      const res = await fetch(`${API_URL}/products?category=${encodeURIComponent(product.category)}&limit=10`);
      const data = await res.json();
      const filtered = (data.products || [])
        .filter(p => p._id !== product._id && p.stock > 0)
        .slice(0, 3);
      setSuggestions(filtered);
      setSelected(filtered.map(p => p._id)); // sabhi pre-selected
    } catch {}
    finally { setLoading(false); }
  };

  const toggleSelect = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleAddAll = () => {
    const toAdd = [product, ...suggestions.filter(p => selected.includes(p._id))];
    toAdd.forEach(p => addToCart(p));
    toast.success(`${toAdd.length} items cart mein add ho gaye! 🛒`);
  };

  if (loading || suggestions.length === 0) return null;

  const selectedProducts = [product, ...suggestions.filter(p => selected.includes(p._id))];
  const totalPrice = selectedProducts.reduce((sum, p) => sum + p.sellingPrice, 0);
  const totalOriginal = selectedProducts.reduce((sum, p) => sum + (p.originalPrice || p.sellingPrice), 0);
  const totalSavings = totalOriginal - totalPrice;

  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <ShoppingCart size={20} className="text-gold" /> Frequently Bought Together
      </h2>

      {/* Products Row */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-3 overflow-x-auto pb-3 mb-4 scrollbar-hide">
          {/* Main product */}
          <div className="flex flex-col items-center shrink-0">
            <div className="relative">
              <img src={product.images?.[0]} alt={product.name}
                className="w-24 h-24 object-cover rounded-xl border-2 border-gold shadow-lg shadow-gold/20" />
              <div className="absolute -top-2 -left-2 bg-gold text-black text-[9px] font-black px-1.5 py-0.5 rounded-full">
                This
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gold rounded-full flex items-center justify-center">
                <Check size={10} className="text-black" />
              </div>
            </div>
            <p className="text-white text-xs font-semibold mt-2 w-24 text-center line-clamp-2">{product.name}</p>
            <p className="text-gold text-xs font-bold">₹{product.sellingPrice}</p>
          </div>

          {suggestions.map((p, i) => {
            const isSelected = selected.includes(p._id);
            return (
              <div key={p._id} className="flex items-center gap-3 shrink-0">
                {/* Plus sign */}
                <div className="w-6 h-6 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0">
                  <Plus size={12} className="text-gray-400" />
                </div>

                {/* Product */}
                <div className="flex flex-col items-center cursor-pointer" onClick={() => toggleSelect(p._id)}>
                  <div className="relative">
                    <img src={p.images?.[0]} alt={p.name}
                      className={`w-24 h-24 object-cover rounded-xl border-2 transition-all duration-200 ${
                        isSelected ? 'border-gold shadow-lg shadow-gold/20 opacity-100' : 'border-border opacity-50 grayscale'
                      }`} />
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                      isSelected ? 'bg-gold' : 'bg-secondary border border-border'
                    }`}>
                      {isSelected
                        ? <Check size={10} className="text-black" />
                        : <Plus size={10} className="text-gray-400" />}
                    </div>
                  </div>
                  <p className="text-white text-xs font-semibold mt-2 w-24 text-center line-clamp-2">{p.name}</p>
                  <p className="text-gold text-xs font-bold">₹{p.sellingPrice}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total + Add Button */}
        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-gray-400 text-xs mb-0.5">
                {selectedProducts.length} item{selectedProducts.length > 1 ? 's' : ''} selected
              </p>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-lg">₹{totalPrice}</span>
                {totalSavings > 0 && (
                  <>
                    <span className="text-gray-500 text-sm line-through">₹{totalOriginal}</span>
                    <span className="text-green-400 text-xs font-bold">Save ₹{totalSavings}!</span>
                  </>
                )}
              </div>
            </div>
            <button onClick={handleAddAll}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition active:scale-95"
              style={{ background: 'linear-gradient(135deg,#6C3AE8,#C084FC)' }}>
              <ShoppingCart size={15} /> Add All to Cart
            </button>
          </div>

          {/* Individual links */}
          <div className="flex flex-wrap gap-2">
            {suggestions.map(p => (
              <Link key={p._id} to={`/product/${p._id}`}
                className="text-gray-500 text-xs hover:text-purple-400 transition underline">
                {p.name.slice(0, 20)}...
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FrequentlyBoughtTogether;