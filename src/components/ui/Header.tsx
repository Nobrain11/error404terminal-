'use client';

import { useAuth } from '@/lib/auth-context';
import { useState, useEffect } from 'react';

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
    <header style={{
      display: 'flex',
      alignItems: 'center',
      padding: '6px 16px',
      borderBottom: '1px solid #1a1a1a',
      background: '#0a0a0b',
      gap: '12px',
      flexShrink: 0,
      height: '48px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
        <span style={{ color: '#e5e5e5', fontWeight: 700, fontSize: '16px' }}>ERROR</span>
        <span style={{ color: '#00C805', fontWeight: 700, fontSize: '16px' }}>404</span>
        <span style={{ color: '#888', fontSize: '11px', fontWeight: 300, marginLeft: '4px' }}>TERMINAL</span>
      </div>

      <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
        <span style={{
          position: 'absolute',
          left: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#666',
          fontSize: '14px',
        }}>🔍</span>
        <input
          type="text"
          placeholder="Search token or contract..."
          value={search}
          onChange={handleSearchChange}
          style={{
            width: '100%',
            padding: '4px 10px 4px 32px',
            background: '#111',
            border: '1px solid #1a1a1a',
            borderRadius: '16px',
            color: '#e5e5e5',
            fontSize: '13px',
            outline: 'none',
            height: '30px',
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto', flexShrink: 0 }}>
        <button style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: '4px', fontSize: '18px' }}>⭐</button>
        <button style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: '4px', fontSize: '18px' }}>🔔</button>
        <button style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: '4px', fontSize: '18px' }}>⚙️</button>

        {status === 'connected' && walletAddress && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#111',
            padding: '2px 10px',
            borderRadius: '12px',
            border: '1px solid #1a1a1a',
          }}>
            <span style={{ color: '#888', fontSize: '12px' }}>
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </span>
            {balance && (
              <span style={{ color: '#00C805', fontSize: '12px', fontWeight: 600 }}>
                {parseFloat(balance).toFixed(4)} ETH
              </span>
            )}
          </div>
        )}

        <button
          onClick={handleConnect}
          style={{
            background: status === 'connected' ? '#111' : '#00C805',
            color: status === 'connected' ? '#888' : '#0a0a0b',
            border: status === 'connected' ? '1px solid #1a1a1a' : 'none',
            borderRadius: '14px',
            padding: '4px 14px',
            fontWeight: 600,
            fontSize: '12px',
            cursor: 'pointer',
            height: '28px',
          }}
        >
          {status === 'connected' ? 'Wallet' : status === 'connecting' ? '...' : 'Connect'}
        </button>

        <button style={{
          background: 'none',
          border: 'none',
          color: '#888',
          cursor: 'pointer',
          display: 'none',
          fontSize: '20px',
          '@media (max-width: 768px)': { display: 'flex' },
        }}>☰</button>
      </div>
    </header>
  );
}
