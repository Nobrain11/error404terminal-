'use client';

import { useAuth } from '@/lib/auth-context';
import { useState, useEffect } from 'react';

export default function PortfolioPage() {
  const { status, user, walletAddress, connect, connectWithCode } = useAuth();
  const [balance, setBalance] = useState<string | null>(null);
  const [codeInput, setCodeInput] = useState('');

  useEffect(() => {
    if (status === 'connected' && walletAddress) {
      fetch('/api/wallet/balance', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
        .then(res => res.json())
        .then(data => setBalance(data.balance))
        .catch(() => setBalance('0'));
    }
  }, [status, walletAddress]);

  if (status !== 'connected') {
    return (
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#00C805' }}>Connect Wallet</div>
        <button
          onClick={connect}
          style={{
            background: '#00C805',
            border: 'none',
            color: '#0a0a0b',
            padding: '10px 30px',
            borderRadius: 24,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Connect with Telegram
        </button>
        <div style={{ color: '#888', fontSize: 14 }}>or enter login code</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            placeholder="Enter code"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            style={{
              padding: '8px 12px',
              background: '#111',
              border: '1px solid #2a2a2a',
              borderRadius: 8,
              color: '#e5e5e5',
              fontSize: 14,
              outline: 'none',
            }}
          />
          <button
            onClick={() => connectWithCode(codeInput)}
            style={{
              background: '#1a1a1a',
              border: '1px solid #2a2a2a',
              color: '#aaa',
              padding: '8px 20px',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            Connect
          </button>
        </div>
        <div style={{ marginTop: 20, color: '#888', fontSize: 14 }}>View any address (coming soon)</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 14, color: '#888' }}>Total Balance</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{balance ? parseFloat(balance).toFixed(4) : '0'} ETH</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ background: '#1a1a1a', border: 'none', color: '#aaa', padding: '6px 14px', borderRadius: 16, fontSize: 13, cursor: 'pointer' }}>Deposit</button>
          <button style={{ background: '#1a1a1a', border: 'none', color: '#aaa', padding: '6px 14px', borderRadius: 16, fontSize: 13, cursor: 'pointer' }}>Send</button>
          <button style={{ background: '#1a1a1a', border: 'none', color: '#aaa', padding: '6px 14px', borderRadius: 16, fontSize: 13, cursor: 'pointer' }}>Receive</button>
        </div>
      </div>
      <div style={{ background: '#111', borderRadius: 8, padding: 12, marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 12, fontSize: 13, color: '#888' }}>
          <span>Chain: Robinhood (4663)</span>
          <span>Network: {process.env.NEXT_PUBLIC_RPC_URL}</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #1a1a1a', marginBottom: 12 }}>
        {['Holdings', 'PnL', 'History', 'Wallets'].map((tab) => (
          <button key={tab} style={{ background: 'none', border: 'none', color: '#666', padding: '8px 0', fontSize: 14, cursor: 'pointer' }}>
            {tab}
          </button>
        ))}
      </div>
      <div style={{ padding: 20, color: '#666', textAlign: 'center' }}>
        Holdings and PnL coming soon
      </div>
    </div>
  );
}
