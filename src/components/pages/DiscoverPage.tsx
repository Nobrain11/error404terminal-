'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { ChevronLeft, Copy, ArrowUp, ArrowDown } from 'lucide-react';
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
  const change = token.change || 0;
  const mcap = parseFloat(token.mcap || '0');
  const liq = parseFloat(token.liquidity || '0');
  const vol = parseFloat(token.volume24h || '0');
  const age = token.age || 0;

  const formatNumber = (num: number): string => {
    if (isNaN(num)) return '0';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
  };

  const getAgeLabel = (minutes: number): string => {
    if (minutes < 60) return minutes + 'm';
    if (minutes < 1440) return Math.floor(minutes / 60) + 'h';
    if (minutes < 10080) return Math.floor(minutes / 1440) + 'd';
    return Math.floor(minutes / 10080) + 'w';
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return '#00C805';
    if (change < 0) return '#FF3B30';
    return '#888';
  };

  return (
    <div style={{ padding: '4px 0' }}>
      {/* Header with back button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: '#888',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ChevronLeft size={18} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: '#2a2a2a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
            color: '#e5e5e5',
          }}>
            {token.symbol?.charAt(0) || '?'}
          </div>
          <span style={{ fontWeight: 600, fontSize: 16, color: '#e5e5e5' }}>{token.symbol || '???'}</span>
          <span style={{ fontSize: 11, color: '#666' }}>•</span>
          <span style={{ fontSize: 11, color: '#666' }}>{getAgeLabel(age)}</span>
        </div>
        <button
          onClick={() => navigator.clipboard.writeText(token.tokenCa || '')}
          style={{
            marginLeft: 'auto',
            background: 'none',
            border: 'none',
            color: '#666',
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          <Copy size={14} />
        </button>
      </div>

      {/* Price + Change */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
        <span style={{ fontSize: 24, fontWeight: 700, color: '#e5e5e5' }}>
          ${currentPrice < 0.01 ? currentPrice.toFixed(6) : currentPrice.toFixed(4)}
        </span>
        <span style={{ fontSize: 16, fontWeight: 600, color: getChangeColor(change) }}>
          {change > 0 ? '+' : ''}{change.toFixed(2)}%
        </span>
      </div>

      {/* Stats row - compact */}
      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#888', marginBottom: 12, flexWrap: 'wrap' }}>
        <span>MC <span style={{ color: '#e5e5e5' }}>${formatNumber(mcap)}</span></span>
        <span>Liq <span style={{ color: '#e5e5e5' }}>${formatNumber(liq)}</span></span>
        <span>Vol <span style={{ color: '#e5e5e5' }}>${formatNumber(vol)}</span></span>
        <span>Age <span style={{ color: '#e5e5e5' }}>{getAgeLabel(age)}</span></span>
      </div>

      {/* Chart */}
      <div style={{ marginBottom: 12 }}>
        <Chart
          pairAddress={token.pairAddress || ''}
          tokenCa={token.tokenCa || ''}
          tokenSymbol={token.symbol || ''}
          currentPrice={currentPrice}
          totalSupply={token.totalSupply}
        />
      </div>

      {/* Trade buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button
          onClick={() => window.location.href = `/terminal?tab=trade&token=${token.tokenCa}`}
          style={{
            flex: 1,
            padding: '10px',
            background: '#00C805',
            border: 'none',
            color: '#0a0a0b',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 15,
            cursor: 'pointer',
          }}
        >
          Buy
        </button>
        <button
          onClick={() => window.location.href = `/terminal?tab=trade&token=${token.tokenCa}`}
          style={{
            flex: 1,
            padding: '10px',
            background: '#FF3B30',
            border: 'none',
            color: '#fff',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 15,
            cursor: 'pointer',
          }}
        >
          Sell
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid #1a1a1a', marginBottom: 10 }}>
        {['Chart', 'Trades', 'Positions', 'Orders'].map((tab) => {
          const tabKey = tab.toLowerCase() as 'chart' | 'trades' | 'positions' | 'orders';
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tabKey)}
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === tabKey ? '#00C805' : '#666',
                padding: '6px 0',
                fontSize: 12,
                fontWeight: activeTab === tabKey ? 600 : 400,
                borderBottom: activeTab === tabKey ? '2px solid #00C805' : 'none',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'chart' && (
        <div style={{ fontSize: 13, color: '#666', padding: '8px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <div style={{ background: '#111', padding: 8, borderRadius: 6 }}>
              <div style={{ color: '#888', fontSize: 10, textTransform: 'uppercase' }}>Open</div>
              <div style={{ color: '#e5e5e5', fontSize: 14 }}>${currentPrice.toFixed(6)}</div>
            </div>
            <div style={{ background: '#111', padding: 8, borderRadius: 6 }}>
              <div style={{ color: '#888', fontSize: 10, textTransform: 'uppercase' }}>High</div>
              <div style={{ color: '#e5e5e5', fontSize: 14 }}>${(currentPrice * 1.05).toFixed(6)}</div>
            </div>
            <div style={{ background: '#111', padding: 8, borderRadius: 6 }}>
              <div style={{ color: '#888', fontSize: 10, textTransform: 'uppercase' }}>Low</div>
              <div style={{ color: '#e5e5e5', fontSize: 14 }}>${(currentPrice * 0.95).toFixed(6)}</div>
            </div>
            <div style={{ background: '#111', padding: 8, borderRadius: 6 }}>
              <div style={{ color: '#888', fontSize: 10, textTransform: 'uppercase' }}>Volume</div>
              <div style={{ color: '#e5e5e5', fontSize: 14 }}>${formatNumber(vol)}</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'trades' && (
        <div style={{ padding: '12px 0', color: '#666', fontSize: 13, textAlign: 'center' }}>
          Live trades coming soon
        </div>
      )}

      {activeTab === 'positions' && (
        <div style={{ padding: '12px 0', color: '#666', fontSize: 13, textAlign: 'center' }}>
          {status === 'connected' ? 'No positions found' : 'Connect to view positions'}
        </div>
      )}

      {activeTab === 'orders' && (
        <div style={{ padding: '12px 0', color: '#666', fontSize: 13, textAlign: 'center' }}>
          Orders coming soon
        </div>
      )}
    </div>
  );
}
