import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pairAddress = searchParams.get('pair');
  const limit = parseInt(searchParams.get('limit') || '20');
  const side = searchParams.get('side'); // 'buy' or 'sell'

  if (!pairAddress) {
    return NextResponse.json({ error: 'Missing pair address' }, { status: 400 });
  }

  const where: any = { pairAddress };
  if (side === 'buy') where.isBuy = true;
  else if (side === 'sell') where.isBuy = false;

  const trades = await prisma.swapEvent.findMany({
    where,
    orderBy: { timestamp: 'desc' },
    take: limit,
  });

  // Format
  const formatted = trades.map(t => ({
    txHash: t.txHash,
    time: t.timestamp,
    side: t.isBuy ? 'buy' : 'sell',
    usdSize: t.usdNormalizedPrice ? (parseFloat(t.usdNormalizedPrice) * parseFloat(t.ourAmount)).toFixed(2) : 'N/A',
    trader: 'Unknown', // We don't store sender, but could decode
    marketCap: 'N/A', // Would need token supply
  }));

  return NextResponse.json({ trades: formatted });
}
