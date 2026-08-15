import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { verifySession } from '@/lib/jwt';
import { getDecryptedPrivateKey } from '@/lib/wallet';
import { prisma } from '@/lib/prisma';

const UNIVERSAL_ROUTER = '0x...'; // Update with actual address
const WETH_ADDRESS = '0x...'; // Update with actual WETH address

// Minimal ABI for UniversalRouter swap (placeholder – use full ABI)
const ROUTER_ABI = [
  'function swap((bytes commands, bytes[] inputs, uint256 deadline)) external payable',
];

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

  const { tokenCa, amount, isBuy, minAmount, slippage = 0.5 } = await req.json();

  if (!tokenCa || !amount || !minAmount) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  try {
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL!);
    const privateKey = await getDecryptedPrivateKey(session.userId);
    if (!privateKey) {
      return NextResponse.json({ error: 'No wallet found' }, { status: 404 });
    }
    const wallet = new ethers.Wallet(privateKey, provider);
    const address = await wallet.getAddress();

    // Build swap command (placeholder – replace with actual UniversalRouter call)
    const router = new ethers.Contract(UNIVERSAL_ROUTER, ROUTER_ABI, wallet);
    const amountIn = ethers.parseEther(amount);
    const minOut = ethers.parseEther(minAmount);

    // Prepare transaction
    const tx = await router.swap(
      {
        commands: '0x00', // placeholder command
        inputs: [],
        deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 min deadline
      },
      {
        value: isBuy ? amountIn : 0,
        gasLimit: 300000,
      }
    );

    // Wait for confirmation
    const receipt = await tx.wait();

    // Save transaction to database
    await prisma.transaction.create({
      data: {
        walletId: (await prisma.wallet.findFirst({ where: { userId: session.userId } }))!.id,
        txHash: receipt.hash,
        type: isBuy ? 'buy' : 'sell',
        tokenCa,
        amount,
        timestamp: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    });
  } catch (error: any) {
    console.error('Execution error:', error);
    return NextResponse.json({ error: error.message || 'Transaction failed' }, { status: 500 });
  }
}
