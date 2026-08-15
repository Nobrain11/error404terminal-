'use client';

import { Home, BarChart2, Search, User, Settings } from 'lucide-react';

interface SidebarProps {
  activeTab: 'discover' | 'trade' | 'scanner' | 'portfolio';
  onTabChange: (tab: 'discover' | 'trade' | 'scanner' | 'portfolio') => void;
  onSettings: () => void;
}

export default function Sidebar({ activeTab, onTabChange, onSettings }: SidebarProps) {
  const tabs = [
    { id: 'discover', label: 'Discover', icon: Home },
    { id: 'trade', label: 'Trade', icon: BarChart2 },
    { id: 'scanner', label: 'Scanner', icon: Search },
    { id: 'portfolio', label: 'Portfolio', icon: User },
  ] as const;

  return (
    <div style={{
      width: 64,
      backgroundColor: '#0a0a0b',
      borderRight: '1px solid #1a1a1a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: 16,
      gap: 8,
      height: '100vh',
      position: 'sticky',
      top: 0,
      flexShrink: 0,
    }}>
      <div style={{
        fontSize: 18,
        fontWeight: 700,
        color: '#00C805',
        marginBottom: 16,
        writingMode: 'vertical-rl',
        letterSpacing: 4,
      }}>
        ERROR
      </div>

      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: isActive ? '#1a1a1a' : 'transparent',
              color: isActive ? '#00C805' : '#666',
              border: isActive ? '1px solid #2a2a2a' : 'none',
              cursor: 'pointer',
              fontSize: 10,
              gap: 2,
            }}
          >
            <Icon size={22} strokeWidth={isActive ? 2 : 1.5} />
            <span style={{ fontSize: 9, marginTop: 2 }}>{tab.label}</span>
          </button>
        );
      })}

      <div style={{ flex: 1 }} />

      <button
        onClick={onSettings}
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          color: '#666',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <Settings size={22} strokeWidth={1.5} />
      </button>
    </div>
  );
}
