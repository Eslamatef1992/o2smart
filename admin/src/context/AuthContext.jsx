import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import apiClient, { getToken, setToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    if (!getToken()) {
      setAdmin(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await apiClient.get('/auth/admin/me');
      setAdmin(data.data);
    } catch {
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  async function login(email, password) {
    const { data } = await apiClient.post('/auth/admin/login', { email, password });
    setToken(data.data.token);
    setAdmin(data.data.admin);
    return data.data.admin;
  }

  function logout() {
    setToken(null);
    setAdmin(null);
  }

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout, refresh: loadMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
