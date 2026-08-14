'use client';

import { Home, BarChart2, Search, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'discover' | 'trade' | 'scanner' | 'portfolio';
  onTabChange: (tab: 'discover' | 'trade' | 'scanner' | 'portfolio') => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'discover', label: 'Discover', icon: Home },
    { id: 'trade', label: 'Trade', icon: BarChart2 },
    { id: 'scanner', label: 'Scanner', icon: Search },
    { id: 'portfolio', label: 'Portfolio', icon: User },
  ] as const;

  return (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, maxWidth: 430, margin: '0 auto', background: '#0a0a0b', borderTop: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-around', padding: '8px 0', zIndex: 50 }}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'none',
              border: 'none',
              color: isActive ? '#00C805' : '#666',
              padding: '4px 0',
              cursor: 'pointer',
              fontSize: 12,
              gap: 2,
            }}
          >
            <Icon size={22} strokeWidth={isActive ? 2 : 1.5} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
