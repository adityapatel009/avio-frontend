import { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import API from '../../utils/api';

const LowStockWidget = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchLowStock(); }, []);

  const fetchLowStock = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/orders/admin/low-stock?threshold=5');
      setProducts(data.products);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  if (!loading && products.length === 0) return null;

  return (
    <div className="bg-card border border-red-500/20 rounded-2xl overflow-hidden mt-4">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h2 className="text-white font-bold flex items-center gap-2">
          <AlertTriangle size={18} className="text-red-400" />
          Low Stock Alert
          {products.length > 0 && (
            <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full border border-red-500/20">
              {products.length} products
            </span>
          )}
        </h2>
        <button onClick={fetchLowStock}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gold transition">
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="divide-y divide-border">
          {products.map(product => (
            <div key={product._id} className="flex items-center gap-3 px-5 py-3 hover:bg-secondary/50 transition">
              <img
                src={product.images?.[0]}
                alt={product.name}
                className="w-10 h-10 rounded-lg object-cover border border-border shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium line-clamp-1">{product.name}</p>
                <p className="text-gray-400 text-xs">{product.category} • ₹{product.sellingPrice}</p>
              </div>
              <div className={`text-right shrink-0 px-3 py-1 rounded-lg border ${
                product.stock === 0
                  ? 'bg-red-500/20 border-red-500/30 text-red-400'
                  : 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400'
              }`}>
                <p className="font-bold text-sm">{product.stock}</p>
                <p className="text-xs">{product.stock === 0 ? 'Out' : 'Left'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LowStockWidget;