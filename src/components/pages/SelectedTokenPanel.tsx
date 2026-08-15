'use client';

import { useEffect, useState } from 'react';
import { Token } from '@/lib/types';
import { formatNumber, getTimeAgo } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { Copy, ExternalLink } from 'lucide-react';

interface SelectedTokenPanelProps {
  token: Token | null;
  tokenCa: string | null;
  onSelectToken: (token: Token) => void;
}

export default function SelectedTokenPanel({
  token,
  tokenCa,
  onSelectToken,
}: SelectedTokenPanelProps) {
  const { status } = useAuth();
  const [tokenState, setTokenState] = useState<any>(null);
  const [loadingState, setLoadingState] = useState(false);

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
    return <div className="panel-empty">Select a token from the feed</div>;
  }

  const change = token.change || 0;
  const price = parseFloat(token.priceUsd || '0');
  const mcap = parseFloat(token.mcap || '0');
  const liq = parseFloat(token.liquidity || '0');
  const vol = parseFloat(token.volume24h || '0');
  const age = token.age || 0;

  const chartEmbedUrl = token.pairAddress
    ? `https://dexscreener.com/robinhood/${token.pairAddress}?embed=1&theme=dark&trades=0&info=0`
    : '';

  return (
    <div className="selected-token-panel">
      {/* Token Header */}
      <div className="token-header">
        <div className="token-avatar">
          {token.logo ? (
            <img
              src={token.logo}
              alt={token.symbol}
              onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
            />
          ) : (
            token.symbol?.charAt(0) || '?'
          )}
        </div>
        <div className="token-info">
          <div className="token-name">
            <span className="token-symbol">{token.symbol}</span>
            <span className="token-fullname">{token.name}</span>
          </div>
          <div className="token-stats">
            <span>MC ${formatNumber(mcap)}</span>
            <span>Liq ${formatNumber(liq)}</span>
            <span>Vol ${formatNumber(vol)}</span>
            <span className={change >= 0 ? 'positive' : 'negative'}>
              {change > 0 ? '+' : ''}{change.toFixed(2)}%
            </span>
          </div>
        </div>
        <div className="token-price">
          <span className="price-value">
            ${price < 0.01 ? price.toFixed(6) : price.toFixed(4)}
          </span>
          <span className="price-age">{getTimeAgo(age * 60 * 1000)} old</span>
        </div>
      </div>

      {/* Chart */}
      {chartEmbedUrl && (
        <div className="token-chart">
          <iframe
            src={chartEmbedUrl}
            allowFullScreen
          />
        </div>
      )}

      {/* Token Info Row */}
      <div className="token-details">
        <span>
          <strong>Contract:</strong> {token.tokenCa.slice(0, 6)}...{token.tokenCa.slice(-4)}
          <button onClick={() => navigator.clipboard.writeText(token.tokenCa)}>
            <Copy size={14} />
          </button>
        </span>
        <span><strong>DEX:</strong> {token.dexId}</span>
        <span><strong>Launchpad:</strong> {token.launchpad || 'Unknown'}</span>
        <span><strong>Phase:</strong> {tokenState?.graduated ? 'Graduated' : 'Bonding Curve'}</span>
        {tokenState && <span><strong>State:</strong> {tokenState.state}</span>}
      </div>

      {/* Socials */}
      {token.socials && (
        <div className="token-socials">
          {token.socials.website && (
            <a href={token.socials.website} target="_blank" rel="noopener noreferrer">
              Website <ExternalLink size={14} />
            </a>
          )}
          {token.socials.twitter && (
            <a href={token.socials.twitter} target="_blank" rel="noopener noreferrer">
              Twitter <ExternalLink size={14} />
            </a>
          )}
          {token.socials.telegram && (
            <a href={token.socials.telegram} target="_blank" rel="noopener noreferrer">
              Telegram <ExternalLink size={14} />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
