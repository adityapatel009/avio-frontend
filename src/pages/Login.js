import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Crown, Eye, EyeOff, Phone, Mail, Shield, Truck, Star, ArrowRight, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

// ─── FORGOT PASSWORD MODAL ────────────────────────────────
const ForgotPasswordModal = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Email daalo!');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      toast.success(res.data.message);
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Kuch galat ho gaya!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-bold text-lg">Forgot Password?</h3>
          <button onClick={onClose}
            className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center hover:bg-border transition">
            <X size={16} className="text-gray-400" />
          </button>
        </div>

        {sent ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
              <span className="text-3xl">📧</span>
            </div>
            <h4 className="text-white font-bold mb-2">Email Bhej Di!</h4>
            <p className="text-gray-400 text-sm mb-1">
              Reset link bhej di gayi hai:
            </p>
            <p className="text-gold text-sm font-medium mb-4">{email}</p>
            <p className="text-gray-500 text-xs mb-5">
              Email nahi mili? Spam folder check karo. Link 1 hour mein expire ho jaayega.
            </p>
            <button onClick={onClose}
              className="w-full bg-gold text-black py-3 rounded-xl font-bold hover:bg-gold-light transition">
              Done
            </button>
          </div>
        ) : (
          <>
            <p className="text-gray-400 text-sm mb-5">
              Apni registered email daalo — hum aapko password reset link bhejenge.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" required
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gold transition text-sm" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-gold text-black py-3 rounded-xl font-bold hover:bg-gold-light transition disabled:opacity-50 flex items-center justify-center gap-2">
                {loading
                  ? <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Sending...</>
                  : <>Send Reset Link <ArrowRight size={15} /></>}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

// ─── MAIN LOGIN PAGE ──────────────────────────────────────
const Login = () => {
  const [activeTab, setActiveTab] = useState('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const loginEmail = activeTab === 'phone' ? `${phone}@phone.com` : email;
      const data = await login(loginEmail, password);
      toast.success(`Welcome back, ${data.user.name}! 👑`);
      if (data.user.role === 'admin') navigate('/admin');
      else navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed! Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  const trustBadges = [
    { icon: Shield, text: '100% Secure Payments' },
    { icon: Truck, text: 'Free Delivery Above ₹499' },
    { icon: Star, text: '10,000+ Happy Customers' },
  ];

  const features = [
    'Exclusive member-only deals & offers',
    'Track your orders in real-time',
    'Easy returns within 7 days',
    'Early access to new arrivals',
  ];

  return (
    <>
      <div className="min-h-screen flex">

        {/* ── LEFT PANEL ── */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#0D0D1A] via-[#12121E] to-[#1a1a2e] flex-col justify-between p-12 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
            <div className="absolute top-1/2 -right-20 w-64 h-64 bg-gold/8 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 left-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
            <div className="absolute inset-0 opacity-[0.03]"
              style={{ backgroundImage: 'linear-gradient(#C0A060 1px, transparent 1px), linear-gradient(90deg, #C0A060 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          </div>

          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gold/20 rounded-xl flex items-center justify-center border border-gold/30">
                <Crown size={22} className="text-gold" />
              </div>
              <span className="text-2xl font-bold gold-text">CrownBay</span>
            </Link>
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-4 py-2 mb-6">
              <Crown size={14} className="text-gold" />
              <span className="text-gold text-sm font-semibold">Premium Shopping Experience</span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
              Welcome Back to<br />
              <span className="gold-text">CrownBay</span>
            </h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Login to access exclusive deals, track your orders, and enjoy a premium shopping experience.
            </p>
            <ul className="space-y-3 mb-10">
              {features.map((f, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-gold/20 rounded-full flex items-center justify-center shrink-0">
                    <Check size={11} className="text-gold" />
                  </div>
                  <span className="text-gray-300 text-sm">{f}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-3">
              {trustBadges.map(b => (
                <div key={b.text} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                  <b.icon size={16} className="text-gold shrink-0" />
                  <span className="text-gray-300 text-sm">{b.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-3 gap-4">
            {[{ value: '10K+', label: 'Customers' }, { value: '500+', label: 'Products' }, { value: '4.8★', label: 'Avg Rating' }].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold gold-text">{s.value}</p>
                <p className="text-gray-500 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-primary">
          <div className="w-full max-w-md">

            {/* Mobile logo */}
            <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
              <Crown size={28} className="text-gold" />
              <span className="text-2xl font-bold gold-text">CrownBay</span>
            </div>

            <h1 className="text-3xl font-bold text-white mb-1">Sign In</h1>
            <p className="text-gray-400 mb-7">
              Don't have an account?{' '}
              <Link to="/register" className="text-gold hover:underline font-medium">Create one free</Link>
            </p>

            {/* Google Login — FUNCTIONAL */}
            <button onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-secondary border border-border rounded-xl py-3 text-white text-sm font-medium hover:border-gold/50 transition mb-5">
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-border" />
              <span className="text-gray-500 text-xs">or sign in with</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Tab */}
            <div className="flex bg-secondary border border-border rounded-xl p-1 mb-5">
              <button onClick={() => setActiveTab('email')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'email' ? 'bg-gold text-black' : 'text-gray-400 hover:text-white'}`}>
                <Mail size={15} /> Email
              </button>
              <button onClick={() => setActiveTab('phone')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'phone' ? 'bg-gold text-black' : 'text-gray-400 hover:text-white'}`}>
                <Phone size={15} /> Phone
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === 'email' ? (
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block font-medium">Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" required
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gold transition text-sm" />
                </div>
              ) : (
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block font-medium">Phone Number</label>
                  <div className="flex gap-2">
                    <div className="flex items-center bg-secondary border border-border rounded-xl px-3 text-gray-400 text-sm shrink-0">
                      🇮🇳 +91
                    </div>
                    <input type="tel" value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="9876543210" required
                      className="flex-1 bg-secondary border border-border rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gold transition text-sm" />
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm text-gray-400 font-medium">Password</label>
                  <button type="button" onClick={() => setShowForgot(true)}
                    className="text-xs text-gold hover:underline">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password" required
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-gold transition text-sm" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setRememberMe(!rememberMe)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition shrink-0 ${rememberMe ? 'bg-gold border-gold' : 'border-border hover:border-gold/50'}`}>
                  {rememberMe && <Check size={11} className="text-black" />}
                </button>
                <span className="text-gray-400 text-sm">Remember me for 30 days</span>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-gold text-black py-3.5 rounded-xl font-bold text-sm hover:bg-gold-light transition disabled:opacity-50 flex items-center justify-center gap-2">
                {loading
                  ? <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Signing in...</>
                  : <>Sign In <ArrowRight size={16} /></>}
              </button>
            </form>

            <div className="lg:hidden mt-8 grid grid-cols-3 gap-2 pt-6 border-t border-border">
              {trustBadges.map(b => (
                <div key={b.text} className="flex flex-col items-center gap-1 text-center">
                  <b.icon size={18} className="text-gold" />
                  <span className="text-gray-500 text-xs">{b.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
    </>
  );
};

export default Login;