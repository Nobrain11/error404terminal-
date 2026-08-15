'use client';

import { useEffect, useState } from 'react';
import { Token } from '@/lib/types';
import { formatNumber, getTimeAgo } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

interface SelectedTokenPanelProps {
  token: Token | null;
  tokenCa: string | null;
  onSelectToken: (token: Token) => void;
}

export default function SelectedTokenPanel({ token, tokenCa, onSelectToken }: SelectedTokenPanelProps) {
  const { status } = useAuth();
  const [tokenState, setTokenState] = useState<any>(null);
  const [loadingState, setLoadingState] = useState(false);

  // Fetch token state from BagsLens when token changes
  useEffect(() => {
    if (!token) return;
    const fetchState = async () => {
      setLoadingState(true);
      try {
        const res = await fetch(`/api/trade/check-state?tokenCa=${token.tokenCa}`);
        const data = await res.json();
        setTokenState(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingState(false);
      }
    };
    fetchState();
  }, [token]);

  if (!token) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666', fontSize: '14px' }}>
        Select a token from the feed
      </div>
    );
  }

  const change = token.change || 0;
  const price = parseFloat(token.priceUsd || '0');
  const mcap = parseFloat(token.mcap || '0');
  const liq = parseFloat(token.liquidity || '0');
  const vol = parseFloat(token.volume24h || '0');
  const age = token.age || 0;

  // DexScreener embed URL
  const chartEmbedUrl = token.pairAddress
    ? `https://dexscreener.com/robinhood/${token.pairAddress}?embed=1&theme=dark&trades=0&info=0`
    : '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Token header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          overflow: 'hidden',
          background: token.logo ? 'transparent' : '#2a2a2a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          fontWeight: 700,
          color: '#e5e5e5',
          flexShrink: 0,
        }}>
          {token.logo ? (
            <img
              src={token.logo}
              alt={token.symbol}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
            />
          ) : (
            token.symbol?.charAt(0) || '?'
          )}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 700, fontSize: '20px', color: '#e5e5e5' }}>{token.symbol}</span>
            <span style={{ fontSize: '14px', color: '#888' }}>{token.name}</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#888' }}>
            <span>MC ${formatNumber(mcap)}</span>
            <span>Liq ${formatNumber(liq)}</span>
            <span>Vol ${formatNumber(vol)}</span>
            <span style={{ color: change >= 0 ? '#00C805' : '#FF3B30' }}>
              {change > 0 ? '+' : ''}{change.toFixed(2)}%
            </span>
          </div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#e5e5e5' }}>
            ${price < 0.01 ? price.toFixed(6) : price.toFixed(4)}
          </div>
          <div style={{ fontSize: '13px', color: '#888' }}>
            {getTimeAgo(age * 60 * 1000)} old
          </div>
        </div>
      </div>

      {/* Chart embed */}
      {chartEmbedUrl && (
        <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '8px', overflow: 'hidden', background: '#111' }}>
          <iframe
            src={chartEmbedUrl}
            style={{ width: '100%', height: '100%', border: 'none' }}
            allowFullScreen
          />
        </div>
      )}

      {/* Token info row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '13px', color: '#888', background: '#111', borderRadius: '8px', padding: '10px 14px' }}>
        <span><strong style={{ color: '#e5e5e5' }}>Contract:</strong> {token.tokenCa.slice(0, 6)}...{token.tokenCa.slice(-4)}</span>
        <span><strong style={{ color: '#e5e5e5' }}>DEX:</strong> {token.dexId}</span>
        <span><strong style={{ color: '#e5e5e5' }}>Launchpad:</strong> {token.launchpad || 'Unknown'}</span>
        <span><strong style={{ color: '#e5e5e5' }}>Phase:</strong> {tokenState?.graduated ? 'Graduated' : 'Bonding Curve'}</span>
        {tokenState && (
          <span><strong style={{ color: '#e5e5e5' }}>State:</strong> {tokenState.state}</span>
        )}
      </div>

      {/* Social links if available */}
      {token.socials && (
        <div style={{ display: 'flex', gap: '12px', fontSize: '13px' }}>
          {token.socials.website && <a href={token.socials.website} target="_blank" rel="noopener noreferrer" style={{ color: '#00C805' }}>Website</a>}
          {token.socials.twitter && <a href={token.socials.twitter} target="_blank" rel="noopener noreferrer" style={{ color: '#00C805' }}>Twitter</a>}
          {token.socials.telegram && <a href={token.socials.telegram} target="_blank" rel="noopener noreferrer" style={{ color: '#00C805' }}>Telegram</a>}
        </div>
      )}
    </div>
  );
}
