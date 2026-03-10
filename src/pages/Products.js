import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search, SlidersHorizontal, Star, ShoppingCart, X,
  ChevronDown, ChevronUp, Flame, Sparkles, Tag, Grid2X2, List
} from 'lucide-react';
import { getProducts, searchProducts } from '../utils/api';
import { useCart } from '../context/CartContext';
import WishlistButton from '../components/WishlistButton';
import toast from 'react-hot-toast';

// ─── SUBCATEGORY DATA ─────────────────────────────────────
const subcategoryData = {
  Women: ['Kurtas & Suits','Sarees','Lehengas','Jeans','Tops & T-Shirts','Dresses','Party Dresses','Skirts','Jackets','Lingerie','Sunglasses','Western Wear','Ethnic Wear','Co-ords','Jumpsuits'],
  Men: ['Shirts','T-Shirts','Jeans','Trousers','Kurtas','Shorts','Innerwear','Rain Jackets','Sunglasses','Beard Oil','Formal Wear','Ethnic Wear','Track Pants','Sweatshirts'],
  Electronics: ['Smartphones','Earphones','Bluetooth Speakers','Smartwatches','Accessories','Cables','Power Banks'],
  'Home Decor': ['Living Room','Bedroom','Kitchen','Cushions','Curtains','Wall Art','Lamps','Storage'],
  Beauty: ['Skincare','Makeup','Haircare','Face Wash','Moisturizers','Lipstick','Eyeliner','Trimmers','Hair Dryer','Sunscreen','Face Masks','Perfumes'],
  Footwear: ["Women's Footwear","Men's Footwear",'Kids Footwear','Sneakers','Heels','Sandals','Formal Shoes','Sports Shoes'],
  'Jewellery & Accessories': ['Necklaces','Earrings','Bangles','Handbags','Sunglasses','Watches','Rings','Bracelets'],
  'Sports & Fitness': ['Gym Wear','Yoga','Running','Cricket','Football','Equipment','Sports Shoes','Protein & Nutrition'],
};

const allCategories = ['Women','Men','Electronics','Home Decor','Beauty','Footwear','Jewellery & Accessories','Sports & Fitness'];

// ─── SKELETON LOADER ─────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
    <div className="w-full h-52 bg-secondary" />
    <div className="p-3 space-y-2">
      <div className="h-3 bg-secondary rounded w-1/3" />
      <div className="h-4 bg-secondary rounded w-full" />
      <div className="h-4 bg-secondary rounded w-2/3" />
      <div className="h-8 bg-secondary rounded-xl w-full mt-3" />
    </div>
  </div>
);

