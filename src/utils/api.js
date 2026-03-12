import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('crownbay_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Products ──────────────────────────────────────────────
export const getProducts = (params) => API.get('/products', { params });
export const getProduct = (id) => API.get(`/products/${id}`);
export const searchProducts = (q) => API.get(`/products/search?q=${q}`);
export const getFeatured = () => API.get('/products/featured');
export const getTrending = () => API.get('/products/trending');

// ── Reviews ───────────────────────────────────────────────
export const getReviews = (productId) => API.get(`/reviews/${productId}`);

// Image upload wala review (FormData)
export const addReview = (productId, formData) => API.post(`/reviews/${productId}`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

export const checkCanReview = (productId) => API.get(`/reviews/check/${productId}`);
export const getPendingReviews = (userId) => API.get(`/reviews/pending/${userId}`);
export const markHelpful = (reviewId) => API.put(`/reviews/${reviewId}/helpful`);
export const markNotHelpful = (reviewId) => API.put(`/reviews/${reviewId}/nothelpful`);

// Admin reviews
export const getAdminReviews = () => API.get('/reviews/admin/all');
export const updateAdminReview = (id, data) => API.put(`/reviews/admin/${id}`, data);
export const deleteAdminReview = (id) => API.delete(`/reviews/admin/${id}`);

// ── Auth ──────────────────────────────────────────────────
export const loginUser = (data) => API.post('/auth/login', data);
export const registerUser = (data) => API.post('/auth/register', data);
export const getMe = () => API.get('/auth/me');

// ── Orders ────────────────────────────────────────────────
export const placeOrder = (data) => API.post('/orders', data);
export const getMyOrders = () => API.get('/orders/mine');
export const trackOrder = (orderId) => API.get(`/orders/track/${orderId}`);
export const cancelOrder = (id) => API.put(`/orders/${id}/cancel`);

// Return request submit (FormData — images ke saath)
export const submitReturn = (orderId, formData) => API.post(`/orders/${orderId}/return`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

// ── Admin ─────────────────────────────────────────────────
export const adminGetOrders = (params) => API.get('/orders', { params });
export const adminUpdateOrder = (id, data) => API.put(`/orders/${id}/status`, data);
export const adminGetReturns = () => API.get('/orders/admin/returns');
export const adminResolveReturn = (orderId, data) => API.put(`/orders/${orderId}/return/resolve`, data);
export const adminAddProduct = (data) => API.post('/products', data);
export const adminUpdateProduct = (id, data) => API.put(`/products/${id}`, data);
export const adminDeleteProduct = (id) => API.delete(`/products/${id}`);

export default API;