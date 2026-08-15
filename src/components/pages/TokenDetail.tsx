'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { ChevronLeft, Copy } from 'lucide-react';
import Chart from '@/components/ui/Chart';

export default function TokenDetail({ tokenCa, onBack }: { tokenCa: string; onBack: () => void }) {
  const { status } = useAuth();
  const [token, setToken] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'chart' | 'trades' | 'positions' | 'orders'>('chart');

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const res = await fetch(`/api/market/tokens?q=${encodeURIComponent(tokenCa)}`);
        const data = await res.json();
        if (data.tokens && data.tokens.length > 0) {
          setToken(data.tokens[0]);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchToken();
  }, [tokenCa]);

  if (!token) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: '#666' }}>
        Loading token...
      </div>
    );
  }

  const currentPrice = parseFloat(token.priceUsd || '0');

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer' }}>
          <ChevronLeft size={24} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
            {token.symbol?.charAt(0) || '?'}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 18 }}>{token.symbol || 'Unknown'}</div>
            <div style={{ fontSize: 12, color: '#888' }}>{token.name || 'Unknown'}</div>
          </div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>${currentPrice.toFixed(6)}</div>
          <div style={{ fontSize: 14, color: (token.change || 0) >= 0 ? '#00C805' : '#FF3B30' }}>
            {(token.change || 0) > 0 ? '+' : ''}{(token.change || 0).toFixed(2)}%
          </div>
        </div>
      </div>

      <div style={{ fontSize: 12, color: '#888', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span>CA: {token.tokenCa?.slice(0, 6) || ''}...{token.tokenCa?.slice(-4) || ''}</span>
        <button
          onClick={() => navigator.clipboard.writeText(token.tokenCa || '')}
          style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}
        >
          <Copy size={14} />
        </button>
        <button
          onClick={() => {
            // Navigate to Trade page with token pre-filled
            window.location.href = `/terminal?tab=trade&token=${token.tokenCa}`;
          }}
          style={{
            marginLeft: 'auto',
            background: '#00C805',
            border: 'none',
            color: '#0a0a0b',
            padding: '2px 16px',
            borderRadius: 16,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Trade
        </button>
      </div>

      <div style={{ display: 'flex', gap: 16, borderBottom: '1px solid #1a1a1a', marginBottom: 12 }}>
        {['chart', 'trades', 'positions', 'orders'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            style={{
              background: 'none',
              border: 'none',
              color: activeTab === tab ? '#00C805' : '#666',
              padding: '8px 0',
              fontSize: 14,
              fontWeight: activeTab === tab ? 600 : 400,
              borderBottom: activeTab === tab ? '2px solid #00C805' : 'none',
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'chart' && (
        <div>
          <Chart
            pairAddress={token.pairAddress || ''}
            tokenCa={token.tokenCa || ''}
            tokenSymbol={token.symbol || ''}
            currentPrice={currentPrice}
            totalSupply={token.totalSupply}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 12 }}>
            <div style={{ background: '#111', padding: 10, borderRadius: 8 }}>
              <div style={{ color: '#888', fontSize: 11 }}>Market Cap</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>${parseFloat(token.mcap || '0').toLocaleString()}</div>
            </div>
            <div style={{ background: '#111', padding: 10, borderRadius: 8 }}>
              <div style={{ color: '#888', fontSize: 11 }}>Liquidity</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>${parseFloat(token.liquidity || '0').toLocaleString()}</div>
            </div>
            <div style={{ background: '#111', padding: 10, borderRadius: 8 }}>
              <div style={{ color: '#888', fontSize: 11 }}>Volume (24h)</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>${parseFloat(token.volume24h || '0').toLocaleString()}</div>
            </div>
          </div>

          <div style={{ marginTop: 12, background: '#111', borderRadius: 8, padding: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#888', marginBottom: 4 }}>
              <span>Buy/Sell Pressure</span>
              <span>50% / 50%</span>
            </div>
            <div style={{ display: 'flex', height: 6, borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: '50%', background: '#00C805' }} />
              <div style={{ width: '50%', background: '#FF3B30' }} />
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <button
              onClick={() => window.location.href = `/terminal?tab=trade&token=${token.tokenCa}`}
              style={{
                width: '100%',
                padding: '12px',
                background: '#00C805',
                border: 'none',
                color: '#0a0a0b',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 16,
                cursor: 'pointer',
              }}
            >
              Trade {token.symbol}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'trades' && (
        <div>
          <div style={{ fontSize: 14, color: '#888', padding: 20, textAlign: 'center' }}>
            Live trades will appear here (coming soon)
          </div>
        </div>
      )}

      {activeTab === 'positions' && (
        <div>
          {status === 'connected' ? (
            <div style={{ padding: 20, color: '#666', textAlign: 'center' }}>
              Position tracking not yet available — no fake data shown
            </div>
          ) : (
            <div style={{ padding: 20, color: '#666', textAlign: 'center' }}>
              Connect to view positions
            </div>
          )}
        </div>
      )}

      {activeTab === 'orders' && (
        <div style={{ padding: 20, color: '#666', textAlign: 'center' }}>
          Orders not yet available
        </div>
      )}
    </div>
  );
}
