'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import Header from './ui/Header';
import BottomNav from './ui/BottomNav';
import Sidebar from './ui/Sidebar';
import TickerTape from './ui/TickerTape';
import DiscoverPage from './pages/DiscoverPage';
import PulsePage from './pages/PulsePage';
import TrackerPage from './pages/TrackerPage';
import PortfolioPage from './pages/PortfolioPage';
import SettingsPage from './pages/SettingsPage';
import TokenDetail from './pages/TokenDetail';

export default function Terminal() {
  const { status, user, walletAddress, connect, disconnect } = useAuth();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const [activeTab, setActiveTab] = useState<'discover' | 'pulse' | 'tracker' | 'portfolio' | 'settings'>('discover');
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [tradeToken, setTradeToken] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    const token = params.get('token');
    if (tab === 'discover' || tab === 'pulse' || tab === 'tracker' || tab === 'portfolio' || tab === 'settings') {
      setActiveTab(tab as any);
    }
    if (token) {
      setTradeToken(token);
      setActiveTab('pulse');
    }
  }, []);

  const handleSelectToken = (ca: string) => {
    setSelectedToken(ca);
    setTradeToken(null);
  };
  const handleCloseDetail = () => setSelectedToken(null);

  const renderMainContent = () => {
    if (activeTab === 'discover') {
      return <DiscoverPage onSelectToken={handleSelectToken} onTradeToken={(ca) => {
        setActiveTab('pulse');
        setTradeToken(ca);
        setSelectedToken(null);
      }} />;
    }
    if (activeTab === 'pulse') {
      return <PulsePage initialTokenCa={tradeToken || undefined} />;
    }
    if (activeTab === 'tracker') {
      return <TrackerPage />;
    }
    if (activeTab === 'portfolio') {
      return <PortfolioPage />;
    }
    if (activeTab === 'settings') {
      return <SettingsPage onClose={() => setShowSettings(false)} />;
    }
    return <DiscoverPage onSelectToken={handleSelectToken} onTradeToken={(ca) => {
      setActiveTab('pulse');
      setTradeToken(ca);
      setSelectedToken(null);
    }} />;
  };

  const handleConnect = async () => {
    if (status === 'connected') {
      if (window.confirm('Disconnect wallet?')) {
        await disconnect();
      }
    } else {
      await connect();
    }
  };

  // Mobile layout
  if (!isDesktop) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#0a0a0b', maxWidth: 480, margin: '0 auto', paddingBottom: 60 }}>
        <Header />
        <TickerTape />
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px' }}>
          {selectedToken ? (
            <TokenDetail tokenCa={selectedToken} onBack={handleCloseDetail} />
          ) : (
            renderMainContent()
          )}
        </div>
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  // Desktop layout
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0a0a0b' }}>
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSettings={() => setShowSettings(!showSettings)}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 20px',
          borderBottom: '1px solid #1a1a1a',
          backgroundColor: '#0a0a0b',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: '#888', fontSize: 14 }}>•</span>
            <span style={{ color: '#888', fontSize: 13 }}>Robinhood Chain</span>
            {status === 'connected' && walletAddress && (
              <span style={{ color: '#aaa', fontSize: 12, background: '#1a1a1a', padding: '2px 10px', borderRadius: 12 }}>
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
            )}
          </div>
          <button
            onClick={handleConnect}
            style={{
              background: status === 'connected' ? '#1a1a1a' : '#00C805',
              color: status === 'connected' ? '#aaa' : '#0a0a0b',
              border: 'none',
              borderRadius: 20,
              padding: '4px 16px',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            {status === 'connected' ? 'Connected' : status === 'connecting' ? '...' : 'Connect'}
          </button>
        </div>
        <TickerTape />

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <div style={{
            flex: selectedToken ? '0 0 55%' : '1',
            overflowY: 'auto',
            padding: '12px 20px',
            borderRight: selectedToken ? '1px solid #1a1a1a' : 'none',
            transition: 'flex 0.3s ease',
          }}>
            {renderMainContent()}
          </div>

          {selectedToken && (
            <div style={{
              flex: '0 0 45%',
              overflowY: 'auto',
              padding: '12px 20px',
              backgroundColor: '#0f0f10',
              borderLeft: '1px solid #1a1a1a',
            }}>
              <TokenDetail tokenCa={selectedToken} onBack={handleCloseDetail} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
