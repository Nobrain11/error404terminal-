'use client';

import { useEffect, useState, useRef } from 'react';
import { Search, Star, TrendingUp, Clock, Flame, ArrowUp, ArrowDown } from 'lucide-react';

interface Token {
  pairAddress: string;
  tokenCa: string;
  name: string;
  symbol: string;
  dexId: string;
  priceUsd: string;
  change: number;
  mcap: string;
  liquidity: string;
  volume24h: string;
  age: number;
}

interface DiscoverPageProps {
  onSelectToken: (ca: string) => void;
  onTradeToken: (ca: string) => void;
}

export default function DiscoverPage({ onSelectToken, onTradeToken }: DiscoverPageProps) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('trending');
  const [search, setSearch] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchTokens = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const url = `/api/market/tokens?filter=${filter}${search ? `&q=${encodeURIComponent(search)}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.tokens) {
        setTokens(data.tokens);
        setLastUpdated(new Date());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens(true);
    if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    fetchTimeoutRef.current = setInterval(() => {
      fetchTokens(false);
    }, 15000);
    return () => {
      if (fetchTimeoutRef.current) clearInterval(fetchTimeoutRef.current);
    };
  }, [filter, search]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  // Format number with K/M/B suffix
  const formatNumber = (num: string | number): string => {
    const n = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(n)) return '0';
    if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return n.toFixed(2);
  };

  // Get change color
  const getChangeColor = (change: number) => {
    if (change > 0) return '#00C805';
    if (change < 0) return '#FF3B30';
    return '#888';
  };

  // Get age label
  const getAgeLabel = (minutes: number): string => {
    if (minutes < 60) return minutes + 'm';
    if (minutes < 1440) return Math.floor(minutes / 60) + 'h';
    if (minutes < 10080) return Math.floor(minutes / 1440) + 'd';
    return Math.floor(minutes / 10080) + 'w';
  };

  // Filter labels with icons
  const filterOptions = [
    { id: 'trending', label: 'Top', icon: TrendingUp },
    { id: 'new', label: 'New', icon: Clock },
    { id: 'topvolume', label: 'Volume', icon: Flame },
    { id: 'gainers', label: 'Gainers', icon: ArrowUp },
    { id: 'losers', label: 'Losers', icon: ArrowDown },
  ];

  return (
    <div style={{ padding: '4px 0' }}>
      {/* Status bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0 8px 0', fontSize: 11, color: '#666', borderBottom: '1px solid #1a1a1a', marginBottom: 8 }}>
        <span>🟢 LIVE · {tokens.length} pairs</span>
        <span>{Math.floor((Date.now() - lastUpdated.getTime()) / 1000)}s ago</span>
      </div>

      {/* Filter tabs - compact */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 10, overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
        {filterOptions.map((f) => {
          const Icon = f.icon;
          const isActive = filter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 12px',
                borderRadius: 16,
                background: isActive ? '#00C805' : 'transparent',
                color: isActive ? '#0a0a0b' : '#888',
                border: isActive ? 'none' : '1px solid #2a2a2a',
                fontSize: 12,
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={12} />
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Search - compact */}
      <div style={{ position: 'relative', marginBottom: 10 }}>
        <input
          type="text"
          placeholder="Search token or paste CA..."
          value={search}
          onChange={handleSearchChange}
          style={{
            width: '100%',
            padding: '6px 12px 6px 32px',
            background: '#111',
            border: '1px solid #2a2a2a',
            borderRadius: 16,
            color: '#e5e5e5',
            fontSize: 13,
            outline: 'none',
          }}
        />
        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
      </div>

      {/* Token list - Base Bot style compact cards */}
      {loading && tokens.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
          <div style={{ display: 'inline-block', width: 24, height: 24, border: '2px solid #1a1a1a', borderTop: '2px solid #00C805', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <div style={{ marginTop: 8, fontSize: 13 }}>Loading tokens...</div>
        </div>
      ) : tokens.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#666', fontSize: 14 }}>
          No tokens found
        </div>
      ) : (
        <>
          {tokens.map((token) => {
            const change = token.change || 0;
            const price = parseFloat(token.priceUsd || '0');
            const mcap = parseFloat(token.mcap || '0');
            const liq = parseFloat(token.liquidity || '0');
            const vol = parseFloat(token.volume24h || '0');

            return (
              <div
                key={token.pairAddress}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 10px',
                  marginBottom: 4,
                  borderRadius: 8,
                  background: '#111',
                  borderBottom: '1px solid #1a1a1a',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onClick={() => onSelectToken(token.tokenCa)}
                onMouseEnter={(e) => e.currentTarget.style.background = '#1a1a1a'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#111'}
              >
                {/* Token info - compact left side */}
                <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
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
                    flexShrink: 0,
                    color: '#e5e5e5',
                  }}>
                    {token.symbol?.charAt(0) || '?'}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: 14, color: '#e5e5e5' }}>{token.symbol || '???'}</span>
                      <span style={{ fontSize: 10, color: '#666' }}>•</span>
                      <span style={{ fontSize: 11, color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {token.name || 'Unknown'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, fontSize: 11, color: '#666', marginTop: 1 }}>
                      <span>MC ${formatNumber(mcap)}</span>
                      <span>Liq ${formatNumber(liq)}</span>
                      <span>Vol ${formatNumber(vol)}</span>
                      <span>{getAgeLabel(token.age || 0)}</span>
                    </div>
                  </div>
                </div>

                {/* Price and change - compact right side */}
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#e5e5e5' }}>
                    ${price < 0.01 ? price.toFixed(6) : price.toFixed(4)}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: getChangeColor(change) }}>
                    {change > 0 ? '+' : ''}{change.toFixed(2)}%
                  </div>
                </div>

                {/* Trade button - small and green */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTradeToken(token.tokenCa);
                  }}
                  style={{
                    marginLeft: 10,
                    padding: '2px 12px',
                    borderRadius: 12,
                    background: '#00C805',
                    border: 'none',
                    color: '#0a0a0b',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    flexShrink: 0,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  Trade
                </button>
              </div>
            );
          })}

          {loading && tokens.length > 0 && (
            <div style={{ textAlign: 'center', padding: '4px', color: '#666', fontSize: 11 }}>
              Updating...
            </div>
          )}
        </>
      )}
    </div>
  );
}
