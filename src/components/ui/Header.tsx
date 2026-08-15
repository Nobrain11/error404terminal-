'use client';

import { useAuth } from '@/lib/auth-context';
import { useState, useEffect } from 'react';
import { Search, Star, Bell, Settings, Menu } from 'lucide-react';

interface HeaderProps {
  onSearch: (query: string) => void;
}

export default function Header({ onSearch }: HeaderProps) {
  const { status, walletAddress, connect, disconnect } = useAuth();
  const [search, setSearch] = useState('');
  const [balance, setBalance] = useState<string | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    onSearch(val);
  };

  const handleConnect = async () => {
    if (status === 'connected') {
      if (window.confirm('Disconnect wallet?')) {
        await disconnect();
      }
    } else {
      await connect();
    }
  };

  // Fetch balance when connected
  useEffect(() => {
    if (status === 'connected' && walletAddress) {
      fetch('/api/wallet/balance', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
        .then(res => res.json())
        .then(data => setBalance(data.balance || '0'))
        .catch(() => setBalance('0'));
    } else {
      setBalance(null);
    }
  }, [status, walletAddress]);

  return (
    <header className="terminal-header">
      {/* Brand */}
      <div className="header-brand">
        <span className="brand-error">ERROR</span>
        <span className="brand-404">404</span>
        <span className="brand-terminal">TERMINAL</span>
      </div>

      {/* Search */}
      <div className="header-search">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          placeholder="Search token or contract..."
          value={search}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>

      {/* Actions */}
      <div className="header-actions">
        <button className="header-btn" title="Watchlist">
          <Star size={18} />
        </button>
        <button className="header-btn" title="Notifications">
          <Bell size={18} />
        </button>
        <button className="header-btn" title="Settings">
          <Settings size={18} />
        </button>

        {/* Wallet */}
        {status === 'connected' && walletAddress && (
          <div className="header-wallet">
            <span className="wallet-address">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </span>
            {balance && (
              <span className="wallet-balance">{parseFloat(balance).toFixed(4)} ETH</span>
            )}
          </div>
        )}

        <button
          onClick={handleConnect}
          className={`header-connect ${status === 'connected' ? 'connected' : ''}`}
        >
          {status === 'connected' ? 'Wallet' : status === 'connecting' ? '...' : 'Connect'}
        </button>

        <button className="header-btn mobile-menu">
          <Menu size={20} />
        </button>
      </div>
    </header>
  );
}
