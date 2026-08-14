'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import Header from './ui/Header';
import BottomNav from './ui/BottomNav';
import TickerTape from './ui/TickerTape';
import DiscoverPage from './pages/DiscoverPage';
import TradePage from './pages/TradePage';
import ScannerPage from './pages/ScannerPage';
import PortfolioPage from './pages/PortfolioPage';
import SettingsPage from './pages/SettingsPage';
import TokenDetail from './pages/TokenDetail';

export default function Terminal() {
  const [activeTab, setActiveTab] = useState<'discover' | 'trade' | 'scanner' | 'portfolio'>('discover');
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const { status, user, walletAddress } = useAuth();

  const renderPage = () => {
    if (selectedToken) {
      return <TokenDetail tokenCa={selectedToken} onBack={() => setSelectedToken(null)} />;
    }
    switch (activeTab) {
      case 'discover':
        return <DiscoverPage onSelectToken={(ca) => setSelectedToken(ca)} />;
      case 'trade':
        return <TradePage />;
      case 'scanner':
        return <ScannerPage />;
      case 'portfolio':
        return <PortfolioPage />;
      default:
        return <DiscoverPage onSelectToken={(ca) => setSelectedToken(ca)} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#0a0a0b', maxWidth: 430, margin: '0 auto' }}>
      <Header />
      <TickerTape />
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 70px 12px' }}>
        {renderPage()}
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
