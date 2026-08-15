'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import Chart from '@/components/ui/Chart';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface PulsePageProps {
  initialTokenCa?: string;
}

interface Trade {
  txHash: string;
  time: string;
  side: 'buy' | 'sell';
  usdSize: string;
  trader: string;
  marketCap: string;
}

export default function PulsePage({ initialTokenCa }: PulsePageProps) {
  const { status } = useAuth();
  const [tokenCa, setTokenCa] = useState(initialTokenCa || '');
  const [token, setToken] = useState<any>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('5m');
  const [view, setView] = useState<'chart+table' | 'chart' | 'table'>('chart+table');
  const [newTrade, setNewTrade] = useState<{ side: 'buy' | 'sell'; txHash: string } | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!tokenCa) return;
    const fetchToken = async () => {
      try {
        const res = await fetch(`/api/market/tokens?q=${encodeURIComponent(tokenCa)}`);
        const data = await res.json();
        if (data.tokens && data.tokens.length > 0) {
          setToken(data.tokens[0]);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchToken();
  }, [tokenCa]);

  const fetchTrades = async (since?: number) => {
    if (!token) return;
    try {
      const url = `/api/market/transactions?pair=${token.pairAddress}&limit=30${since ? `&since=${since}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.trades && data.trades.length > 0) {
        const formattedTrades = data.trades.map((t: any) => ({
          ...t,
          time: getTimeAgo(new Date(t.time).getTime()),
        }));
        if (since && data.trades.length > 0) {
          // Check for new trades
          const latest = data.trades[0];
          const existing = trades.length > 0 ? trades[0] : null;
          if (existing && latest.txHash !== existing.txHash) {
            setNewTrade({ side: latest.side, txHash: latest.txHash });
            setTimeout(() => setNewTrade(null), 3000);
          }
          setTrades(prev => {
            const newOnes = data.trades.filter((t: any) => 
              !prev.some(p => p.txHash === t.txHash)
            );
            return [...newOnes, ...prev].slice(0, 30);
          });
        } else {
          setTrades(formattedTrades);
        }
      }
      lastFetchRef.current = Date.now();
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const getTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return seconds + 's';
    if (seconds < 3600) return Math.floor(seconds / 60) + 'm';
    if (seconds < 86400) return Math.floor(seconds / 3600) + 'h';
    return Math.floor(seconds / 86400) + 'd';
  };

  useEffect(() => {
    if (!token) return;
    fetchTrades();
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => {
      fetchTrades(Math.floor(lastFetchRef.current / 1000));
    }, 2000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [token]);

  const formatNumber = (num: string | number): string => {
    const n = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(n)) return '0';
    if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(2) + 'K';
    return n.toFixed(2);
  };

  const getAgeLabel = (minutes: number): string => {
    if (minutes < 60) return minutes + 'm';
    if (minutes < 1440) return Math.floor(minutes / 60) + 'h';
    if (minutes < 10080) return Math.floor(minutes / 1440) + 'd';
    return Math.floor(minutes / 10080) + 'w';
  };

  if (!tokenCa) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, color: '#666' }}>
        Select a token to start trading
      </div>
    );
  }

  if (!token) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, color: '#666' }}>
        Loading token...
      </div>
    );
  }

  const currentPrice = parseFloat(token.priceUsd || '0');
  const change = token.change || 0;
  const mcap = parseFloat(token.mcap || '0');
  const age = token.age || 0;

  const timeframes = ['1s', '30s', '15m', '5m'];

  return (
    <div style={{ padding: '4px 0' }}>
      {/* Token header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            overflow: 'hidden',
            flexShrink: 0,
            background: '#2a2a2a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {token.logo ? (
              <img
                src={token.logo}
                alt={token.symbol}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
              />
            ) : (
              <span style={{ fontSize: 14, fontWeight: 700, color: '#e5e5e5' }}>
                {token.symbol?.charAt(0) || '?'}
              </span>
            )}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, color: '#e5e5e5' }}>{token.symbol || '???'}</div>
            <div style={{ fontSize: 11, color: '#888' }}>{getAgeLabel(age)}</div>
          </div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontWeight: 700, fontSize: 20, color: '#e5e5e5' }}>
            ${currentPrice < 0.01 ? currentPrice.toFixed(6) : currentPrice.toFixed(4)}
          </div>
          <div style={{ fontSize: 14, color: change >= 0 ? '#00C805' : '#FF3B30' }}>
            {change > 0 ? '+' : ''}{change.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* View toggle */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 8, background: '#111', borderRadius: 6, padding: 2 }}>
        {['chart+table', 'chart', 'table'].map((v) => (
          <button
            key={v}
            onClick={() => setView(v as any)}
            style={{
              flex: 1,
              padding: '4px 0',
              borderRadius: 4,
              background: view === v ? '#2a2a2a' : 'transparent',
              color: view === v ? '#e5e5e5' : '#666',
              border: 'none',
              fontSize: 11,
              fontWeight: view === v ? 600 : 400,
              cursor: 'pointer',
              textTransform: 'uppercase',
            }}
          >
            {v.replace('+', ' + ')}
          </button>
        ))}
      </div>

      {/* Timeframe */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        {timeframes.map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            style={{
              padding: '2px 12px',
              borderRadius: 12,
              background: timeframe === tf ? '#00C805' : 'transparent',
              color: timeframe === tf ? '#0a0a0b' : '#888',
              border: timeframe === tf ? 'none' : '1px solid #2a2a2a',
              fontSize: 11,
              fontWeight: timeframe === tf ? 600 : 400,
              cursor: 'pointer',
            }}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* Chart */}
      {(view === 'chart+table' || view === 'chart') && (
        <div style={{ marginBottom: 8 }}>
          <Chart
            pairAddress={token.pairAddress || ''}
            tokenCa={token.tokenCa || ''}
            tokenSymbol={token.symbol || ''}
            currentPrice={currentPrice}
            totalSupply={token.totalSupply}
          />
        </div>
      )}

      {/* Trades table */}
      {(view === 'chart+table' || view === 'table') && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#e5e5e5' }}>
              Live Trades
              <span style={{ fontSize: 10, fontWeight: 400, color: '#666', marginLeft: 8 }}>
                ● live
              </span>
            </span>
            <div style={{ display: 'flex', gap: 4, fontSize: 11, color: '#888' }}>
              <button style={{ background: 'none', border: 'none', color: '#00C805', cursor: 'pointer' }}>TXN ↓</button>
              <button style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>MC $</button>
              <button style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>USD $</button>
              <button style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>Trader</button>
            </div>
          </div>

          {loading && trades.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>Loading trades...</div>
          ) : trades.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>No trades yet</div>
          ) : (
            <div style={{ maxHeight: 350, overflowY: 'auto' }}>
              {trades.map((trade, i) => (
                <div
                  key={i}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '0.8fr 1fr 1fr 1.5fr',
                    gap: 4,
                    padding: '4px 0',
                    borderBottom: '1px solid #111',
                    fontSize: 12,
                    alignItems: 'center',
                    ...(newTrade?.txHash === trade.txHash ? {
                      background: newTrade.side === 'buy' ? 'rgba(0,200,5,0.1)' : 'rgba(255,59,48,0.1)',
                      borderRadius: 4,
                    } : {}),
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: trade.side === 'buy' ? '#00C805' : '#FF3B30' }}>
                    {trade.side === 'buy' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                    <span>{trade.time}</span>
                  </div>
                  <div style={{ textAlign: 'right', color: '#e5e5e5' }}>${formatNumber(trade.marketCap || '0')}</div>
                  <div style={{ textAlign: 'right', color: '#e5e5e5' }}>${trade.usdSize}</div>
                  <div style={{ textAlign: 'right', color: '#666', fontSize: 11 }}>
                    <a
                      href={`${process.env.NEXT_PUBLIC_EXPLORER}/tx/${trade.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#666', textDecoration: 'none' }}
                    >
                      {trade.trader?.slice(0, 6) || '...'}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr 1fr',
            gap: 8,
            padding: '8px 0',
            borderTop: '1px solid #1a1a1a',
            marginTop: 8,
          }}>
            <div>
              <div style={{ fontSize: 10, color: '#888' }}>24h Vol</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#e5e5e5' }}>${formatNumber(token.volume24h || 0)}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: '#888' }}>Buys</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#00C805' }}>{trades.filter(t => t.side === 'buy').length} txns</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: '#888' }}>Sells</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#FF3B30' }}>{trades.filter(t => t.side === 'sell').length} txns</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: '#888' }}>Buy/Sell Ratio</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#e5e5e5' }}>
                {trades.filter(t => t.side === 'buy').length / (trades.length || 1) * 100}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Buy/Sell buttons */}
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button
          onClick={() => window.location.href = `/terminal?tab=pulse&token=${token.tokenCa}`}
          style={{
            flex: 1,
            padding: '10px',
            background: '#00C805',
            border: 'none',
            color: '#0a0a0b',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 15,
            cursor: 'pointer',
          }}
        >
          Buy
        </button>
        <button
          style={{
            flex: 1,
            padding: '10px',
            background: '#FF3B30',
            border: 'none',
            color: '#fff',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 15,
            cursor: 'pointer',
          }}
        >
          Sell
        </button>
      </div>
    </div>
  );
}
