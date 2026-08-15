'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Token } from '@/lib/types';

interface TradePanelProps {
  token: Token;
}

export default function TradePanel({ token }: TradePanelProps) {
  const { status, walletAddress } = useAuth();
  const [amount, setAmount] = useState('');
  const [slippage, setSlippage] = useState(1);
  const [isBuy, setIsBuy] = useState(true);
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<any>(null);
  const [tokenState, setTokenState] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    const fetchState = async () => {
      try {
        const res = await fetch(`/api/trade/check-state?tokenCa=${token.tokenCa}`);
        const data = await res.json();
        setTokenState(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchState();
  }, [token]);

  const getQuote = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Enter amount');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/trade/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenCa: token.tokenCa,
          amount,
          isBuy,
          slippage,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setQuote(data);
      }
    } catch (e) {
      setError('Quote failed');
    }
    setLoading(false);
  };

  const executeTrade = async () => {
    if (!quote) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/trade/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenCa: token.tokenCa,
          amount,
          isBuy,
          minAmount: quote.minAmount,
          slippage,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        alert(`✅ Trade executed!\nTx: ${data.txHash}`);
        setQuote(null);
        setAmount('');
      }
    } catch (e) {
      setError('Transaction failed');
    }
    setLoading(false);
  };

  if (status !== 'connected') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: '#666',
        gap: '8px',
      }}>
        <span style={{ fontSize: '14px' }}>Wallet not connected</span>
        <button style={{
          background: '#00C805',
          border: 'none',
          color: '#0a0a0b',
          padding: '6px 20px',
          borderRadius: '16px',
          fontWeight: 600,
          fontSize: '13px',
          cursor: 'pointer',
        }}>
          Connect Wallet
        </button>
      </div>
    );
  }

  const routeLabel = tokenState?.graduated ? 'Uniswap V4 (Graduated)' : 'Bags Bonding Curve';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ fontWeight: 600, fontSize: '16px', color: '#e5e5e5' }}>
        Trade {token.symbol}
      </div>

      {/* Buy/Sell toggle */}
      <div style={{ display: 'flex', gap: '4px', background: '#111', borderRadius: '8px', padding: '2px' }}>
        <button
          onClick={() => setIsBuy(true)}
          style={{
            flex: 1,
            padding: '6px',
            borderRadius: '6px',
            background: isBuy ? '#00C805' : 'transparent',
            color: isBuy ? '#0a0a0b' : '#888',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Buy
        </button>
        <button
          onClick={() => setIsBuy(false)}
          style={{
            flex: 1,
            padding: '6px',
            borderRadius: '6px',
            background: !isBuy ? '#FF3B30' : 'transparent',
            color: !isBuy ? '#fff' : '#888',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Sell
        </button>
      </div>

      {/* Amount */}
      <div>
        <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>Amount (ETH)</label>
        <input
          type="number"
          placeholder="0.0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            background: '#111',
            border: '1px solid #1a1a1a',
            borderRadius: '8px',
            color: '#e5e5e5',
            fontSize: '14px',
            outline: 'none',
          }}
        />
        <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
          {['0.1', '0.5', '1.0', 'MAX'].map((a) => (
            <button
              key={a}
              onClick={() => setAmount(a === 'MAX' ? '100' : a)}
              style={{
                background: '#1a1a1a',
                border: 'none',
                color: '#aaa',
                padding: '2px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Slippage */}
      <div>
        <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>Slippage (%)</label>
        <div style={{ display: 'flex', gap: '4px' }}>
          {[0.5, 1, 2, 5].map((s) => (
            <button
              key={s}
              onClick={() => setSlippage(s)}
              style={{
                padding: '2px 10px',
                borderRadius: '12px',
                background: slippage === s ? '#00C805' : '#1a1a1a',
                color: slippage === s ? '#0a0a0b' : '#aaa',
                border: 'none',
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              {s}%
            </button>
          ))}
        </div>
      </div>

      {/* Route */}
      <div style={{ fontSize: '12px', color: '#888', padding: '6px', background: '#111', borderRadius: '6px' }}>
        Route: <span style={{ color: '#e5e5e5' }}>{routeLabel}</span>
      </div>

      {/* Quote */}
      {quote && (
        <div style={{ fontSize: '13px', background: '#111', padding: '8px', borderRadius: '6px' }}>
          <div>Expected output: <span style={{ color: '#e5e5e5' }}>{parseFloat(quote.quote).toFixed(6)}</span></div>
          <div>Min received: <span style={{ color: '#e5e5e5' }}>{parseFloat(quote.minAmount).toFixed(6)}</span></div>
          <div>
            Price impact:{' '}
            <span style={{ color: quote.priceImpact > 3 ? '#FF3B30' : '#00C805' }}>
              {quote.priceImpact.toFixed(2)}%
            </span>
          </div>
        </div>
      )}

      {error && (
        <div style={{ color: '#FF3B30', fontSize: '13px', background: '#1a1a1a', padding: '6px', borderRadius: '6px' }}>
          {error}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={getQuote}
          disabled={loading}
          style={{
            flex: 1,
            padding: '8px',
            background: '#1a1a1a',
            border: '1px solid #1a1a1a',
            color: '#aaa',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: loading ? 'default' : 'pointer',
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading ? '...' : 'Quote'}
        </button>
        <button
          onClick={executeTrade}
          disabled={loading || !quote}
          style={{
            flex: 1,
            padding: '8px',
            background: isBuy ? '#00C805' : '#FF3B30',
            border: 'none',
            color: isBuy ? '#0a0a0b' : '#fff',
            borderRadius: '8px',
            fontWeight: 700,
            cursor: loading || !quote ? 'default' : 'pointer',
            opacity: loading || !quote ? 0.5 : 1,
          }}
        >
          {loading ? 'Executing...' : isBuy ? 'Buy' : 'Sell'}
        </button>
      </div>
    </div>
  );
}
