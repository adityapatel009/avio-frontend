import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, Heart, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { searchProducts, getAutocompleteSuggestions } from '../utils/api';
import NotificationBell from './NotificationBell';

// ─── MEGA MENU DATA ───────────────────────────────────────
const megaMenuData = {
  Women: {
    sections: [
      { title: 'Clothing', items: ['Kurtas & Suits', 'Sarees', 'Lehengas', 'Jeans', 'Tops & T-Shirts', 'Dresses', 'Skirts', 'Lingerie'] },
      { title: 'Western Wear', items: ['Shirts', 'Trousers', 'Shorts', 'Co-ords', 'Jumpsuits', 'Blazers', 'Sweaters', 'Hoodies'] },
      { title: 'Ethnic Wear', items: ['Anarkali', 'Palazzo Sets', 'Dupattas', 'Blouses', 'Salwar Suits', 'Shrugs'] },
    ],
    featured: { label: 'New Arrivals', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300&q=80' }
  },
  Men: {
    sections: [
      { title: 'Clothing', items: ['Shirts', 'T-Shirts', 'Jeans', 'Trousers', 'Kurtas', 'Shorts', 'Track Pants', 'Sweatshirts'] },
      { title: 'Formal Wear', items: ['Formal Shirts', 'Formal Trousers', 'Blazers', 'Suits', 'Ties', 'Belts'] },
      { title: 'Ethnic Wear', items: ['Kurta Sets', 'Sherwanis', 'Nehru Jackets', 'Dhotis', 'Pathani Suits'] },
    ],
    featured: { label: 'Best Sellers', image: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=300&q=80' }
  },
  Electronics: {
    sections: [
      { title: 'Mobiles', items: ['Smartphones', 'Cases & Covers', 'Chargers', 'Power Banks', 'Screen Guards', 'Earphones'] },
      { title: 'Audio', items: ['Bluetooth Speakers', 'Headphones', 'Earbuds', 'Soundbars', 'Smart Watches'] },
      { title: 'Accessories', items: ['Cables', 'Adapters', 'USB Hubs', 'Webcams', 'Keyboards', 'Mouse'] },
    ],
    featured: { label: 'Top Deals', image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=300&q=80' }
  },
  'Home Decor': {
    sections: [
      { title: 'Living Room', items: ['Cushions', 'Curtains', 'Rugs', 'Wall Art', 'Lamps', 'Candles'] },
      { title: 'Bedroom', items: ['Bedsheets', 'Pillows', 'Blankets', 'Mattress Covers', 'Night Lamps'] },
      { title: 'Kitchen', items: ['Storage Boxes', 'Table Mats', 'Cookware', 'Utensils', 'Jars'] },
    ],
    featured: { label: 'Home Trends', image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=300&q=80' }
  },
  Beauty: {
    sections: [
      { title: 'Skincare', items: ['Moisturizers', 'Face Wash', 'Serums', 'Sunscreen', 'Face Masks', 'Toners'] },
      { title: 'Makeup', items: ['Lipstick', 'Foundation', 'Kajal', 'Mascara', 'Blush', 'Eyeshadow'] },
      { title: 'Haircare', items: ['Shampoo', 'Conditioner', 'Hair Oil', 'Hair Masks', 'Serums'] },
    ],
    featured: { label: 'Beauty Picks', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&q=80' }
  },
  Footwear: {
    sections: [
      { title: "Women's Footwear", items: ['Heels', 'Flats', 'Sandals', 'Sneakers', 'Boots', 'Wedges'] },
      { title: "Men's Footwear", items: ['Formal Shoes', 'Sneakers', 'Sandals', 'Loafers', 'Sports Shoes'] },
      { title: 'Kids Footwear', items: ['School Shoes', 'Sandals', 'Sneakers', 'Slippers'] },
    ],
    featured: { label: 'Trending Shoes', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80' }
  },
  'Jewellery & Accessories': {
    sections: [
      { title: 'Jewellery', items: ['Necklaces', 'Earrings', 'Bangles', 'Rings', 'Anklets', 'Bracelets'] },
      { title: 'Bags', items: ['Handbags', 'Clutches', 'Backpacks', 'Tote Bags', 'Wallets'] },
      { title: 'Accessories', items: ['Sunglasses', 'Watches', 'Scarves', 'Hair Accessories', 'Belts'] },
    ],
    featured: { label: 'New Jewellery', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&q=80' }
  },
  'Sports & Fitness': {
    sections: [
      { title: 'Clothing', items: ['Track Suits', 'Gym Wear', 'Yoga Pants', 'Sports Bras', 'Shorts'] },
      { title: 'Equipment', items: ['Dumbbells', 'Resistance Bands', 'Yoga Mats', 'Jump Rope', 'Bottles'] },
      { title: 'Footwear', items: ['Running Shoes', 'Training Shoes', 'Cricket Shoes', 'Football Boots'] },
    ],
    featured: { label: 'Sports Picks', image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=300&q=80' }
  },
};

const categories = ['All', 'Women', 'Men', 'Electronics', 'Home Decor', 'Beauty', 'Footwear', 'Jewellery & Accessories', 'Sports & Fitness'];

// ─── MEGA MENU COMPONENT ──────────────────────────────────
const MegaMenu = ({ category, onClose }) => {
  const data = megaMenuData[category];
  if (!data) return null;
  return (
    <div className="absolute top-full left-0 right-0 bg-secondary border-t-2 border-purple-500 shadow-2xl z-50"
      onMouseLeave={onClose}>
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-4 gap-6">
          {data.sections.map((section, i) => (
            <div key={i}>
              <h4 className="text-purple-400 font-semibold text-sm mb-3 uppercase tracking-wider">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.items.map(item => (
                  <li key={item}>
                    {/* ✅ subCategory filter use karo */}
                    <Link
                      to={`/products?category=${encodeURIComponent(category)}&subCategory=${encodeURIComponent(item)}`}
                      onClick={onClose}
                      className="text-gray-400 text-sm hover:text-white hover:translate-x-1 transition-all inline-block">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="relative rounded-xl overflow-hidden">
            <img src={data.featured.image} alt={data.featured.label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-3 left-3">
              <span className="bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {data.featured.label}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── AVIO LOGO ────────────────────────────────────────────
const AvioLogo = () => (
  <div className="flex flex-col items-start leading-none">
    <span
      style={{
        fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
        fontWeight: 800,
        fontSize: '22px',
        letterSpacing: '3px',
        color: '#ffffff',
        textTransform: 'uppercase',
      }}>
      AVIO
    </span>
    <div style={{
      height: '2px',
      width: '100%',
      background: 'linear-gradient(90deg, #6C3AE8, #C084FC)',
      borderRadius: '2px',
      marginTop: '2px',
    }} />
  </div>
);

// ─── NAVBAR ───────────────────────────────────────────────
const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const debounceRef = useRef(null);
  const megaMenuRef = useRef(null);

  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
   debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await getAutocompleteSuggestions(value);
        setSuggestions(data.suggestions.slice(0, 6));
        setShowSuggestions(true);
      } catch { setSuggestions([]); }
    }, 300);
  }, []);

  const handleSearch = useCallback((e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`);
      setSearchQuery(''); setSuggestions([]); setShowSuggestions(false);
    }
  }, [searchQuery, navigate]);

  const handleSuggestionClick = useCallback((product) => {
    navigate(`/product/${product._id}`);
    setSearchQuery(''); setSuggestions([]); setShowSuggestions(false);
  }, [navigate]);

  return (
    <header className="sticky top-0 z-50">

      {/* Announcement Bar */}
      {announcementVisible && (
        <div className="text-white text-xs font-semibold text-center py-1.5 px-4 flex items-center justify-center gap-2 relative"
          style={{ background: 'linear-gradient(90deg, #6C3AE8, #8B5CF6, #C084FC)' }}>
          <span>🚚 Free Delivery on orders above ₹499 &nbsp;|&nbsp; 💵 Cash on Delivery Available &nbsp;|&nbsp; ⭐ Premium Quality Guaranteed</span>
          <button onClick={() => setAnnouncementVisible(false)}
            className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Navbar */}
      <div className="bg-secondary border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">

            <Link to="/" className="shrink-0 group hover:opacity-80 transition">
              <AvioLogo />
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl relative hidden md:block">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="Search for products, brands and more..."
                    autoComplete="off"
                    className="w-full bg-card border border-border rounded-lg px-4 py-2.5 pr-12 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
                  />
                  <button type="submit"
                    className="absolute right-0 top-0 bottom-0 px-4 rounded-r-lg flex items-center justify-center hover:opacity-90 transition"
                    style={{ background: 'linear-gradient(135deg, #6C3AE8, #C084FC)' }}>
                    <Search size={16} className="text-white" />
                  </button>
                </div>
              </form>

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl overflow-hidden z-50 shadow-2xl">
                  {suggestions.map(product => (
                    <div key={product._id}
                      onMouseDown={() => handleSuggestionClick(product)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-secondary cursor-pointer transition border-b border-border last:border-0">
                      <img src={product.images[0]} alt={product.name}
                        className="w-10 h-10 object-cover rounded-lg" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm line-clamp-1">{product.name}</p>
                        <p className="text-purple-400 text-xs font-semibold">₹{product.sellingPrice}</p>
                      </div>
                      <span className="text-gray-500 text-xs shrink-0">{product.category}</span>
                    </div>
                  ))}
                  <div onMouseDown={handleSearch}
                    className="px-4 py-2.5 text-purple-400 text-sm text-center cursor-pointer hover:bg-secondary transition">
                    See all results →
                  </div>
                </div>
              )}
            </div>

            <NotificationBell />

            <div className="flex items-center gap-1 md:gap-3 ml-auto md:ml-0">
              <Link to="/wishlist" className="hidden md:flex flex-col items-center p-2 hover:text-purple-400 transition group">
                <Heart size={20} className="text-gray-300 group-hover:text-purple-400" />
                <span className="text-xs text-gray-400 group-hover:text-purple-400">Wishlist</span>
              </Link>

              <Link to="/cart" className="flex flex-col items-center p-2 hover:text-purple-400 transition group relative">
                <div className="relative">
                  <ShoppingCart size={20} className="text-gray-300 group-hover:text-purple-400" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold"
                      style={{ background: '#6C3AE8' }}>
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400 group-hover:text-purple-400 hidden md:block">Cart</span>
              </Link>

              <div className="hidden md:flex flex-col items-center p-2 hover:text-purple-400 transition group cursor-pointer"
                onClick={() => user ? navigate('/profile') : navigate('/login')}>
                <User size={20} className="text-gray-300 group-hover:text-purple-400" />
                <span className="text-xs text-gray-400 group-hover:text-purple-400">
                  {user ? user.name.split(' ')[0] : 'Login'}
                </span>
              </div>

              {isAdmin && (
                <Link to="/admin"
                  className="hidden md:flex text-white px-3 py-1.5 rounded-lg text-xs font-bold transition"
                  style={{ background: 'linear-gradient(135deg, #6C3AE8, #C084FC)' }}>
                  ⚡ Admin
                </Link>
              )}

              <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <X size={22} className="text-white" /> : <Menu size={22} className="text-white" />}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden mt-2">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search products..."
                  autoComplete="off"
                  className="w-full bg-card border border-border rounded-lg px-4 py-2 pr-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Search size={16} className="text-gray-400" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Category Bar — Desktop */}
      <div className="hidden md:block bg-primary border-b border-border relative" ref={megaMenuRef}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {categories.map(cat => (
              <div key={cat} className="relative shrink-0"
                onMouseEnter={() => cat !== 'All' && setActiveCategory(cat)}
                onMouseLeave={() => setActiveCategory(null)}>
                <Link
                  to={cat === 'All' ? '/products' : `/products?category=${encodeURIComponent(cat)}`}
                  className={`flex items-center gap-1 px-3 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                    activeCategory === cat
                      ? 'text-purple-400 border-purple-500'
                      : 'text-gray-300 border-transparent hover:text-white hover:border-purple-500/50'
                  }`}>
                  {cat}
                  {megaMenuData[cat] && <ChevronDown size={12} className={`transition-transform ${activeCategory === cat ? 'rotate-180' : ''}`} />}
                </Link>
              </div>
            ))}
          </div>
        </div>
        {activeCategory && megaMenuData[activeCategory] && (
          <div onMouseEnter={() => setActiveCategory(activeCategory)}
            onMouseLeave={() => setActiveCategory(null)}>
            <MegaMenu category={activeCategory} onClose={() => setActiveCategory(null)} />
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-secondary border-b border-border px-4 py-4">
          <div className="mb-4">
            <p className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-2">Categories</p>
            <div className="grid grid-cols-2 gap-2">
              {categories.filter(c => c !== 'All').map(cat => (
                <Link key={cat} to={`/products?category=${encodeURIComponent(cat)}`}
                  onClick={() => setMenuOpen(false)}
                  className="text-gray-300 text-sm py-1.5 px-3 bg-card rounded-lg hover:text-purple-400 hover:border-purple-500 border border-border transition">
                  {cat}
                </Link>
              ))}
            </div>
          </div>
          <div className="border-t border-border pt-3">
            {user ? (
              <div className="flex flex-col gap-2">
                {isAdmin && (
                  <Link to="/admin" onClick={() => setMenuOpen(false)}
                    className="text-purple-400 font-semibold py-2 flex items-center gap-2">
                    ⚡ Admin Panel
                  </Link>
                )}
                <Link to="/orders" onClick={() => setMenuOpen(false)} className="text-gray-300 py-2">My Orders</Link>
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="text-gray-300 py-2">Profile</Link>
                <button onClick={() => { logout(); setMenuOpen(false); }}
                  className="text-left text-red-400 py-2">Logout</button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Link to="/login" onClick={() => setMenuOpen(false)}
                  className="flex-1 text-center border border-border text-gray-300 py-2 rounded-lg">Login</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)}
                  className="flex-1 text-center text-white py-2 rounded-lg font-semibold"
                  style={{ background: 'linear-gradient(135deg, #6C3AE8, #C084FC)' }}>Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;