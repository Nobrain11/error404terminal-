'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type AuthStatus = 'idle' | 'connecting' | 'connected' | 'unavailable';

interface AuthContextType {
  status: AuthStatus;
  user: { id: number; telegramId: string; username?: string } | null;
  walletAddress: string | null;
  connect: () => Promise<void>;
  connectWithCode: (code: string) => Promise<void>;
  disconnect: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('idle');
  const [user, setUser] = useState<{ id: number; telegramId: string; username?: string } | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Auto-connect via Telegram on mount (non-blocking)
  useEffect(() => {
    const autoConnect = async () => {
      if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.initData) {
        setStatus('connecting');
        try {
          const res = await fetch('/api/auth/telegram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ initData: (window as any).Telegram.WebApp.initData }),
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
            setWalletAddress(data.walletAddress);
            setStatus('connected');
          } else {
            setStatus('unavailable');
          }
        } catch {
          setStatus('unavailable');
        }
      }
    };
    autoConnect();
  }, []);

  const connect = async () => {
    // Manual Telegram connect (if not auto)
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.initData) {
      setStatus('connecting');
      try {
        const res = await fetch('/api/auth/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData: (window as any).Telegram.WebApp.initData }),
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setWalletAddress(data.walletAddress);
          setStatus('connected');
        } else {
          setStatus('unavailable');
        }
      } catch {
        setStatus('unavailable');
      }
    } else {
      // Fallback: open Telegram connect? We'll leave it.
      setStatus('unavailable');
    }
  };

  const connectWithCode = async (code: string) => {
    setStatus('connecting');
    try {
      const res = await fetch('/api/auth/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setWalletAddress(data.walletAddress);
        setStatus('connected');
      } else {
        setStatus('unavailable');
      }
    } catch {
      setStatus('unavailable');
    }
  };

  const disconnect = async () => {
    // We could call a logout API, but we'll just clear state
    setUser(null);
    setWalletAddress(null);
    setStatus('idle');
    // Optionally clear session on server
  };

  return (
    <AuthContext.Provider value={{ status, user, walletAddress, connect, connectWithCode, disconnect }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
