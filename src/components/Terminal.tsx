'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import Header from './ui/Header';
import DiscoverFeed from './pages/DiscoverFeed';
import SelectedTokenPanel from './pages/SelectedTokenPanel';
import TradePanel from './ui/TradePanel';
import LiveActivity from './ui/LiveActivity';
import { Token } from '@/lib/types';

export default function Terminal() {
  const { status, walletAddress } = useAuth();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isTablet = useMediaQuery('(min-width: 768px)');

  const [activeCategory, setActiveCategory] = useState('discover');
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [selectedTokenCa, setSelectedTokenCa] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ca = params.get('token');
    if (ca) {
      setSelectedTokenCa(ca);
      fetch(`/api/market/tokens?q=${encodeURIComponent(ca)}`)
        .then(res => res.json())
        .then(data => {
          if (data.tokens && data.tokens.length > 0) {
            setSelectedToken(data.tokens[0]);
          }
        })
        .catch(() => {});
    }
  }, []);

  const handleSelectToken = (token: Token) => {
    setSelectedToken(token);
    setSelectedTokenCa(token.tokenCa);
    const url = new URL(window.location.href);
    url.searchParams.set('token', token.tokenCa);
    window.history.pushState({}, '', url.toString());
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: '#0a0a0b',
      overflow: 'hidden',
      color: '#e5e5e5',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      <Header onSearch={handleSearch} />

      <div style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
      }}>
        {/* Sidebar */}
        <nav style={{
          width: '56px',
          backgroundColor: '#0a0a0b',
          borderRight: '1px solid #1a1a1a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '8px',
          gap: '4px',
          flexShrink: 0,
          overflowY: 'auto',
        }}>
          {[
            { id: 'discover', label: 'Discover', icon: '🏠' },
            { id: 'new', label: 'New', icon: '✨' },
            { id: 'trending', label: 'Trending', icon: '🔥' },
            { id: 'gainers', label: 'Gainers', icon: '📈' },
            { id: 'losers', label: 'Losers', icon: '📉' },
            { id: 'volume', label: 'Volume', icon: '📊' },
            { id: 'watchlist', label: 'Watchlist', icon: '⭐' },
          ].map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isActive ? '#1a1a1a' : 'transparent',
                  color: isActive ? '#00C805' : '#666',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px',
                  gap: '2px',
                }}
                title={cat.label}
              >
                <span>{cat.icon}</span>
                <span style={{
                  fontSize: '7px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.3px',
                  color: isActive ? '#00C805' : '#666',
                }}>
                  {cat.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Left feed */}
        <div style={{
          flex: isDesktop ? '0 0 400px' : isTablet ? '0 0 340px' : '1',
          overflowY: 'auto',
          borderRight: '1px solid #1a1a1a',
          backgroundColor: '#0f0f10',
        }}>
          <DiscoverFeed
            category={activeCategory}
            searchQuery={searchQuery}
            onSelectToken={handleSelectToken}
            selectedTokenCa={selectedTokenCa}
          />
        </div>

        {/* Center panel */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          backgroundColor: '#0a0a0b',
          minWidth: 0,
        }}>
          <SelectedTokenPanel
            token={selectedToken}
            tokenCa={selectedTokenCa}
            onSelectToken={handleSelectToken}
          />
        </div>

        {/* Right trade panel (desktop only) */}
        {isDesktop && selectedToken && (
          <div style={{
            flex: '0 0 340px',
            borderLeft: '1px solid #1a1a1a',
            padding: '16px',
            overflowY: 'auto',
            backgroundColor: '#0f0f10',
          }}>
            <TradePanel token={selectedToken} />
          </div>
        )}
      </div>

      {/* Bottom live activity */}
      {isTablet && (
        <div style={{
          borderTop: '1px solid #1a1a1a',
          height: '56px',
          overflow: 'hidden',
          backgroundColor: '#0f0f10',
        }}>
          <LiveActivity />
        </div>
      )}
    </div>
  );
}
