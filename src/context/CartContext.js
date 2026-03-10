import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);

  // User-specific cart key — har user ka alag cart
  const getCartKey = (u) => u ? `crownbay_cart_${u._id || u.email}` : null;

  // Jab user login/logout ho — uska cart load karo
  useEffect(() => {
    if (user) {
      const key = getCartKey(user);
      const saved = localStorage.getItem(key);
      setCart(saved ? JSON.parse(saved) : []);
    } else {
      // Logout hone par cart clear karo memory se
      setCart([]);
    }
  }, [user]);

  // Cart change hone par save karo — sirf logged in user ka
  useEffect(() => {
    if (user) {
      const key = getCartKey(user);
      localStorage.setItem(key, JSON.stringify(cart));
    }
  }, [cart, user]);

  const addToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item._id === product._id);
      if (existing) {
        return prev.map(item =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item._id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) return removeFromCart(productId);
    setCart(prev =>
      prev.map(item =>
        item._id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.sellingPrice * item.quantity, 0
  );

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};