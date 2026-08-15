'use client';

import { useEffect, useState, useRef } from 'react';
import { Search, ChevronDown, ArrowUp, ArrowDown, Flame, Clock, TrendingUp, Zap } from 'lucide-react';

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
  logo?: string;
}

interface DiscoverPageProps {
  onSelectToken: (ca: string) => void;
  onTradeToken: (ca: string) => void;
}

export default function DiscoverPage({ onSelectToken, onTradeToken }: DiscoverPageProps) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('top');
  const [search, setSearch] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [chain, setChain] = useState('ROBINHOOD');
  const [timeframe, setTimeframe] = useState('5m');
  const [showTimeframeDropdown, setShowTimeframeDropdown] = useState(false);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowTimeframeDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const formatNumber = (num: string | number): string => {
    const n = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(n)) return '0';
    if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(2) + 'K';
    return n.toFixed(2);
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return '#00C805';
    if (change < 0) return '#FF3B30';
    return '#888';
  };

  const getAgeLabel = (minutes: number): string => {
    if (minutes < 60) return minutes + 'm';
    if (minutes < 1440) return Math.floor(minutes / 60) + 'h';
    if (minutes < 10080) return Math.floor(minutes / 1440) + 'd';
    return Math.floor(minutes / 10080) + 'w';
  };

  const filterOptions = [
    { id: 'top', label: 'Top', icon: TrendingUp },
    { id: 'trending', label: 'Trending', icon: Flame },
    { id: 'mostviewed', label: 'Most Viewed', icon: Zap },
    { id: 'surge', label: 'Surge', icon: Clock },
  ];

  const chainOptions = ['All chains', 'ROBINHOOD', 'ETH'];
  const timeframeOptions = ['1m', '5m', '15m', '30m', '1h', '4h', '24h'];

  return (
    <div style={{ padding: '4px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <button
          style={{
            background: 'none',
            border: 'none',
            color: '#888',
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          ✕
        </button>
        <button
          style={{
            background: '#1a1a1a',
            border: 'none',
            color: '#e5e5e5',
            padding: '4px 16px',
            borderRadius: 16,
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Deposit
        </button>
      </div>

      <div style={{ display: 'flex', gap: 2, marginBottom: 10 }}>
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
              }}
            >
              <Icon size={12} />
              {f.label}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 2, background: '#111', borderRadius: 16, padding: '2px' }}>
          {chainOptions.map((c) => (
            <button
              key={c}
              onClick={() => setChain(c)}
              style={{
                padding: '2px 10px',
                borderRadius: 14,
                background: chain === c ? '#2a2a2a' : 'transparent',
                color: chain === c ? '#e5e5e5' : '#666',
                border: 'none',
                fontSize: 11,
                fontWeight: chain === c ? 600 : 400,
                cursor: 'pointer',
              }}
            >
              {c}
            </button>
          ))}
        </div>

        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowTimeframeDropdown(!showTimeframeDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 10px',
              borderRadius: 14,
              background: '#1a1a1a',
              color: '#e5e5e5',
              border: 'none',
              fontSize: 11,
              fontWeight: 500,
              cursor: 'pointer',
              height: 24,
            }}
          >
            {timeframe}
            <ChevronDown size={12} />
          </button>
          {showTimeframeDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              background: '#1a1a1a',
              borderRadius: 8,
              border: '1px solid #2a2a2a',
              padding: '4px 0',
              zIndex: 10,
              minWidth: 60,
              marginTop: 2,
            }}>
              {timeframeOptions.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTimeframe(t);
                    setShowTimeframeDropdown(false);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '4px 12px',
                    background: 'none',
                    border: 'none',
                    color: timeframe === t ? '#00C805' : '#888',
                    fontSize: 11,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ position: 'relative', flex: 1, minWidth: 120 }}>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={handleSearchChange}
            style={{
              width: '100%',
              padding: '2px 8px 2px 24px',
              background: '#111',
              border: '1px solid #2a2a2a',
              borderRadius: 14,
              color: '#e5e5e5',
              fontSize: 11,
              outline: 'none',
              height: 24,
            }}
          />
          <Search size={12} style={{ position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
        </div>
      </div>

      <div style={{ fontSize: 20, fontWeight: 700, color: '#e5e5e5', marginBottom: 6 }}>
        0.0000 <span style={{ fontSize: 14, fontWeight: 400, color: '#666' }}>$0.00</span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 0.8fr 1fr 0.8fr',
        gap: 4,
        padding: '4px 8px',
        fontSize: 10,
        color: '#666',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        borderBottom: '1px solid #1a1a1a',
        marginBottom: 4,
      }}>
        <span>Pair Info</span>
        <span style={{ textAlign: 'center' }}>Trend</span>
        <span style={{ textAlign: 'right' }}>MC / Liq</span>
        <span style={{ textAlign: 'right' }}>Vol</span>
      </div>

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
          {tokens.slice(0, 20).map((token) => {
            const change = token.change || 0;
            const price = parseFloat(token.priceUsd || '0');
            const mcap = parseFloat(token.mcap || '0');
            const liq = parseFloat(token.liquidity || '0');
            const vol = parseFloat(token.volume24h || '0');
            const age = token.age || 0;

            return (
              <div
                key={token.pairAddress}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 0.8fr 1fr 0.8fr',
                  gap: 4,
                  padding: '6px 8px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  alignItems: 'center',
                  borderBottom: '1px solid #111',
                }}
                onClick={() => onSelectToken(token.tokenCa)}
                onMouseEnter={(e) => e.currentTarget.style.background = '#1a1a1a'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {/* Pair Info with logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    flexShrink: 0,
                    background: '#2a2a2a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {token.logo ? (
                      <img
                        src={token.logo}
                        alt={token.symbol}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          // fallback if image fails
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#e5e5e5' }}>
                        {token.symbol?.charAt(0) || '?'}
                      </span>
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#e5e5e5' }}>{token.symbol || '???'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#666' }}>
                      <span>{getAgeLabel(age)}</span>
                      <span>•</span>
                      <span style={{ color: '#444' }}>{Math.floor(Math.random() * 100)}</span>
                    </div>
                  </div>
                </div>

                {/* Trend */}
                <div style={{ textAlign: 'center', fontSize: 13, color: getChangeColor(change) }}>
                  {change > 0 ? <ArrowUp size={14} /> : change < 0 ? <ArrowDown size={14} /> : '—'}
                  <div style={{ fontSize: 11, fontWeight: 500 }}>
                    {change > 0 ? '+' : ''}{change.toFixed(2)}%
                  </div>
                </div>

                {/* MC / Liq */}
                <div style={{ textAlign: 'right', fontSize: 12, color: '#e5e5e5' }}>
                  <div>${formatNumber(mcap)}</div>
                  <div style={{ fontSize: 10, color: '#666' }}>${formatNumber(liq)}</div>
                </div>

                {/* Vol */}
                <div style={{ textAlign: 'right', fontSize: 12, color: '#e5e5e5' }}>
                  <div>${formatNumber(vol)}</div>
                  <div style={{ fontSize: 10, color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}>
                    <span>$3.4</span>
                    <ArrowUp size={10} color="#00C805" />
                  </div>
                </div>
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
