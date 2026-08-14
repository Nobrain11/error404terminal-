'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { ChevronLeft, Copy } from 'lucide-react';
// We'll use lightweight-charts in a separate component, but for simplicity we'll embed a placeholder.

export default function TokenDetail({ tokenCa, onBack }: { tokenCa: string; onBack: () => void }) {
  const { status } = useAuth();
  const [token, setToken] = useState<any>(null);
  const [candles, setCandles] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState('1H');
  const [activeTab, setActiveTab] = useState<'chart' | 'trades' | 'positions' | 'orders'>('chart');

  useEffect(() => {
    // Fetch token info from some endpoint (we can use DexScreener again)
    // For now, we'll use the /api/market/tokens with search
    const fetchToken = async () => {
      const res = await fetch(`/api/market/tokens?q=${tokenCa}`);
      const data = await res.json();
      if (data.tokens && data.tokens.length > 0) {
        setToken(data.tokens[0]);
      }
    };
    fetchToken();
  }, [tokenCa]);

  useEffect(() => {
    if (!token) return;
    const fetchCandles = async () => {
      const res = await fetch(`/api/market/candles?pair=${token.pairAddress}&timeframe=${timeframe}`);
      const data = await res.json();
      if (data.candles) {
        setCandles(data.candles);
      }
    };
    fetchCandles();
  }, [token, timeframe]);

  if (!token) return <div style={{ padding: 20 }}>Loading token...</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer' }}>
          <ChevronLeft size={24} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {token.symbol.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 18 }}>{token.symbol}</div>
            <div style={{ fontSize: 12, color: '#888' }}>{token.name}</div>
          </div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>${parseFloat(token.priceUsd).toFixed(6)}</div>
          <div style={{ fontSize: 14, color: token.change >= 0 ? '#00C805' : '#FF3B30' }}>
            {token.change > 0 ? '+' : ''}{token.change.toFixed(2)}%
          </div>
        </div>
      </div>

      <div style={{ fontSize: 12, color: '#888', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span>CA: {token.tokenCa.slice(0, 6)}...{token.tokenCa.slice(-4)}</span>
        <button onClick={() => navigator.clipboard.writeText(token.tokenCa)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
          <Copy size={14} />
        </button>
      </div>

      {/* Tabs */}
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
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Chart tab content */}
      {activeTab === 'chart' && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            {['1m','5m','15m','30m','1H','4H','1D','1W'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                style={{
                  background: timeframe === tf ? '#00C805' : '#1a1a1a',
                  color: timeframe === tf ? '#0a0a0b' : '#aaa',
                  border: 'none',
                  borderRadius: 4,
                  padding: '2px 10px',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                {tf}
              </button>
            ))}
          </div>
          {candles.length === 0 ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
              No on-chain trades available for this period.
            </div>
          ) : (
            <div style={{ height: 200, background: '#111', borderRadius: 8, padding: 8 }}>
              {/* Placeholder for lightweight-charts; real integration would go here */}
              <div style={{ color: '#888', fontSize: 14, textAlign: 'center', paddingTop: 80 }}>
                Chart with {candles.length} candles (lightweight-charts)
              </div>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 12 }}>
            <div style={{ background: '#111', padding: 8, borderRadius: 8 }}>
              <div style={{ color: '#888', fontSize: 12 }}>Market Cap</div>
              <div>${parseFloat(token.mcap).toLocaleString()}</div>
            </div>
            <div style={{ background: '#111', padding: 8, borderRadius: 8 }}>
              <div style={{ color: '#888', fontSize: 12 }}>Liquidity</div>
              <div>${parseFloat(token.liquidity).toLocaleString()}</div>
            </div>
            <div style={{ background: '#111', padding: 8, borderRadius: 8 }}>
              <div style={{ color: '#888', fontSize: 12 }}>Volume (24h)</div>
              <div>${parseFloat(token.volume24h).toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'trades' && (
        <div>
          <div style={{ fontSize: 14, color: '#888', padding: 20 }}>Live trades will appear here (coming soon)</div>
        </div>
      )}

      {activeTab === 'positions' && (
        <div>
          {status === 'connected' ? (
            <div style={{ padding: 20, color: '#666' }}>Position tracking not yet available — no fake data shown</div>
          ) : (
            <div style={{ padding: 20, color: '#666' }}>Connect to view positions</div>
          )}
        </div>
      )}

      {activeTab === 'orders' && (
        <div style={{ padding: 20, color: '#666' }}>Orders not yet available</div>
      )}

      {/* Sticky buy/sell bar */}
      <div style={{ position: 'sticky', bottom: 60, background: '#0a0a0b', padding: '12px 0', borderTop: '1px solid #1a1a1a', display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[10, 25, 50, 100].map((amount) => (
            <button key={amount} style={{ background: '#1a1a1a', border: 'none', color: '#aaa', padding: '4px 12px', borderRadius: 12, fontSize: 13, cursor: 'pointer' }}>
              ${amount}
            </button>
          ))}
          <button style={{ background: '#1a1a1a', border: 'none', color: '#aaa', padding: '4px 12px', borderRadius: 12, fontSize: 13, cursor: 'pointer' }}>
            MAX
          </button>
        </div>
        <button style={{ flex: 1, background: '#00C805', border: 'none', color: '#0a0a0b', fontWeight: 700, padding: '8px', borderRadius: 20, cursor: 'pointer' }}>
          Buy
        </button>
        <button style={{ flex: 1, background: '#FF3B30', border: 'none', color: '#fff', fontWeight: 700, padding: '8px', borderRadius: 20, cursor: 'pointer' }}>
          Sell
        </button>
      </div>
    </div>
  );
}
