'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import Header from './ui/Header';
import SidebarNav from './ui/SidebarNav';
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
      // Fetch token detail by CA and set as selectedToken
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
    // Update URL without page reload
    const url = new URL(window.location.href);
    url.searchParams.set('token', token.tokenCa);
    window.history.pushState({}, '', url.toString());
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Optionally filter the feed
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#0a0a0b', overflow: 'hidden' }}>
      {/* Header */}
      <Header onSearch={handleSearch} />

      {/* Main body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left sidebar navigation */}
        <SidebarNav activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

        {/* Left: Discovery feed */}
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

        {/* Center: Selected token panel */}
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

        {/* Right: Trade panel (only on desktop) */}
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

      {/* Bottom: Live activity (only if not too small) */}
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
