'use client';

import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';
import SettingsPage from '../pages/SettingsPage';

export default function Header() {
  const { status, user, walletAddress, connect, disconnect } = useAuth();
  const [showSettings, setShowSettings] = useState(false);

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
    <>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 16px',
        borderBottom: '1px solid #1a1a1a',
        backgroundColor: '#0a0a0b',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#00C805', fontWeight: 700, fontSize: 18 }}>ERROR404</span>
          <span style={{ color: '#888', fontSize: 12, fontWeight: 300 }}>Terminal</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            style={{
              background: '#1a1a1a',
              border: 'none',
              color: '#e5e5e5',
              padding: '4px 14px',
              borderRadius: 14,
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Deposit
          </button>
          <button
            onClick={handleConnect}
            style={{
              background: status === 'connected' ? '#1a1a1a' : '#00C805',
              color: status === 'connected' ? '#aaa' : '#0a0a0b',
              border: 'none',
              borderRadius: 14,
              padding: '4px 14px',
              fontWeight: 600,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            {status === 'connected' ? walletAddress?.slice(0, 4) + '...' : 'Connect'}
          </button>
        </div>
      </header>
      {showSettings && <SettingsPage onClose={() => setShowSettings(false)} />}
    </>
  );
}
