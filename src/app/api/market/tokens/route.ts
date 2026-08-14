import { NextRequest, NextResponse } from 'next/server';
import { DEX_SCREENER_API } from '@/lib/constants';

// Search terms for Robinhood Chain tokens
const SEARCH_TERMS = ['robinhood', 'rhood', 'rob', 'hood'];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '';
  const filter = searchParams.get('filter') || 'trending';

  try {
    let tokens: any[] = [];
    if (query) {
      // Search exact query
      const res = await fetch(`${DEX_SCREENER_API}?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.pairs) {
        tokens = data.pairs.filter((p: any) => p.chainId === 'robinhood');
      }
    } else {
      // Fetch by multiple search terms and dedupe
      const allPairs: any[] = [];
      for (const term of SEARCH_TERMS) {
        const res = await fetch(`${DEX_SCREENER_API}?q=${encodeURIComponent(term)}`);
        const data = await res.json();
        if (data.pairs) {
          allPairs.push(...data.pairs.filter((p: any) => p.chainId === 'robinhood'));
        }
        // avoid rate limiting
        await new Promise(r => setTimeout(r, 200));
      }
      // Dedupe by pairAddress
      const map = new Map();
      allPairs.forEach(p => map.set(p.pairAddress, p));
      tokens = Array.from(map.values());
    }

    // Apply filter (trending, new, top volume, gainers, losers)
    // Simple sorting
    switch (filter) {
      case 'new':
        tokens.sort((a, b) => (a.pairCreatedAt || 0) - (b.pairCreatedAt || 0));
        break;
      case 'topvolume':
        tokens.sort((a, b) => (b.volume?.h24 || 0) - (a.volume?.h24 || 0));
        break;
      case 'gainers':
        tokens.sort((a, b) => (b.priceChange?.h24 || 0) - (a.priceChange?.h24 || 0));
        break;
      case 'losers':
        tokens.sort((a, b) => (a.priceChange?.h24 || 0) - (b.priceChange?.h24 || 0));
        break;
      default: // trending
        tokens.sort((a, b) => (b.volume?.h24 || 0) - (a.volume?.h24 || 0));
    }

    // Format token shape
    const formatted = tokens.map((p: any) => ({
      pairAddress: p.pairAddress,
      tokenCa: p.baseToken?.address || '',
      name: p.baseToken?.name || '',
      symbol: p.baseToken?.symbol || '',
      dexId: p.dexId || 'unknown',
      priceUsd: p.priceUsd || '0',
      change: p.priceChange?.h24 || 0,
      mcap: p.marketCap || '0',
      liquidity: p.liquidity?.usd || '0',
      volume24h: p.volume?.h24 || '0',
      age: p.pairCreatedAt ? Math.floor((Date.now() - p.pairCreatedAt) / 1000 / 60) : 0, // minutes
    }));

    return NextResponse.json({ tokens: formatted });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch tokens' }, { status: 500 });
  }
}
