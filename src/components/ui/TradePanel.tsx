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
      <div className="trade-panel disconnected">
        <span>Wallet not connected</span>
        <button className="connect-btn">Connect Wallet</button>
      </div>
    );
  }

  const routeLabel = tokenState?.graduated ? 'Uniswap V4 (Graduated)' : 'Bags Bonding Curve';

  return (
    <div className="trade-panel">
      <div className="trade-header">Trade {token.symbol}</div>

      {/* Buy/Sell Toggle */}
      <div className="trade-toggle">
        <button
          onClick={() => setIsBuy(true)}
          className={`toggle-btn ${isBuy ? 'buy-active' : ''}`}
        >
          Buy
        </button>
        <button
          onClick={() => setIsBuy(false)}
          className={`toggle-btn ${!isBuy ? 'sell-active' : ''}`}
        >
          Sell
        </button>
      </div>

      {/* Amount */}
      <div className="trade-amount">
        <label>Amount (ETH)</label>
        <input
          type="number"
          placeholder="0.0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <div className="amount-presets">
          {['0.1', '0.5', '1.0', 'MAX'].map((a) => (
            <button
              key={a}
              onClick={() => setAmount(a === 'MAX' ? '100' : a)}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Slippage */}
      <div className="trade-slippage">
        <label>Slippage (%)</label>
        <div className="slippage-presets">
          {[0.5, 1, 2, 5].map((s) => (
            <button
              key={s}
              onClick={() => setSlippage(s)}
              className={slippage === s ? 'active' : ''}
            >
              {s}%
            </button>
          ))}
        </div>
      </div>

      {/* Route */}
      <div className="trade-route">
        Route: <span>{routeLabel}</span>
      </div>

      {/* Quote */}
      {quote && (
        <div className="trade-quote">
          <div>Expected output: <span>{parseFloat(quote.quote).toFixed(6)}</span></div>
          <div>Min received: <span>{parseFloat(quote.minAmount).toFixed(6)}</span></div>
          <div>
            Price impact:{' '}
            <span className={quote.priceImpact > 3 ? 'negative' : 'positive'}>
              {quote.priceImpact.toFixed(2)}%
            </span>
          </div>
        </div>
      )}

      {error && <div className="trade-error">{error}</div>}

      {/* Actions */}
      <div className="trade-actions">
        <button onClick={getQuote} disabled={loading}>
          {loading ? '...' : 'Quote'}
        </button>
        <button
          onClick={executeTrade}
          disabled={loading || !quote}
          className={isBuy ? 'buy-btn' : 'sell-btn'}
        >
          {loading ? 'Executing...' : isBuy ? 'Buy' : 'Sell'}
        </button>
      </div>
    </div>
  );
}
