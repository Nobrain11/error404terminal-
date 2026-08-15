'use client';

import { useEffect, useState, useRef } from 'react';
import { Search, Star } from 'lucide-react';

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

export default function DiscoverPage({ onSelectToken }: { onSelectToken: (ca: string) => void }) {
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

  // Initial fetch and filter/search change
  useEffect(() => {
    fetchTokens(true);
    // Clear any pending timeout
    if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    // Set up polling every 15s, but only after first fetch
    fetchTimeoutRef.current = setInterval(() => {
      fetchTokens(false); // don't show loading on subsequent fetches
    }, 15000);
    return () => {
      if (fetchTimeoutRef.current) clearInterval(fetchTimeoutRef.current);
    };
  }, [filter, search]);

  // Handle search debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
        <span style={{ fontSize: 13, color: '#888' }}>
          🟢 LIVE · Robinhood Chain · {tokens.length} pairs · Updated {Math.floor((Date.now() - lastUpdated.getTime()) / 1000)}s ago
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '8px 0', marginBottom: 8, scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
        {['trending', 'new', 'topvolume', 'gainers', 'losers'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '4px 14px',
              borderRadius: 20,
              background: filter === f ? '#00C805' : '#1a1a1a',
              color: filter === f ? '#0a0a0b' : '#aaa',
              border: 'none',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ position: 'relative', marginBottom: 12 }}>
        <input
          type="text"
          placeholder="Search token name or paste CA..."
          value={search}
          onChange={handleSearchChange}
          style={{
            width: '100%',
            padding: '8px 12px 8px 36px',
            background: '#111',
            border: '1px solid #2a2a2a',
            borderRadius: 24,
            color: '#e5e5e5',
            fontSize: 14,
            outline: 'none',
          }}
        />
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
      </div>

      {loading && tokens.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
          <div style={{ display: 'inline-block', width: 24, height: 24, border: '2px solid #1a1a1a', borderTop: '2px solid #00C805', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <div style={{ marginTop: 8 }}>Loading tokens...</div>
        </div>
      ) : tokens.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
          No tokens found
        </div>
      ) : (
        <>
          {tokens.map((token) => (
            <div
              key={token.pairAddress}
              style={{
                background: '#111',
                borderRadius: 12,
                padding: '12px 14px',
                marginBottom: 10,
                border: '1px solid #1a1a1a',
                cursor: 'pointer',
              }}
              onClick={() => onSelectToken(token.tokenCa)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 600 }}>
                    {token.symbol?.charAt(0) || '?'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{token.symbol || 'Unknown'}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>{token.name || 'Unknown'}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>${parseFloat(token.priceUsd || '0').toFixed(6)}</div>
                  <div style={{ fontSize: 13, color: (token.change || 0) >= 0 ? '#00C805' : '#FF3B30' }}>
                    {(token.change || 0) > 0 ? '+' : ''}{(token.change || 0).toFixed(2)}%
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 4, marginTop: 10, fontSize: 12, color: '#888' }}>
                <span>MCap: ${parseFloat(token.mcap || '0').toLocaleString()}</span>
                <span>Liq: ${parseFloat(token.liquidity || '0').toLocaleString()}</span>
                <span>Vol: ${parseFloat(token.volume24h || '0').toLocaleString()}</span>
                <span>Age: {token.age || 0}m</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <button
                  onClick={(e) => { e.stopPropagation(); /* watchlist */ }}
                  style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}
                >
                  <Star size={16} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onSelectToken(token.tokenCa); }}
                  style={{ background: '#00C805', border: 'none', color: '#0a0a0b', borderRadius: 16, padding: '2px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                >
                  Buy
                </button>
              </div>
            </div>
          ))}
          {/* Show loading indicator at bottom while fetching in background */}
          {loading && tokens.length > 0 && (
            <div style={{ textAlign: 'center', padding: '8px', color: '#888', fontSize: 13 }}>
              Updating...
            </div>
          )}
        </>
      )}
    </div>
  );
}
