import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { verifySession } from '@/lib/jwt';
import { getDecryptedPrivateKey } from '@/lib/wallet';

const UNIVERSAL_ROUTER = '0x...'; // Replace with actual address
const WETH_ADDRESS = '0x...'; // Replace with actual WETH address

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

  const { tokenCa, amount, isBuy, slippage = 0.5 } = await req.json();

  if (!tokenCa || !amount) {
    return NextResponse.json({ error: 'Missing tokenCa or amount' }, { status: 400 });
  }

  try {
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL!);
    const privateKey = await getDecryptedPrivateKey(session.userId);
    if (!privateKey) {
      return NextResponse.json({ error: 'No wallet found' }, { status: 404 });
    }
    const wallet = new ethers.Wallet(privateKey, provider);
    const address = await wallet.getAddress();

    // Parse amount as BigInt (in wei)
    const amountIn = ethers.parseEther(amount);

    // Simulate a 2% price impact (for demonstration)
    // quoteAmount = amountIn * 0.98  => using BigInt math: (amountIn * 98n) / 100n
    const quoteAmount = (amountIn * 98n) / 100n;

    // Compute min amount with slippage (slippage is a percentage, e.g., 0.5)
    const slippageBasisPoints = BigInt(Math.floor(slippage * 100)); // 0.5% -> 50 basis points
    const minAmount = (quoteAmount * (10000n - slippageBasisPoints)) / 10000n;

    return NextResponse.json({
      success: true,
      quote: quoteAmount.toString(),
      minAmount: minAmount.toString(),
      priceImpact: 2.0,
      route: ['Direct Swap'],
      gasEstimate: '200000',
    });
  } catch (error: any) {
    console.error('Quote error:', error);
    return NextResponse.json({ error: error.message || 'Quote failed' }, { status: 500 });
  }
}
