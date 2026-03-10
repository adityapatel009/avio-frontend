import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Pages (abhi banayenge)
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminReviews from './pages/admin/AdminReviews';
import AdminCoupons from './pages/admin/Coupons';
import ResetPassword from './pages/ResetPassword';
import GoogleAuthSuccess from './pages/GoogleAuthSuccess';
import AdminCustomers from './pages/admin/AdminCustomers';
// Components
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import ProtectedRoute from './components/ProtectedRoute';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminFlashSale from './pages/admin/AdminFlashSale';
import AdminNotifications from './pages/admin/AdminNotifications';
import { useEffect } from 'react';
import { requestNotificationPermission } from './firebase';


function App() {
  useEffect(() => {
  // 3 second baad permission maango
  const timer = setTimeout(() => {
    if (Notification.permission === 'default') {
      requestNotificationPermission().then(token => {
        if (token) {
          fetch('http://localhost:5000/api/notifications/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
          });
        }
      });
    }
  }, 3000);
  return () => clearTimeout(timer);
}, []);

  return (
    <Router>
      <div className="min-h-screen bg-primary">
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#1E1E30',
              color: '#fff',
              border: '1px solid #C0A060',
            },
          }}
        />
        <Navbar />
        <main className="pb-16 md:pb-0">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={
              <ProtectedRoute><Checkout /></ProtectedRoute>
            } />
            <Route path="/admin/flashsale" element={<AdminFlashSale />} />
            <Route path="/orders" element={
              <ProtectedRoute><Orders /></ProtectedRoute>
            } />
            
<Route path="/admin/notifications" element={<AdminNotifications />} />
            <Route path="/profile" element={
              <ProtectedRoute><Profile /></ProtectedRoute>
            } />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
<Route path="/auth/google/success" element={<GoogleAuthSuccess />} />
            <Route path="/admin" element={
              <ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>
            } />
            <Route path="/admin/products" element={
              <ProtectedRoute adminOnly={true}><AdminProducts /></ProtectedRoute>
            } />
            <Route path="/admin/coupons" element={
              <ProtectedRoute adminOnly={true}><AdminCoupons /></ProtectedRoute>
            } />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/admin/orders" element={
              <ProtectedRoute adminOnly={true}><AdminOrders /></ProtectedRoute>
            } />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/customers" element={<ProtectedRoute adminOnly><AdminCustomers /></ProtectedRoute>} />
            <Route path="/admin/reviews" element={
              <ProtectedRoute adminOnly={true}><AdminReviews /></ProtectedRoute>
            } />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;
