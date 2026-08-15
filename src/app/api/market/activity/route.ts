import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // In production, fetch from Redis or DB of recent swap events
  // For now, return a static set
  const activities = [
    { id: '1', type: 'buy', token: 'HOOD', amount: '0.42', trader: '0x28c1...6897', timestamp: Date.now() - 30000 },
    { id: '2', type: 'new', token: 'OGE', timestamp: Date.now() - 120000 },
    { id: '3', type: 'graduated', token: 'ROBIN', timestamp: Date.now() - 300000 },
    { id: '4', type: 'sell', token: 'FLOKI', amount: '0.31', trader: '0x7bdd...18cb', timestamp: Date.now() - 600000 },
  ];
  return NextResponse.json({ activities });
}
