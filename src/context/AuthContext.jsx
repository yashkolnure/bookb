import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  });
  const [store, setStore] = useState(() => {
    const s = localStorage.getItem('store');
    return s ? JSON.parse(s) : null;
  });
  const [loading, setLoading] = useState(false);

  const saveSession = (token, userData, storeData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    if (storeData) localStorage.setItem('store', JSON.stringify(storeData));
    setUser(userData);
    setStore(storeData);
  };

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token, user: u, store: s } = res.data;
    saveSession(token, u, s);
    return res.data;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    const { token, user: u, store: s } = res.data;
    saveSession(token, u, s);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('store');
    setUser(null);
    setStore(null);
  };

  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem('token')) return;
    try {
      const res = await authAPI.me();
      const { user: u, store: s } = res.data;
      localStorage.setItem('user', JSON.stringify(u));
      if (s) localStorage.setItem('store', JSON.stringify(s));
      setUser(u);
      setStore(s);
    } catch {}
  }, []);

  const isAuthenticated = !!user && !!localStorage.getItem('token');

  return (
    <AuthContext.Provider value={{ user, store, loading, isAuthenticated, login, register, logout, refreshUser, setStore }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
