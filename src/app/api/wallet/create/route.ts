import { NextRequest, NextResponse } from 'next/server';
import { createWallet } from '@/lib/wallet';
import { verifySession } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const token = authHeader.split(' ')[1];
  const session = await verifySession(token);
  if (!session) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  try {
    const result = await createWallet(session.userId);
    // Return only address, not private key for security
    return NextResponse.json({ address: result.address });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create wallet' }, { status: 500 });
  }
}
