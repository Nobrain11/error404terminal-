'use client';

import { useAuth } from '@/lib/auth-context';
import { useState, useEffect } from 'react';

export default function PortfolioPage() {
  const { status, user, walletAddress, connect, connectWithCode } = useAuth();
  const [balance, setBalance] = useState<string | null>(null);
  const [codeInput, setCodeInput] = useState('');
  const [timeframe, setTimeframe] = useState('1D');

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
      </div>
    );
  }

  return (
    <div style={{ padding: '4px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 13, color: '#888' }}>Total Value</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#e5e5e5' }}>${balance ? parseFloat(balance).toFixed(4) : '0'}</div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['1D', '7D', '30D', 'All'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              style={{
                padding: '2px 8px',
                borderRadius: 12,
                background: timeframe === tf ? '#2a2a2a' : 'transparent',
                color: timeframe === tf ? '#e5e5e5' : '#666',
                border: 'none',
                fontSize: 11,
                fontWeight: timeframe === tf ? 600 : 400,
                cursor: 'pointer',
              }}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
        <div style={{ background: '#111', padding: 10, borderRadius: 8 }}>
          <div style={{ fontSize: 10, color: '#888' }}>Unrealized PnL</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#00C805' }}>+$0</div>
        </div>
        <div style={{ background: '#111', padding: 10, borderRadius: 8 }}>
          <div style={{ fontSize: 10, color: '#888' }}>Realized PnL</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#00C805' }}>+$0</div>
        </div>
        <div style={{ background: '#111', padding: 10, borderRadius: 8 }}>
          <div style={{ fontSize: 10, color: '#888' }}>Total PnL</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#00C805' }}>+$0</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button style={{ flex: 1, padding: '6px', background: '#00C805', border: 'none', color: '#0a0a0b', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Deposit</button>
        <button style={{ flex: 1, padding: '6px', background: '#1a1a1a', border: 'none', color: '#aaa', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Withdraw</button>
        <button style={{ flex: 1, padding: '6px', background: '#1a1a1a', border: 'none', color: '#aaa', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Bridge</button>
        <button style={{ flex: 1, padding: '6px', background: '#1a1a1a', border: 'none', color: '#aaa', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Swap</button>
      </div>

      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #1a1a1a', marginBottom: 8 }}>
        {['Positions', 'Trades', 'Closed Positions'].map((tab) => (
          <button
            key={tab}
            style={{
              background: 'none',
              border: 'none',
              color: tab === 'Positions' ? '#00C805' : '#666',
              padding: '6px 0',
              fontSize: 12,
              fontWeight: tab === 'Positions' ? 600 : 400,
              borderBottom: tab === 'Positions' ? '2px solid #00C805' : 'none',
              cursor: 'pointer',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ textAlign: 'center', padding: '30px 0', color: '#666', fontSize: 14 }}>
        No open positions
      </div>
    </div>
  );
}
