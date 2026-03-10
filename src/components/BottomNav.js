import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingCart, Heart, User, Crown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

const BottomNav = () => {
  const location = useLocation();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { isAdmin } = useAuth();

  const tabs = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/products', icon: Search, label: 'Search' },
    { path: '/cart', icon: ShoppingCart, label: 'Cart', badge: cartCount },
    { path: '/wishlist', icon: Heart, label: 'Wishlist', badge: wishlistCount },
    { path: '/profile', icon: User, label: 'Account' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-secondary border-t border-border">
      <div className="flex">
        {tabs.map(({ path, icon: Icon, label, badge }) => {
          const isActive = location.pathname === path;
          return (
            <Link key={path} to={path}
              className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition ${
                isActive ? 'text-gold' : 'text-gray-400'
              }`}>
              <div className="relative">
                <Icon size={20} className={path === '/wishlist' && badge > 0 ? 'fill-red-500 text-red-500' : ''} />
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-gold text-black text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </div>
              <span className="text-xs">{label}</span>
            </Link>
          );
        })}

        {/* Admin button — sirf admin ko dikhega */}
        {isAdmin && (
          <Link to="/admin"
            className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition ${
              location.pathname.startsWith('/admin') ? 'text-gold' : 'text-gray-400'
            }`}>
            <div className="relative">
              <Crown size={20} className={location.pathname.startsWith('/admin') ? 'text-gold' : ''} />
            </div>
            <span className="text-xs">Admin</span>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default BottomNav;