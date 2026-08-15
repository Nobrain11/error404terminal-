'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import Header from './ui/Header';
import BottomNav from './ui/BottomNav';
import Sidebar from './ui/Sidebar';
import TickerTape from './ui/TickerTape';
import DiscoverPage from './pages/DiscoverPage';
import TradePage from './pages/TradePage';
import ScannerPage from './pages/ScannerPage';
import PortfolioPage from './pages/PortfolioPage';
import SettingsPage from './pages/SettingsPage';
import TokenDetail from './pages/TokenDetail';

export default function Terminal() {
  const { status, user, walletAddress, connect, disconnect } = useAuth();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  // Read URL params
  const [activeTab, setActiveTab] = useState<'discover' | 'trade' | 'scanner' | 'portfolio'>('discover');
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [tradeToken, setTradeToken] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    const token = params.get('token');
    if (tab === 'trade') {
      setActiveTab('trade');
      if (token) setTradeToken(token);
    } else if (tab === 'discover' || tab === 'scanner' || tab === 'portfolio') {
      setActiveTab(tab);
    }
    if (token && !tab) {
      // If only token param, open token detail
      setSelectedToken(token);
    }
  }, []);

  const handleSelectToken = (ca: string) => {
    setSelectedToken(ca);
    setTradeToken(null); // clear trade token when opening detail
  };
  const handleCloseDetail = () => setSelectedToken(null);

  const renderMainContent = () => {
    if (activeTab === 'discover') {
      return <DiscoverPage onSelectToken={handleSelectToken} onTradeToken={(ca) => {
        setActiveTab('trade');
        setTradeToken(ca);
        setSelectedToken(null);
      }} />;
    }
    if (activeTab === 'trade') {
      return <TradePage initialTokenCa={tradeToken || undefined} />;
    }
    if (activeTab === 'scanner') return <ScannerPage />;
    if (activeTab === 'portfolio') return <PortfolioPage />;
    return <DiscoverPage onSelectToken={handleSelectToken} onTradeToken={(ca) => {
      setActiveTab('trade');
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
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#0a0a0b', maxWidth: 480, margin: '0 auto', paddingBottom: 70 }}>
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
        {showSettings && <SettingsPage onClose={() => setShowSettings(false)} />}
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
            {selectedToken ? (
              // When detail is open, we still show the main content list on the left
              renderMainContent()
            ) : (
              renderMainContent()
            )}
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

      {showSettings && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: 400, maxWidth: '90%', background: '#0a0a0b', borderLeft: '1px solid #1a1a1a', padding: 20, overflowY: 'auto' }}>
            <SettingsPage onClose={() => setShowSettings(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
