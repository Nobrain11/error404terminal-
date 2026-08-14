import { NextRequest, NextResponse } from 'next/server';
import { importWallet } from '@/lib/wallet';
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

  const { privateKeyOrPhrase } = await req.json();
  if (!privateKeyOrPhrase) {
    return NextResponse.json({ error: 'Missing private key or phrase' }, { status: 400 });
  }

  try {
    const result = await importWallet(session.userId, privateKeyOrPhrase);
    return NextResponse.json({ address: result.address });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Invalid key/phrase' }, { status: 400 });
  }
}
