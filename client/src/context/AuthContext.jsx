import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('opinifi_token');
    const savedUser = localStorage.getItem('opinifi_user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (_) {}
    }
    setLoading(false);
  }, []);

  const saveAuth = (token, userData) => {
    localStorage.setItem('opinifi_token', token);
    localStorage.setItem('opinifi_user', JSON.stringify(userData));
    setUser(userData);
  };

  const register = async (data) => {
    const res = await API.post('/auth/register', data);
    saveAuth(res.data.token, res.data.user);
    toast.success(`Welcome to Opinifi, ${res.data.user.name}! 🎉 +50 welcome coins`);
    return res.data;
  };

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    saveAuth(res.data.token, res.data.user);
    toast.success(`Welcome back, ${res.data.user.name}!`);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('opinifi_token');
    localStorage.removeItem('opinifi_user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('opinifi_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await API.get('/auth/me');
      const updated = res.data.user;
      localStorage.setItem('opinifi_user', JSON.stringify(updated));
      setUser(updated);
      return updated;
    } catch (_) {}
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
