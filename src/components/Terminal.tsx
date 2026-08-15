'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import Header from './ui/Header';
import Sidebar from './ui/Sidebar';
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

  // Load token from URL param
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
    <div className="terminal-container">
      <Header onSearch={handleSearch} />

      <div className="terminal-body">
        {/* Sidebar */}
        <Sidebar activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

        {/* Left: Discovery Feed */}
        <div className="terminal-feed">
          <DiscoverFeed
            category={activeCategory}
            searchQuery={searchQuery}
            onSelectToken={handleSelectToken}
            selectedTokenCa={selectedTokenCa}
          />
        </div>

        {/* Center: Selected Token Panel */}
        <div className="terminal-center">
          <SelectedTokenPanel
            token={selectedToken}
            tokenCa={selectedTokenCa}
            onSelectToken={handleSelectToken}
          />
        </div>

        {/* Right: Trade Panel (desktop only) */}
        {isDesktop && selectedToken && (
          <div className="terminal-trade">
            <TradePanel token={selectedToken} />
          </div>
        )}
      </div>

      {/* Bottom: Live Activity */}
      {isTablet && <LiveActivity />}
    </div>
  );
}
