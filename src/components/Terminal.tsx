'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import Header from './ui/Header';
import { Home, Sparkles, TrendingUp, TrendingDown, BarChart2, Bookmark, Flame } from 'lucide-react';
import DiscoverFeed from './pages/DiscoverFeed';
import SelectedTokenPanel from './pages/SelectedTokenPanel';
import TradePanel from './ui/TradePanel';
import LiveActivity from './ui/LiveActivity';
import { Token } from '@/lib/types';

const categories = [
  { id: 'discover', label: 'Discover', icon: Home },
  { id: 'new', label: 'New', icon: Sparkles },
  { id: 'trending', label: 'Trending', icon: Flame },
  { id: 'gainers', label: 'Top Gainers', icon: TrendingUp },
  { id: 'losers', label: 'Top Losers', icon: TrendingDown },
  { id: 'volume', label: 'Volume', icon: BarChart2 },
  { id: 'watchlist', label: 'Watchlist', icon: Bookmark },
];

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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#0a0a0b', overflow: 'hidden' }}>
      <Header onSearch={handleSearch} />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar navigation – inline */}
        <nav style={{
          width: '56px',
          backgroundColor: '#0a0a0b',
          borderRight: '1px solid #1a1a1a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '8px',
          gap: '2px',
          flexShrink: 0,
          overflowY: 'auto',
        }}>
          {categories.map((cat) => {
            const Icon = cat.icon;
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
                  fontSize: '9px',
                  gap: '1px',
                  transition: 'background 0.15s',
                }}
                title={cat.label}
              >
                <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                <span style={{ fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                  {cat.label.length > 6 ? cat.label.slice(0, 6) : cat.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Left feed */}
        <div style={{
          flex: isDesktop ? '0 0 380px' : isTablet ? '0 0 320px' : '1',
          overflowY: 'auto',
          borderRight: '1px solid #1a1a1a',
          padding: '8px 0',
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
          padding: '12px 16px',
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
            padding: '12px 16px',
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
          height: '60px',
          overflow: 'hidden',
          backgroundColor: '#0f0f10',
        }}>
          <LiveActivity />
        </div>
      )}
    </div>
  );
}
