'use client';

import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';
import { Search } from 'lucide-react';

interface HeaderProps {
  onSearch: (query: string) => void;
}

export default function Header({ onSearch }: HeaderProps) {
  const { status, walletAddress, connect, disconnect } = useAuth();
  const [search, setSearch] = useState('');

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

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      padding: '6px 16px',
      borderBottom: '1px solid #1a1a1a',
      backgroundColor: '#0a0a0b',
      gap: '12px',
      flexShrink: 0,
      height: '48px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <span style={{ color: '#00C805', fontWeight: 700, fontSize: '18px' }}>ERROR404</span>
        <span style={{ color: '#888', fontSize: '11px', fontWeight: 300 }}>TERMINAL</span>
      </div>

      <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
        <input
          type="text"
          placeholder="Search token or contract..."
          value={search}
          onChange={handleSearchChange}
          style={{
            width: '100%',
            padding: '4px 10px 4px 28px',
            background: '#111',
            border: '1px solid #2a2a2a',
            borderRadius: '16px',
            color: '#e5e5e5',
            fontSize: '13px',
            outline: 'none',
            height: '30px',
          }}
        />
        <Search size={14} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        {status === 'connected' && walletAddress && (
          <span style={{
            color: '#aaa',
            fontSize: '12px',
            background: '#1a1a1a',
            padding: '2px 10px',
            borderRadius: '12px',
          }}>
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </span>
        )}
        <button
          onClick={handleConnect}
          style={{
            background: status === 'connected' ? '#1a1a1a' : '#00C805',
            color: status === 'connected' ? '#aaa' : '#0a0a0b',
            border: 'none',
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
      </div>
    </header>
  );
}
