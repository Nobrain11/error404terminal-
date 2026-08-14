import { NextRequest, NextResponse } from 'next/server';
import { getEthBalance, getWalletAddress } from '@/lib/wallet';
import { verifySession } from '@/lib/jwt';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const token = authHeader.split(' ')[1];
  const session = await verifySession(token);
  if (!session) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  const address = await getWalletAddress(session.userId);
  if (!address) {
    return NextResponse.json({ error: 'No wallet found' }, { status: 404 });
  }

  try {
    const balance = await getEthBalance(address);
    return NextResponse.json({ balance });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 });
  }
}
