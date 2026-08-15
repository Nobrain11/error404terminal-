'use client';

import { useState } from 'react';
import { Search, Plus } from 'lucide-react';

export default function TrackerPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'wallets' | 'livetrades' | 'monitor' | 'kols' | 'settings'>('wallets');

  const tabs = [
    { id: 'wallets', label: 'Wallets' },
    { id: 'livetrades', label: 'Live Trades' },
    { id: 'monitor', label: 'Monitor' },
    { id: 'kols', label: 'KOLs' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div style={{ padding: '4px 0' }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 12, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '4px 12px',
              borderRadius: 16,
              background: activeTab === tab.id ? '#2a2a2a' : 'transparent',
              color: activeTab === tab.id ? '#e5e5e5' : '#666',
              border: activeTab === tab.id ? 'none' : '1px solid #2a2a2a',
              fontSize: 12,
              fontWeight: activeTab === tab.id ? 600 : 400,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ position: 'relative', marginBottom: 12 }}>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '6px 12px 6px 32px',
            background: '#111',
            border: '1px solid #2a2a2a',
            borderRadius: 16,
            color: '#e5e5e5',
            fontSize: 13,
            outline: 'none',
          }}
        />
        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
      </div>

      <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
        <div style={{ fontSize: 14, marginBottom: 8 }}>No wallets tracked yet</div>
        <div style={{ fontSize: 12 }}>Add your first wallet</div>
        <button
          style={{
            marginTop: 12,
            padding: '6px 20px',
            borderRadius: 20,
            background: '#00C805',
            border: 'none',
            color: '#0a0a0b',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Plus size={16} /> Add Wallet
        </button>
      </div>
    </div>
  );
}
