'use client';

import { useEffect, useState, useRef } from 'react';
import { Token } from '@/lib/types';
import { getTimeAgo, formatNumber } from '@/lib/utils';

interface DiscoverFeedProps {
  category: string;
  searchQuery: string;
  onSelectToken: (token: Token) => void;
  selectedTokenCa: string | null;
}

export default function DiscoverFeed({ category, searchQuery, onSelectToken, selectedTokenCa }: DiscoverFeedProps) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const fetchInterval = useRef<NodeJS.Timeout | null>(null);

  const fetchTokens = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const url = `/api/market/tokens?filter=${category}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''}`;
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
    if (fetchInterval.current) clearInterval(fetchInterval.current);
    fetchInterval.current = setInterval(() => {
      fetchTokens(false);
    }, 15000);
    return () => {
      if (fetchInterval.current) clearInterval(fetchInterval.current);
    };
  }, [category, searchQuery]);

  if (loading && tokens.length === 0) {
    return (
      <div style={{ padding: '12px', color: '#666', textAlign: 'center', fontSize: '13px' }}>
        Loading tokens...
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div style={{ padding: '12px', color: '#666', textAlign: 'center', fontSize: '13px' }}>
        No tokens found
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '4px 0' }}>
      {tokens.slice(0, 100).map((token) => {
        const isSelected = token.tokenCa === selectedTokenCa;
        const change = token.change || 0;
        const price = parseFloat(token.priceUsd || '0');
        const mcap = parseFloat(token.mcap || '0');
        const liq = parseFloat(token.liquidity || '0');
        const vol = parseFloat(token.volume24h || '0');
        const age = token.age || 0;

        return (
          <div
            key={token.pairAddress}
            onClick={() => onSelectToken(token)}
            style={{
              display: 'grid',
              gridTemplateColumns: '28px 1fr auto',
              gap: '6px',
              padding: '6px 10px',
              borderRadius: '4px',
              cursor: 'pointer',
              background: isSelected ? '#1a1a1a' : 'transparent',
              borderLeft: isSelected ? '2px solid #00C805' : '2px solid transparent',
              transition: 'background 0.1s',
            }}
            onMouseEnter={(e) => {
              if (!isSelected) e.currentTarget.style.background = '#151515';
            }}
            onMouseLeave={(e) => {
              if (!isSelected) e.currentTarget.style.background = 'transparent';
            }}
          >
            {/* Avatar */}
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              overflow: 'hidden',
              background: token.logo ? 'transparent' : '#2a2a2a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: 700,
              color: '#e5e5e5',
              flexShrink: 0,
            }}>
              {token.logo ? (
                <img
                  src={token.logo}
                  alt={token.symbol}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    const parent = (e.target as HTMLImageElement).parentElement;
                    if (parent) {
                      parent.textContent = token.symbol?.charAt(0) || '?';
                    }
                  }}
                />
              ) : (
                token.symbol?.charAt(0) || '?'
              )}
            </div>

            {/* Info */}
            <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 600, fontSize: '13px', color: '#e5e5e5' }}>{token.symbol || '???'}</span>
                <span style={{ fontSize: '10px', color: '#666' }}>
                  {getTimeAgo(age * 60 * 1000)} • {token.dexId}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', fontSize: '10px', color: '#666', flexWrap: 'wrap' }}>
                <span>MC ${formatNumber(mcap)}</span>
                <span>Liq ${formatNumber(liq)}</span>
                <span>Vol ${formatNumber(vol)}</span>
                <span style={{ color: change >= 0 ? '#00C805' : '#FF3B30', fontWeight: 500 }}>
                  {change > 0 ? '+' : ''}{change.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Price */}
            <div style={{ textAlign: 'right', fontSize: '13px', fontWeight: 500, color: '#e5e5e5', whiteSpace: 'nowrap' }}>
              ${price < 0.01 ? price.toFixed(6) : price.toFixed(4)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
