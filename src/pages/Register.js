import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Crown, Eye, EyeOff, Check, ArrowRight, Shield, Truck, Star, Gift } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const getStrength = (pass) => {
  if (!pass) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pass.length >= 6) score++;
  if (pass.length >= 10) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;
  if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500' };
  if (score <= 2) return { score, label: 'Fair', color: 'bg-yellow-500' };
  if (score <= 3) return { score, label: 'Good', color: 'bg-blue-500' };
  return { score, label: 'Strong', color: 'bg-green-500' };
};

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const strength = getStrength(form.password);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters!');
    if (!agreed) return toast.error('Please agree to the Terms & Conditions!');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.phone);
      toast.success('Account created! Welcome to CrownBay 👑');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed!');
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth — FUNCTIONAL
  const handleGoogleSignup = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  const perks = [
    { icon: Gift, text: '₹100 welcome discount on first order' },
    { icon: Star, text: 'Earn loyalty points on every purchase' },
    { icon: Truck, text: 'Free delivery on orders above ₹499' },
    { icon: Shield, text: 'Secure & private account' },
  ];

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#0D0D1A] via-[#12121E] to-[#1a1a2e] flex-col justify-between p-12 overflow-hidden">

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 -left-20 w-72 h-72 bg-gold/8 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
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
            <Gift size={14} className="text-gold" />
            <span className="text-gold text-sm font-semibold">Join 10,000+ happy shoppers</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Start Your<br />
            <span className="gold-text">Royal Shopping</span><br />
            Journey Today
          </h2>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Create your free account and unlock exclusive deals, early access to new arrivals, and much more.
          </p>

          <div className="space-y-4">
            {perks.map((p, i) => (
              <div key={i} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-4 py-3.5">
                <div className="w-9 h-9 bg-gold/15 rounded-xl flex items-center justify-center shrink-0">
                  <p.icon size={17} className="text-gold" />
                </div>
                <span className="text-gray-300 text-sm">{p.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { value: '10K+', label: 'Members' },
            { value: '4.8★', label: 'App Rating' },
            { value: '99%', label: 'Satisfaction' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold gold-text">{s.value}</p>
              <p className="text-gray-500 text-xs">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL — FORM ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-10 bg-primary overflow-y-auto">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
            <Crown size={28} className="text-gold" />
            <span className="text-2xl font-bold gold-text">CrownBay</span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-1">Create Account</h1>
          <p className="text-gray-400 mb-7">
            Already have an account?{' '}
            <Link to="/login" className="text-gold hover:underline font-medium">Sign in</Link>
          </p>

          {/* Google Signup — FUNCTIONAL */}
          <button onClick={handleGoogleSignup}
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
            <span className="text-gray-500 text-xs">or create with email</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block font-medium">Full Name</label>
                <input type="text" name="name" value={form.name} onChange={handleChange}
                  placeholder="Your name" required
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gold transition text-sm" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block font-medium">Phone</label>
                <input type="tel" name="phone" value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  placeholder="10 digits"
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gold transition text-sm" />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1.5 block font-medium">Email Address</label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                placeholder="you@example.com" required
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gold transition text-sm" />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1.5 block font-medium">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} name="password"
                  value={form.password} onChange={handleChange}
                  placeholder="Min 6 characters" required
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-gold transition text-sm" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength.score ? strength.color : 'bg-border'}`} />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${
                    strength.label === 'Weak' ? 'text-red-400' :
                    strength.label === 'Fair' ? 'text-yellow-400' :
                    strength.label === 'Good' ? 'text-blue-400' : 'text-green-400'
                  }`}>{strength.label} password</p>
                </div>
              )}
            </div>

            <div className="flex items-start gap-2.5 pt-1">
              <button type="button" onClick={() => setAgreed(!agreed)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition shrink-0 mt-0.5 ${agreed ? 'bg-gold border-gold' : 'border-border hover:border-gold/50'}`}>
                {agreed && <Check size={11} className="text-black" />}
              </button>
              <span className="text-gray-400 text-sm leading-relaxed">
                I agree to CrownBay's{' '}
                <button type="button" className="text-gold hover:underline">Terms of Service</button>
                {' '}and{' '}
                <button type="button" className="text-gold hover:underline">Privacy Policy</button>
              </span>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-gold text-black py-3.5 rounded-xl font-bold text-sm hover:bg-gold-light transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Creating Account...</>
              ) : (
                <>Create Free Account <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* Mobile perks */}
          <div className="lg:hidden mt-8 pt-6 border-t border-border grid grid-cols-2 gap-2">
            {perks.map((p, i) => (
              <div key={i} className="flex items-center gap-2 bg-secondary border border-border rounded-xl p-3">
                <p.icon size={14} className="text-gold shrink-0" />
                <span className="text-gray-400 text-xs">{p.text}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;