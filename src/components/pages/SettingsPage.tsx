'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

export default function SettingsPage({ onClose }: { onClose: () => void }) {
  const { user, walletAddress, disconnect } = useAuth();

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0a0a0b', zIndex: 100, padding: 20, overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ color: '#00C805', fontSize: 20 }}>Settings</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#aaa', fontSize: 20, cursor: 'pointer' }}>✕</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ background: '#111', padding: 12, borderRadius: 8, marginBottom: 4 }}>
          <div style={{ color: '#888', fontSize: 12 }}>Wallet</div>
          <div style={{ fontSize: 14 }}>{walletAddress || 'No wallet'}</div>
        </div>
        <div style={{ background: '#111', padding: 12, borderRadius: 8, marginBottom: 4 }}>
          <div style={{ color: '#888', fontSize: 12 }}>Trading</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
            <span>Slippage</span>
            <span>0.5%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
            <span>Gas Limit</span>
            <span>Auto</span>
          </div>
        </div>
        <div style={{ background: '#111', padding: 12, borderRadius: 8, marginBottom: 4 }}>
          <div style={{ color: '#888', fontSize: 12 }}>Notifications</div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Enable alerts</span>
            <span>🔔</span>
          </div>
        </div>
        <div style={{ background: '#111', padding: 12, borderRadius: 8, marginBottom: 4 }}>
          <div style={{ color: '#888', fontSize: 12 }}>Security</div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Encryption</span>
            <span>Active</span>
          </div>
        </div>
        <div style={{ background: '#111', padding: 12, borderRadius: 8, marginBottom: 4 }}>
          <div style={{ color: '#888', fontSize: 12 }}>App</div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Version</span>
            <span>1.0.0</span>
          </div>
        </div>
        <button
          onClick={disconnect}
          style={{ marginTop: 20, background: '#FF3B30', border: 'none', color: '#fff', padding: '10px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}
