import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const GoogleAuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        loginWithToken(token, user);
        toast.success(`Welcome, ${user.name}! 👑`);
        if (user.role === 'admin') navigate('/admin');
        else navigate('/');
      } catch {
        toast.error('Google login mein kuch gadbad ho gayi!');
        navigate('/login');
      }
    } else {
      toast.error('Google login failed!');
      navigate('/login');
    }
  }, []);

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-gold/30">
          <Crown size={28} className="text-gold" />
        </div>
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-white font-semibold">Google se login ho raha hai...</p>
        <p className="text-gray-400 text-sm mt-1">Please wait</p>
      </div>
    </div>
  );
};

export default GoogleAuthSuccess;