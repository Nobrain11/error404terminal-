'use client';

import { useEffect, useState } from 'react';

interface TokenPrice {
  symbol: string;
  change: number;
}

export default function TickerTape() {
  const [tickers, setTickers] = useState<TokenPrice[]>([]);

  useEffect(() => {
    const fetchTickers = async () => {
      try {
        const res = await fetch('/api/market/tokens?filter=trending');
        const data = await res.json();
        if (data.tokens) {
          const top = data.tokens.slice(0, 10).map((t: any) => ({
            symbol: t.symbol,
            change: t.change,
          }));
          setTickers(top);
        }
      } catch {
        // ignore
      }
    };
    fetchTickers();
    const interval = setInterval(fetchTickers, 30000);
    return () => clearInterval(interval);
  }, []);

  if (tickers.length === 0) return null;

  return (
    <div style={{ background: '#111', padding: '6px 0', borderBottom: '1px solid #1a1a1a', overflow: 'hidden', whiteSpace: 'nowrap' }}>
      <div style={{ display: 'inline-block', animation: 'scroll 30s linear infinite' }}>
        {tickers.map((t, i) => (
          <span key={i} style={{ margin: '0 16px', fontSize: 13, color: t.change >= 0 ? '#00C805' : '#FF3B30' }}>
            {t.symbol} {t.change > 0 ? '+' : ''}{t.change.toFixed(2)}%
          </span>
        ))}
      </div>
      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
