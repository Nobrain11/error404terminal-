import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tokenCa = searchParams.get('token');
  const timeframe = searchParams.get('timeframe') || '1H';

  if (!tokenCa) {
    return NextResponse.json({ error: 'Missing token CA' }, { status: 400 });
  }

  // Simple price snapshot history (fallback)
  const now = new Date();
  let startTime = new Date();
  switch (timeframe) {
    case '1H': startTime.setHours(now.getHours() - 1); break;
    case '4H': startTime.setHours(now.getHours() - 4); break;
    case '1D': startTime.setDate(now.getDate() - 1); break;
    default: startTime.setHours(now.getHours() - 1);
  }

  const snapshots = await prisma.priceSnapshot.findMany({
    where: {
      tokenCa,
      timestamp: { gte: startTime },
    },
    orderBy: { timestamp: 'asc' },
  });

  return NextResponse.json({ history: snapshots });
}
