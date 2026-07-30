'use client';
import { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

/**
 * Storefront session.
 *
 * Deliberately lightweight — the httpOnly cookie is the real session; this only
 * mirrors who is signed in so the interface can react. Nothing sensitive is
 * held here and nothing is persisted to localStorage.
 */
export function AuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | authenticated | guest

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      const data = await res.json();
      setCustomer(data.customer || null);
      setStatus(data.customer ? 'authenticated' : 'guest');
      return data.customer || null;
    } catch {
      setCustomer(null);
      setStatus('guest');
      return null;
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not sign in.');
    setCustomer(data.customer);
    setStatus('authenticated');
    return data.customer;
  }, []);

  const register = useCallback(async (payload) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not create the account.');
    setCustomer(data.customer);
    setStatus('authenticated');
    return data.customer;
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setCustomer(null);
    setStatus('guest');
  }, []);

  const value = useMemo(
    () => ({ customer, status, isAuthenticated: status === 'authenticated', login, register, logout, refresh, setCustomer }),
    [customer, status, login, register, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // Keeps components usable outside the provider (e.g. isolated tests).
    return {
      customer: null,
      status: 'guest',
      isAuthenticated: false,
      login: async () => {
        throw new Error('AuthProvider is not mounted.');
      },
      register: async () => {
        throw new Error('AuthProvider is not mounted.');
      },
      logout: async () => {},
      refresh: async () => null,
      setCustomer: () => {},
    };
  }
  return ctx;
}
