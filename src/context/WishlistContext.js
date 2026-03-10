import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);

  // Jab user login/logout kare to uski specific wishlist load karo
  useEffect(() => {
    if (user) {
      const key = `crownbay_wishlist_${user._id || user.id || user.email}`;
      try {
        const saved = JSON.parse(localStorage.getItem(key) || '[]');
        setWishlist(saved);
      } catch {
        setWishlist([]);
      }
    } else {
      setWishlist([]); // logout hone par clear
    }
  }, [user]);

  // Wishlist state change hone par save karo
  const saveWishlist = (items) => {
    if (!user) return;
    const key = `crownbay_wishlist_${user._id || user.id || user.email}`;
    localStorage.setItem(key, JSON.stringify(items));
    setWishlist(items);
  };

  const addToWishlist = (product) => {
    const already = wishlist.find(p => p._id === product._id);
    if (already) return; // already hai
    const updated = [...wishlist, {
      _id: product._id,
      name: product.name,
      images: product.images,
      sellingPrice: product.sellingPrice,
      originalPrice: product.originalPrice,
      category: product.category,
      stock: product.stock,
    }];
    saveWishlist(updated);
  };

  const removeFromWishlist = (productId) => {
    const updated = wishlist.filter(p => p._id !== productId);
    saveWishlist(updated);
  };

  const toggleWishlist = (product) => {
    const isIn = wishlist.find(p => p._id === product._id);
    if (isIn) {
      removeFromWishlist(product._id);
      return false; // removed
    } else {
      addToWishlist(product);
      return true; // added
    }
  };

  const isWishlisted = (productId) => {
    return !!wishlist.find(p => p._id === productId);
  };

  return (
    <WishlistContext.Provider value={{
      wishlist,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      isWishlisted,
      wishlistCount: wishlist.length,
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used inside WishlistProvider');
  return context;
};