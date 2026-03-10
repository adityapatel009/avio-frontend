import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Crown, Eye, EyeOff, Check, ArrowRight, Lock } from 'lucide-react';
import axios from 'axios';
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

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const strength = getStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) return toast.error('Password kam se kam 6 characters ka hona chahiye!');
    if (password !== confirm) return toast.error('Dono passwords match nahi kar rahe!');

    setLoading(true);
    try {
      const res = await axios.post(`http://localhost:5000/api/auth/reset-password/${token}`, { password });
      toast.success(res.data.message);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Kuch galat ho gaya, dobara try karo!');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-5 border border-green-500/30">
            <Check size={44} className="text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Password Changed! ✅</h2>
          <p className="text-gray-400 mb-2">Tera password successfully update ho gaya!</p>
          <p className="text-gray-500 text-sm mb-6">3 seconds mein login page pe redirect ho raha hai...</p>
          <Link to="/login"
            className="inline-flex items-center gap-2 bg-gold text-black px-8 py-3 rounded-xl font-bold hover:bg-gold-light transition">
            Login Karo <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <Crown size={28} className="text-gold" />
            <span className="text-2xl font-bold gold-text">CrownBay</span>
          </Link>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          {/* Icon */}
          <div className="w-14 h-14 bg-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-gold/20">
            <Lock size={26} className="text-gold" />
          </div>

          <h1 className="text-2xl font-bold text-white text-center mb-1">Set New Password</h1>
          <p className="text-gray-400 text-sm text-center mb-6">
            Choose a strong password for your CrownBay account
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block font-medium">New Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min 6 characters" required
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-gold transition text-sm" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition">
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              {/* Strength bar */}
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= strength.score ? strength.color : 'bg-border'}`} />
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

            <div>
              <label className="text-sm text-gray-400 mb-1.5 block font-medium">Confirm Password</label>
              <div className="relative">
                <input type={showConfirm ? 'text' : 'password'} value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Re-enter password" required
                  className={`w-full bg-secondary border rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-600 focus:outline-none transition text-sm ${
                    confirm && confirm !== password ? 'border-red-500 focus:border-red-500' :
                    confirm && confirm === password ? 'border-green-500 focus:border-green-500' :
                    'border-border focus:border-gold'
                  }`} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition">
                  {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {confirm && confirm !== password && (
                <p className="text-red-400 text-xs mt-1">Passwords match nahi kar rahe!</p>
              )}
              {confirm && confirm === password && (
                <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
                  <Check size={12} /> Passwords match kar rahe hain
                </p>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-gold text-black py-3.5 rounded-xl font-bold text-sm hover:bg-gold-light transition disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Updating...</>
              ) : (
                <>Update Password <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <Link to="/login" className="text-gray-500 text-sm hover:text-gold transition">
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;