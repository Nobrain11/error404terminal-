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

export default function DiscoverFeed({
  category,
  searchQuery,
  onSelectToken,
  selectedTokenCa,
}: DiscoverFeedProps) {
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
    return <div className="feed-loading">Loading tokens...</div>;
  }

  if (tokens.length === 0) {
    return <div className="feed-empty">No tokens found</div>;
  }

  return (
    <div className="discover-feed">
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
            className={`feed-item ${isSelected ? 'selected' : ''}`}
          >
            {/* Avatar */}
            <div className="feed-avatar">
              {token.logo ? (
                <img
                  src={token.logo}
                  alt={token.symbol}
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
            <div className="feed-info">
              <div className="feed-name">
                <span className="feed-symbol">{token.symbol || '???'}</span>
                <span className="feed-meta">
                  {getTimeAgo(age * 60 * 1000)} • {token.dexId}
                </span>
              </div>
              <div className="feed-stats">
                <span>MC ${formatNumber(mcap)}</span>
                <span>Liq ${formatNumber(liq)}</span>
                <span>Vol ${formatNumber(vol)}</span>
                <span className={change >= 0 ? 'positive' : 'negative'}>
                  {change > 0 ? '+' : ''}{change.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="feed-price">
              ${price < 0.01 ? price.toFixed(6) : price.toFixed(4)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
