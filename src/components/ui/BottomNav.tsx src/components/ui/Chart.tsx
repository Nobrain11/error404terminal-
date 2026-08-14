'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, HistogramData, Time } from 'lightweight-charts';

interface ChartProps {
  pairAddress: string;
  tokenCa: string;
  tokenSymbol: string;
  currentPrice: number;
  totalSupply?: string;
}

type Timeframe = '1m' | '5m' | '15m' | '30m' | '1H' | '4H' | '1D' | '1W';

export default function Chart({ pairAddress, tokenCa, tokenSymbol, currentPrice, totalSupply }: ChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const [candles, setCandles] = useState<CandlestickData[]>([]);
  const [volumeData, setVolumeData] = useState<HistogramData[]>([]);
  const [timeframe, setTimeframe] = useState<Timeframe>('1H');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMCap, setShowMCap] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [normalized, setNormalized] = useState(false);

  // Fetch candles
  useEffect(() => {
    if (!pairAddress) return;

    const fetchCandles = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/market/candles?pair=${encodeURIComponent(pairAddress)}&timeframe=${timeframe}`);
        const data = await res.json();
        if (data.error) {
          setError(data.error);
          setCandles([]);
          setVolumeData([]);
        } else if (data.candles && data.candles.length > 0) {
          // Convert to lightweight-charts format
          const formattedCandles: CandlestickData[] = data.candles.map((c: any) => ({
            time: c.time as Time,
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
          }));
          const formattedVolume: HistogramData[] = data.candles.map((c: any) => ({
            time: c.time as Time,
            value: c.volume || 0,
            color: c.close >= c.open ? '#00C805' : '#FF3B30',
          }));
          setCandles(formattedCandles);
          setVolumeData(formattedVolume);
          setNormalized(data.normalized || false);
        } else {
          setError('No trades in this period.');
          setCandles([]);
          setVolumeData([]);
        }
      } catch (e) {
        setError('Failed to load chart data.');
      }
      setLoading(false);
    };

    fetchCandles();
  }, [pairAddress, timeframe]);

  // Create/update chart
  useEffect(() => {
    if (!chartContainerRef.current) return;
    if (candles.length === 0) return;

    // Create chart
    if (!chartRef.current) {
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 400,
        layout: {
          background: { color: '#0a0a0b' },
          textColor: '#888',
        },
        grid: {
          vertLines: { color: '#1a1a1a' },
          horzLines: { color: '#1a1a1a' },
        },
        crosshair: {
          mode: 0,
        },
        rightPriceScale: {
          borderColor: '#1a1a1a',
        },
        timeScale: {
          borderColor: '#1a1a1a',
          timeVisible: true,
          secondsVisible: false,
        },
      });

      chartRef.current = chart;

      // Candlestick series
      const candleSeries = chart.addCandlestickSeries({
        upColor: '#00C805',
        downColor: '#FF3B30',
        borderVisible: false,
        wickUpColor: '#00C805',
        wickDownColor: '#FF3B30',
      });
      candleSeriesRef.current = candleSeries;

      // Volume series (separate pane)
      const volumeSeries = chart.addHistogramSeries({
        color: '#00C805',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: 'volume',
      });
      volumeSeriesRef.current = volumeSeries;

      // Resize handler
      const resizeObserver = new ResizeObserver(() => {
        if (chartRef.current && chartContainerRef.current) {
          chartRef.current.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      });
      resizeObserver.observe(chartContainerRef.current);

      return () => {
        resizeObserver.disconnect();
        if (chartRef.current) {
          chartRef.current.remove();
          chartRef.current = null;
          candleSeriesRef.current = null;
          volumeSeriesRef.current = null;
        }
      };
    }

    // Update data
    if (candleSeriesRef.current) {
      candleSeriesRef.current.setData(candles);
    }
    if (volumeSeriesRef.current) {
      volumeSeriesRef.current.setData(volumeData);
    }

    // Fit content
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }

  }, [candles, volumeData]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle MCap mode
  const toggleMCap = () => {
    if (!totalSupply) {
      alert('Total supply not available for this token.');
      return;
    }
    setShowMCap(!showMCap);
    // Recalculate prices to MCap
    if (candleSeriesRef.current && candles.length > 0) {
      const supply = parseFloat(totalSupply);
      const updatedCandles = candles.map(c => ({
        ...c,
        open: c.open * supply,
        high: c.high * supply,
        low: c.low * supply,
        close: c.close * supply,
      }));
      candleSeriesRef.current.setData(updatedCandles);
      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!chartContainerRef.current) return;
    if (!document.fullscreenElement) {
      chartContainerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Timeframe buttons
  const timeframes: Timeframe[] = ['1m', '5m', '15m', '30m', '1H', '4H', '1D', '1W'];

  if (loading && candles.length === 0) {
    return (
      <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', background: '#0a0a0b', borderRadius: 8 }}>
        Loading chart...
      </div>
    );
  }

  if (error && candles.length === 0) {
    return (
      <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF3B30', background: '#0a0a0b', borderRadius: 8 }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ background: '#0a0a0b', borderRadius: 8, overflow: 'hidden' }}>
      {/* Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: '8px 12px', background: '#111', borderBottom: '1px solid #1a1a1a', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              style={{
                background: timeframe === tf ? '#00C805' : 'transparent',
                color: timeframe === tf ? '#0a0a0b' : '#888',
                border: '1px solid #2a2a2a',
                borderRadius: 4,
                padding: '2px 10px',
                fontSize: 12,
                cursor: 'pointer',
                fontWeight: timeframe === tf ? 600 : 400,
              }}
            >
              {tf}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <button
            onClick={toggleMCap}
            style={{
              background: showMCap ? '#00C805' : 'transparent',
              color: showMCap ? '#0a0a0b' : '#888',
              border: '1px solid #2a2a2a',
              borderRadius: 4,
              padding: '2px 10px',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            {showMCap ? 'MCap' : 'Price'}
          </button>
          <button
            onClick={toggleFullscreen}
            style={{
              background: 'transparent',
              color: '#888',
              border: '1px solid #2a2a2a',
              borderRadius: 4,
              padding: '2px 10px',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            ⛶
          </button>
        </div>
      </div>

      {/* Chart container */}
      <div
        ref={chartContainerRef}
        style={{
          width: '100%',
          height: isFullscreen ? '90vh' : 400,
          background: '#0a0a0b',
          position: 'relative',
        }}
      />

      {/* Normalization notice */}
      {normalized && (
        <div style={{ padding: '4px 12px', fontSize: 11, color: '#666', background: '#111', borderTop: '1px solid #1a1a1a' }}>
          ⚡ USD values normalized using reference price
        </div>
      )}

      {/* Current price overlay */}
      {currentPrice > 0 && candles.length > 0 && (
        <div style={{ padding: '4px 12px', fontSize: 13, color: '#aaa', background: '#111', borderTop: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between' }}>
          <span>Current: ${currentPrice.toFixed(6)}</span>
          <span style={{ color: '#888', fontSize: 11 }}>{tokenSymbol}</span>
        </div>
      )}
    </div>
  );
}
