// CartContext.js mein ye changes karo
// saveCartToBackend function add karo
// useEffect mein cart change hone pe save karo

// ─── SIRF YE PART REPLACE KARO — CartContext.js ka poora content ───

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('avio_cart') || '[]'); } catch { return []; }
  });
  const { user } = useAuth();
  const saveTimerRef = useRef(null);

  // Cart localStorage mein save karo
  useEffect(() => {
    localStorage.setItem('avio_cart', JSON.stringify(cart));

    // Logged in user ka cart backend mein save karo (debounced — 3 sec baad)
    if (user && user.role !== 'admin') {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        saveCartToBackend(cart);
      }, 3000);
    }

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [cart, user]);

  // Backend mein cart save karo
  const saveCartToBackend = async (cartItems) => {
    try {
      const token = localStorage.getItem('crownbay_token');
      if (!token) return;

      const items = cartItems.map(item => ({
        productId: item._id,
        name: item.name,
        image: item.images?.[0] || '',
        price: item.sellingPrice,
        quantity: item.quantity || 1,
        selectedSize: item.selectedSize || '',
      }));

      const total = cartItems.reduce((sum, item) => sum + (item.sellingPrice * (item.quantity || 1)), 0);

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      await fetch(`${apiUrl}/cart/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items, total }),
      });
    } catch (err) {
      // Silent fail — cart saving optional hai
      console.log('Cart save error:', err.message);
    }
  };

  // Cart recovered mark karo (order place hone ke baad call karo)
  const markCartRecovered = async () => {
    try {
      const token = localStorage.getItem('crownbay_token');
      if (!token) return;
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      await fetch(`${apiUrl}/cart/recovered`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
  };

  const addToCart = (product) => {
    setCart(prev => {
      const key = product.selectedSize
        ? `${product._id}_${product.selectedSize}`
        : product._id;

      const existing = prev.find(item => {
        const itemKey = item.selectedSize
          ? `${item._id}_${item.selectedSize}`
          : item._id;
        return itemKey === key;
      });

      if (existing) {
        return prev.map(item => {
          const itemKey = item.selectedSize
            ? `${item._id}_${item.selectedSize}`
            : item._id;
          return itemKey === key
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item;
        });
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId, selectedSize = null) => {
    setCart(prev => prev.filter(item => {
      if (selectedSize) return !(item._id === productId && item.selectedSize === selectedSize);
      return item._id !== productId;
    }));
  };

  const updateQuantity = (productId, qty, selectedSize = null) => {
    if (qty <= 0) { removeFromCart(productId, selectedSize); return; }
    setCart(prev => prev.map(item => {
      if (selectedSize) {
        return (item._id === productId && item.selectedSize === selectedSize)
          ? { ...item, quantity: qty } : item;
      }
      return item._id === productId ? { ...item, quantity: qty } : item;
    }));
  };

  const clearCart = () => {
    setCart([]);
    // Backend mein bhi clear karo
    if (user) saveCartToBackend([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.sellingPrice * (item.quantity || 1)), 0);

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, clearCart,
      cartCount, cartTotal, markCartRecovered,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);