// ─── PRODUCT CARD ─────────────────────────────────────────
const ProductCard = ({ product, view = 'grid' }) => {
  const { addToCart } = useCart();
  const discount = product.originalPrice > product.sellingPrice
    ? Math.round(((product.originalPrice - product.sellingPrice) / product.originalPrice) * 100) : 0;
  const outOfStock = product.stock === 0;

  // ── LIST VIEW ──
  if (view === 'list') {
    return (
      <div className="bg-card border border-border rounded-2xl overflow-hidden flex gap-4 p-3 hover:border-gold/50 transition group">
        <Link to={`/product/${product._id}`} className="relative shrink-0">
          <img src={product.images[0]} alt={product.name}
            className="w-28 h-28 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300" />
          {discount > 0 && (
            <span className="absolute top-1 left-1 bg-gold text-black text-xs font-bold px-1.5 py-0.5 rounded-full">{discount}%</span>
          )}
        </Link>
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <p className="text-gray-400 text-xs mb-0.5">{product.category}</p>
            <Link to={`/product/${product._id}`}>
              <p className="text-white text-sm font-medium line-clamp-2 hover:text-gold transition">{product.name}</p>
            </Link>
            {product.averageRating > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <div className="flex items-center gap-1 bg-green-600 px-1.5 py-0.5 rounded text-white text-xs">
                  <Star size={10} className="fill-white" />{product.averageRating.toFixed(1)}
                </div>
                <span className="text-gray-500 text-xs">({product.totalReviews})</span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <span className="text-gold font-bold text-base">₹{product.sellingPrice}</span>
              {product.originalPrice > product.sellingPrice && (
                <span className="text-gray-500 text-xs line-through">₹{product.originalPrice}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <WishlistButton product={product}
                className="w-8 h-8 bg-secondary border border-border rounded-xl hover:border-red-400"
                size={14} />
              <button onClick={() => { addToCart(product); toast.success('Cart mein add ho gaya! 🛒'); }}
                disabled={outOfStock}
                className="flex items-center gap-1 bg-gold text-black px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-gold-light transition disabled:opacity-40">
                <ShoppingCart size={12} /> {outOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── GRID VIEW ──
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden group relative hover:border-gold/50 transition-all duration-300 hover:shadow-lg hover:shadow-gold/5">
      <Link to={`/product/${product._id}`}>
        <div className="relative overflow-hidden">
          <img src={product.images[0]} alt={product.name}
            className={`w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500 ${outOfStock ? 'opacity-60' : ''}`} />
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount > 0 && (
              <span className="bg-gold text-black text-xs font-bold px-2 py-0.5 rounded-full">{discount}% OFF</span>
            )}
            {product.isNewArrival && (
              <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">NEW</span>
            )}
            {product.isTrending && (
              <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Flame size={9} /> Hot
              </span>
            )}
          </div>
          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-black/70 text-white text-xs font-bold px-3 py-1.5 rounded-full">Out of Stock</span>
            </div>
          )}
          {/* Quick add overlay on hover */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-3">
            <button onClick={(e) => {
                e.preventDefault();
                if (!outOfStock) { addToCart(product); toast.success('Cart mein add ho gaya! 🛒'); }
              }}
              disabled={outOfStock}
              className="w-full bg-gold text-black py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-gold-light transition disabled:opacity-40">
              <ShoppingCart size={13} /> Quick Add
            </button>
          </div>
        </div>

        <div className="p-3">
          <p className="text-gray-400 text-xs mb-0.5">{product.category}</p>
          <p className="text-white text-sm font-medium line-clamp-2">{product.name}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-gold font-bold">₹{product.sellingPrice}</span>
            {product.originalPrice > product.sellingPrice && (
              <span className="text-gray-500 text-xs line-through">₹{product.originalPrice}</span>
            )}
          </div>
          {product.averageRating > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <div className="flex items-center gap-1 bg-green-600 px-1.5 py-0.5 rounded text-white text-xs">
                <Star size={10} className="fill-white" />{product.averageRating.toFixed(1)}
              </div>
              <span className="text-gray-500 text-xs">({product.totalReviews})</span>
            </div>
          )}
        </div>
      </Link>

      {/* Wishlist — fixed top right */}
      <WishlistButton product={product}
        className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full backdrop-blur-sm"
        size={14} />

      {/* Add to Cart button */}
      <div className="px-3 pb-3">
        <button onClick={() => { addToCart(product); toast.success('Cart mein add ho gaya! 🛒'); }}
          disabled={outOfStock}
          className="w-full bg-gold/10 border border-gold/30 text-gold py-2 rounded-xl text-xs font-semibold hover:bg-gold hover:text-black transition flex items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed">
          <ShoppingCart size={13} /> Add to Cart
        </button>
      </div>
    </div>
  );
};

// ─── MAIN PRODUCTS PAGE ───────────────────────────────────
const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [page, setPage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [showSubcategories, setShowSubcategories] = useState(true);
  const [view, setView] = useState('grid');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';
  const subcategories = category ? subcategoryData[category] || [] : [];

  useEffect(() => { fetchProducts(); }, [search, category, sort, page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let res;
      if (search) {
        res = await searchProducts(search);
        setProducts(res.data.products);
        setTotalPages(1);
        setTotalProducts(res.data.products.length);
      } else {
        res = await getProducts({ category, sort, page, limit: 12 });
        setProducts(res.data.products);
        setTotalPages(res.data.totalPages);
        setTotalProducts(res.data.totalProducts || res.data.products.length);
      }
    } catch {
      toast.error('Products load nahi hue!');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (value) => {
    setSearchParams(prev => { prev.set('sort', value); return prev; });
    setPage(1);
  };

  const handleCategory = (value) => {
    setSearchParams(prev => {
      if (value) prev.set('category', value);
      else prev.delete('category');
      prev.delete('search');
      return prev;
    });
    setPage(1);
  };

  const sortOptions = [
    { value: '', label: 'Relevance', icon: '🎯' },
    { value: 'newest', label: 'Newest First', icon: '✨' },
    { value: 'popular', label: 'Most Popular', icon: '🔥' },
    { value: 'price_low', label: 'Price: Low to High', icon: '💰' },
    { value: 'price_high', label: 'Price: High to Low', icon: '💎' },
    { value: 'rating', label: 'Top Rated', icon: '⭐' },
  ];

  return (
    <div className="min-h-screen bg-primary">

      {/* ── Sticky Header ── */}
      <div className="bg-secondary border-b border-border px-4 py-3 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-500 text-xs mb-1">
            Home
            {category && <><span className="mx-1">›</span><span className="text-gold">{category}</span></>}
            {search && <><span className="mx-1">›</span><span className="text-gold">"{search}"</span></>}
          </p>
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-lg font-bold text-white truncate">
              {search ? `"${search}"` : category || 'All Products'}
              {!loading && (
                <span className="text-gray-500 text-sm font-normal ml-2">({totalProducts})</span>
              )}
            </h1>
            <div className="flex items-center gap-2 shrink-0">
              {/* Grid / List toggle — desktop only */}
              <div className="hidden md:flex items-center bg-card border border-border rounded-xl overflow-hidden">
                <button onClick={() => setView('grid')}
                  className={`p-2 transition ${view === 'grid' ? 'bg-gold text-black' : 'text-gray-400 hover:text-white'}`}>
                  <Grid2X2 size={15} />
                </button>
                <button onClick={() => setView('list')}
                  className={`p-2 transition ${view === 'list' ? 'bg-gold text-black' : 'text-gray-400 hover:text-white'}`}>
                  <List size={15} />
                </button>
              </div>
              <button onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 text-sm px-3 py-2 rounded-xl border transition ${
                  showFilters ? 'bg-gold text-black border-gold' : 'border-border text-gray-300 hover:border-gold'
                }`}>
                <SlidersHorizontal size={14} />
                <span className="hidden sm:inline">Filters & Sort</span>
                {sort && <span className="w-2 h-2 bg-gold rounded-full" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">

        {/* ── Category Pills ── */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          <button onClick={() => handleCategory('')}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition ${
              !category ? 'bg-gold text-black' : 'border border-border text-gray-300 hover:border-gold'
            }`}>All</button>
          {allCategories.map(cat => (
            <button key={cat} onClick={() => handleCategory(cat)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition ${
                category === cat ? 'bg-gold text-black' : 'border border-border text-gray-300 hover:border-gold'
              }`}>{cat}</button>
          ))}
        </div>

        {/* ── Subcategories ── */}
        {subcategories.length > 0 && (
          <div className="mb-5 bg-secondary border border-border rounded-2xl p-4">
            <button onClick={() => setShowSubcategories(!showSubcategories)}
              className="flex items-center gap-2 w-full">
              <Sparkles size={14} className="text-gold" />
              <span className="text-gold font-semibold text-sm uppercase tracking-wider">{category}</span>
              <div className="h-px flex-1 bg-border" />
              {showSubcategories
                ? <ChevronUp size={14} className="text-gold" />
                : <ChevronDown size={14} className="text-gold" />}
            </button>
            {showSubcategories && (
              <div className="flex flex-wrap gap-2 mt-3">
                {subcategories.map(sub => (
                  <button key={sub}
                    onClick={() => { setSearchParams(prev => { prev.set('search', sub); return prev; }); setPage(1); }}
                    className="px-3 py-1.5 bg-card border border-border rounded-full text-xs text-gray-300 hover:border-gold hover:text-gold hover:bg-gold/10 transition-all">
                    {sub}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Filter Panel ── */}
        {showFilters && (
          <div className="bg-card border border-gold/30 rounded-2xl p-5 mb-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-white font-bold flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-gold" /> Sort & Filter
              </p>
              <button onClick={() => setShowFilters(false)}
                className="w-7 h-7 bg-secondary rounded-lg flex items-center justify-center hover:bg-border transition">
                <X size={14} className="text-gray-400" />
              </button>
            </div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Sort By</p>
            <div className="flex flex-wrap gap-2 mb-5">
              {sortOptions.map(opt => (
                <button key={opt.value} onClick={() => { handleSort(opt.value); setShowFilters(false); }}
                  className={`px-3 py-2 rounded-xl text-sm transition flex items-center gap-1.5 ${
                    sort === opt.value ? 'bg-gold text-black font-bold' : 'border border-border text-gray-300 hover:border-gold'
                  }`}>
                  <span>{opt.icon}</span> {opt.label}
                </button>
              ))}
            </div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Price Range</p>
            <div className="flex items-center gap-3">
              <input value={priceRange.min} onChange={e => setPriceRange(p => ({ ...p, min: e.target.value }))}
                placeholder="Min ₹"
                className="flex-1 bg-secondary border border-border rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-gold transition" />
              <span className="text-gray-500">—</span>
              <input value={priceRange.max} onChange={e => setPriceRange(p => ({ ...p, max: e.target.value }))}
                placeholder="Max ₹"
                className="flex-1 bg-secondary border border-border rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-gold transition" />
              <button onClick={() => setShowFilters(false)}
                className="bg-gold text-black px-4 py-2 rounded-xl text-sm font-bold hover:bg-gold-light transition">
                Apply
              </button>
            </div>
          </div>
        )}

        {/* ── Active Filters ── */}
        {(category || sort || search) && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-gray-500 text-xs">Active:</span>
            {category && (
              <span className="flex items-center gap-1 bg-gold/10 text-gold text-xs px-3 py-1 rounded-full border border-gold/30">
                <Tag size={10} /> {category}
                <button onClick={() => handleCategory('')}><X size={10} /></button>
              </span>
            )}
            {sort && (
              <span className="flex items-center gap-1 bg-gold/10 text-gold text-xs px-3 py-1 rounded-full border border-gold/30">
                {sortOptions.find(o => o.value === sort)?.label}
                <button onClick={() => handleSort('')}><X size={10} /></button>
              </span>
            )}
            {search && (
              <span className="flex items-center gap-1 bg-gold/10 text-gold text-xs px-3 py-1 rounded-full border border-gold/30">
                🔍 "{search}"
                <button onClick={() => setSearchParams(new URLSearchParams())}><X size={10} /></button>
              </span>
            )}
            <button onClick={() => { setSearchParams(new URLSearchParams()); setPage(1); }}
              className="text-gray-500 text-xs hover:text-red-400 transition underline">
              Clear all
            </button>
          </div>
        )}

        {/* ── Grid / List ── */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={36} className="text-gray-600" />
            </div>
            <p className="text-white font-bold text-xl mb-2">Koi product nahi mila!</p>
            <p className="text-gray-400 text-sm mb-6">Alag keywords try karo ya category change karo</p>
            <button onClick={() => { setSearchParams(new URLSearchParams()); setPage(1); }}
              className="bg-gold text-black px-8 py-3 rounded-xl font-bold hover:bg-gold-light transition">
              Browse All Products
            </button>
          </div>
        ) : (
          <>
            <div className={view === 'list' ? 'space-y-3' : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'}>
              {products.map(product => (
                <ProductCard key={product._id} product={product} view={view} />
              ))}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <button onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo(0, 0); }}
                  disabled={page === 1}
                  className="px-5 py-2.5 border border-border rounded-xl text-sm text-gray-300 disabled:opacity-30 hover:border-gold transition">
                  ← Prev
                </button>
                <div className="flex gap-1.5">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .reduce((acc, p, i, arr) => {
                      if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) => p === '...'
                      ? <span key={`dot-${i}`} className="w-9 h-9 flex items-center justify-center text-gray-500">…</span>
                      : <button key={p} onClick={() => { setPage(p); window.scrollTo(0, 0); }}
                          className={`w-9 h-9 rounded-xl text-sm font-semibold transition ${page === p ? 'bg-gold text-black' : 'border border-border text-gray-300 hover:border-gold'}`}>
                          {p}
                        </button>
                    )
                  }
                </div>
                <button onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo(0, 0); }}
                  disabled={page === totalPages}
                  className="px-5 py-2.5 border border-border rounded-xl text-sm text-gray-300 disabled:opacity-30 hover:border-gold transition">
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Products;