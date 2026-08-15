'use client';

import { Home, Activity, Eye, User, Settings } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'discover' | 'pulse' | 'tracker' | 'portfolio' | 'settings';
  onTabChange: (tab: 'discover' | 'pulse' | 'tracker' | 'portfolio' | 'settings') => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'discover', label: 'Discover', icon: Home },
    { id: 'pulse', label: 'Pulse', icon: Activity },
    { id: 'tracker', label: 'Tracker', icon: Eye },
    { id: 'portfolio', label: 'Portfolio', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      maxWidth: 480,
      margin: '0 auto',
      background: '#0a0a0b',
      borderTop: '1px solid #1a1a1a',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '6px 0 10px 0',
      zIndex: 50,
    }}>
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
              padding: '2px 0',
              cursor: 'pointer',
              fontSize: 10,
              gap: 1,
            }}
          >
            <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
