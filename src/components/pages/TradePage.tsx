'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

interface TradePageProps {
  initialTokenCa?: string;
}

export default function TradePage({ initialTokenCa }: TradePageProps) {
  const { status, walletAddress } = useAuth();
  const [tokenCa, setTokenCa] = useState(initialTokenCa || '');
  const [amount, setAmount] = useState('');
  const [isBuy, setIsBuy] = useState(true);
  const [slippage, setSlippage] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<any>(null);
  const [error, setError] = useState('');
  const [balance, setBalance] = useState('0');

  useEffect(() => {
    if (initialTokenCa) {
      setTokenCa(initialTokenCa);
    }
  }, [initialTokenCa]);

  useEffect(() => {
    if (status === 'connected' && walletAddress) {
      fetch('/api/wallet/balance', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
        .then(res => res.json())
        .then(data => setBalance(data.balance || '0'))
        .catch(() => setBalance('0'));
    }
  }, [status, walletAddress]);

  const getQuote = async () => {
    if (!tokenCa || !amount || parseFloat(amount) <= 0) {
      setError('Enter valid token and amount');
      return;
    }
    setLoading(true);
    setError('');
    setQuote(null);

    try {
      const res = await fetch('/api/trade/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ tokenCa, amount, isBuy, slippage }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setQuote(data);
      }
    } catch (e) {
      setError('Failed to get quote');
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
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          tokenCa,
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
      <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>
        <p>Connect your wallet to trade</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: '12px 0' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => setIsBuy(true)}
          style={{
            flex: 1,
            padding: '10px',
            background: isBuy ? '#00C805' : '#1a1a1a',
            color: isBuy ? '#0a0a0b' : '#888',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Buy
        </button>
        <button
          onClick={() => setIsBuy(false)}
          style={{
            flex: 1,
            padding: '10px',
            background: !isBuy ? '#FF3B30' : '#1a1a1a',
            color: !isBuy ? '#fff' : '#888',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Sell
        </button>
      </div>

      <div style={{ background: '#111', borderRadius: 12, padding: 16, marginBottom: 12 }}>
        <label style={{ color: '#888', fontSize: 13, display: 'block', marginBottom: 4 }}>
          Token Address
        </label>
        <input
          type="text"
          placeholder="0x..."
          value={tokenCa}
          onChange={(e) => setTokenCa(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            background: '#0a0a0b',
            border: '1px solid #2a2a2a',
            borderRadius: 8,
            color: '#e5e5e5',
            fontSize: 14,
            outline: 'none',
          }}
        />
      </div>

      <div style={{ background: '#111', borderRadius: 12, padding: 16, marginBottom: 12 }}>
        <label style={{ color: '#888', fontSize: 13, display: 'block', marginBottom: 4 }}>
          Amount (ETH)
        </label>
        <input
          type="number"
          placeholder="0.0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            background: '#0a0a0b',
            border: '1px solid #2a2a2a',
            borderRadius: 8,
            color: '#e5e5e5',
            fontSize: 14,
            outline: 'none',
          }}
        />
        <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
          Balance: {parseFloat(balance).toFixed(4)} ETH
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          {['0.1', '0.5', '1.0', '2.0'].map((a) => (
            <button
              key={a}
              onClick={() => setAmount(a)}
              style={{
                background: '#1a1a1a',
                border: 'none',
                color: '#aaa',
                padding: '4px 12px',
                borderRadius: 12,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              {a}
            </button>
          ))}
          <button
            onClick={() => setAmount((parseFloat(balance) * 0.95).toString())}
            style={{
              background: '#1a1a1a',
              border: 'none',
              color: '#aaa',
              padding: '4px 12px',
              borderRadius: 12,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            MAX
          </button>
        </div>
      </div>

      <div style={{ background: '#111', borderRadius: 12, padding: 16, marginBottom: 12 }}>
        <label style={{ color: '#888', fontSize: 13, display: 'block', marginBottom: 4 }}>
          Slippage (%)
        </label>
        <div style={{ display: 'flex', gap: 6 }}>
          {['0.1', '0.5', '1.0', '2.0'].map((s) => (
            <button
              key={s}
              onClick={() => setSlippage(parseFloat(s))}
              style={{
                background: slippage === parseFloat(s) ? '#00C805' : '#1a1a1a',
                color: slippage === parseFloat(s) ? '#0a0a0b' : '#aaa',
                border: 'none',
                padding: '4px 12px',
                borderRadius: 12,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              {s}%
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ color: '#FF3B30', padding: 12, background: '#1a1a1a', borderRadius: 8, marginBottom: 12 }}>
          {error}
        </div>
      )}

      {quote && (
        <div style={{ background: '#111', borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: '#888' }}>Expected Output</span>
            <span>{parseFloat(quote.quote).toFixed(6)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: '#888' }}>Min Received</span>
            <span>{parseFloat(quote.minAmount).toFixed(6)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: '#888' }}>Price Impact</span>
            <span style={{ color: quote.priceImpact > 3 ? '#FF3B30' : '#00C805' }}>
              {quote.priceImpact.toFixed(2)}%
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#888' }}>Route</span>
            <span>{quote.route.join(' → ')}</span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={getQuote}
          disabled={loading}
          style={{
            flex: 1,
            padding: '12px',
            background: '#1a1a1a',
            border: '1px solid #2a2a2a',
            color: '#aaa',
            borderRadius: 8,
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
            padding: '12px',
            background: isBuy ? '#00C805' : '#FF3B30',
            border: 'none',
            color: isBuy ? '#0a0a0b' : '#fff',
            borderRadius: 8,
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
