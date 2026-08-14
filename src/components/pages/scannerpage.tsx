'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';

interface TokenData {
  name: string;
  symbol: string;
  priceUsd: string;
  mcap: string;
  liquidity: string;
  volume24h: string;
  dexId: string;
  pairAddress: string;
  age: number;
  // Additional on‑chain (not from DexScreener)
  totalSupply?: string;
  taxes?: { buy: string; sell: string; transfer: string };
  maxBuy?: string;
  maxSell?: string;
  maxWallet?: string;
  audit?: string; // "SAFU!" or "Unknown"
}

export default function ScannerPage() {
  const [ca, setCa] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<TokenData | null>(null);
  const [error, setError] = useState('');

  const scan = async () => {
    if (!ca.trim()) return;
    setLoading(true);
    setError('');
    setToken(null);

    try {
      // 1. Search via DexScreener
      const res = await fetch(`/api/market/tokens?q=${encodeURIComponent(ca.trim())}`);
      const data = await res.json();
      if (data.tokens && data.tokens.length > 0) {
        const t = data.tokens[0];
        // Build token object with available data
        const tokenData: TokenData = {
          name: t.name || 'Unknown',
          symbol: t.symbol || 'Unknown',
          priceUsd: t.priceUsd || '0',
          mcap: t.mcap || '0',
          liquidity: t.liquidity || '0',
          volume24h: t.volume24h || '0',
          dexId: t.dexId || 'unknown',
          pairAddress: t.pairAddress || '',
          age: t.age || 0,
          // Placeholder for other fields – we can try to fetch more from contract later
          taxes: { buy: 'Unknown', sell: 'Unknown', transfer: 'Unknown' },
          maxBuy: 'Unknown',
          maxSell: 'Unknown',
          maxWallet: 'Unknown',
          audit: 'Unknown', // Could check if contract is verified via DexScreener
        };

        // If DexScreener has verification info (some pairs have "verified" flag)
        // We can set audit to "SAFU!" if verified, else "Unknown"
        // For now, we'll just set a generic "Unknown"
        // Optionally, we could call a separate verification API.

        setToken(tokenData);
      } else {
        setError('Token not found on Robinhood Chain.');
      }
    } catch (e) {
      setError('Error fetching token data.');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 12 }}>
      <h2 style={{ color: '#00C805', fontSize: 18, marginBottom: 12 }}>🔍 Contract Scanner</h2>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Paste contract address"
          value={ca}
          onChange={(e) => setCa(e.target.value)}
          style={{
            flex: 1,
            padding: '8px 12px',
            background: '#111',
            border: '1px solid #2a2a2a',
            borderRadius: 8,
            color: '#e5e5e5',
            fontSize: 14,
            outline: 'none',
          }}
        />
        <button
          onClick={scan}
          disabled={loading}
          style={{
            background: '#00C805',
            border: 'none',
            color: '#0a0a0b',
            padding: '8px 20px',
            borderRadius: 8,
            fontWeight: 600,
            cursor: loading ? 'default' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Scanning...' : 'Scan'}
        </button>
      </div>

      {error && (
        <div style={{ color: '#FF3B30', padding: 12, background: '#1a1a1a', borderRadius: 8 }}>
          {error}
        </div>
      )}

      {token && (
        <div style={{ background: '#111', borderRadius: 12, padding: 16, border: '1px solid #2a2a2a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{token.symbol}</div>
              <div style={{ fontSize: 14, color: '#888' }}>{token.name}</div>
            </div>
            <div style={{ fontSize: 14, color: '#888' }}>
              {token.dexId} 🔗
            </div>
          </div>

          <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div><span style={{ color: '#888' }}>Price</span><br /><strong>${parseFloat(token.priceUsd).toFixed(6)}</strong></div>
            <div><span style={{ color: '#888' }}>Market Cap</span><br /><strong>${parseFloat(token.mcap).toLocaleString()}</strong></div>
            <div><span style={{ color: '#888' }}>Liquidity</span><br /><strong>${parseFloat(token.liquidity).toLocaleString()}</strong></div>
            <div><span style={{ color: '#888' }}>Volume (24h)</span><br /><strong>${parseFloat(token.volume24h).toLocaleString()}</strong></div>
          </div>

          <div style={{ marginTop: 12, borderTop: '1px solid #2a2a2a', paddingTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#888' }}>Taxes</span>
              <span>Buy {token.taxes?.buy || 'Unknown'} · Sell {token.taxes?.sell || 'Unknown'} · Transfer {token.taxes?.transfer || 'Unknown'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ color: '#888' }}>Max Buy</span>
              <span>{token.maxBuy}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#888' }}>Max Sell</span>
              <span>{token.maxSell}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#888' }}>Max Wallet</span>
              <span>{token.maxWallet}</span>
            </div>
          </div>

          <div style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ background: '#00C805', color: '#0a0a0b', padding: '2px 12px', borderRadius: 12, fontSize: 13, fontWeight: 600 }}>
              {token.audit || 'Unknown'}
            </span>
            <span style={{ color: '#888', fontSize: 12 }}>Updated {new Date().toLocaleTimeString()}</span>
          </div>

          <div style={{ marginTop: 16 }}>
            <button
              onClick={() => window.location.href = `/terminal?token=${token.pairAddress}`}
              style={{
                background: '#00C805',
                border: 'none',
                color: '#0a0a0b',
                padding: '8px 24px',
                borderRadius: 20,
                fontWeight: 700,
                cursor: 'pointer',
                width: '100%',
              }}
            >
              Buy / Trade
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
