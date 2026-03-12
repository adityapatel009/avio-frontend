import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getMe } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('crownbay_token');
    if (token) {
      getMe()
        .then(res => setUser(res.data.user))
        .catch(() => {
          localStorage.removeItem('crownbay_token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await loginUser({ email, password });
    localStorage.setItem('crownbay_token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const loginWithToken = (token, userData) => {
    localStorage.setItem('crownbay_token', token);
    setUser(userData);
  };

  const register = async (name, email, password, phone) => {
    const res = await registerUser({ name, email, password, phone });
    localStorage.setItem('crownbay_token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

 const logout = () => {
    localStorage.removeItem('crownbay_token');
    setUser(null);
  };

  const updateUser = (updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
  };

  return (
<AuthContext.Provider value={{ user, loading, login, loginWithToken, register, logout, updateUser, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};