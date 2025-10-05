// frontend/src/context/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'sonner'; // Use the new toast

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
        if (token) {
            api.defaults.headers.common['x-auth-token'] = token;
            try {
                const res = await api.get('/auth/user');
                setUser(res.data);
            } catch (err) {
                localStorage.removeItem('token');
                setToken(null);
                setUser(null);
            }
        }
        setLoading(false);
    };
    loadUser();
  }, [token]);

  const getAuthHeader = () => ({ 'x-auth-token': token });

  const login = async (email, password) => {
    try {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        // User will be loaded by useEffect
        return { success: true };
    } catch (error) {
        const msg = error.response?.data?.msg || 'Login failed';
        toast.error(msg);
        throw error; // Rethrow for component to handle loader
    }
  };

  const signup = async (name, email, password) => {
    try {
        const res = await api.post('/auth/register', { name, email, password });
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        toast.success("Account created!");
        return { success: true };
    } catch (error) {
        const msg = error.response?.data?.msg || 'Signup failed';
        toast.error(msg);
        throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.info("Logged out");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, getAuthHeader }}>
      {children}
    </AuthContext.Provider>
  );
};