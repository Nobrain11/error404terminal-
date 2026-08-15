import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { verifySession } from '@/lib/jwt';
import { getDecryptedPrivateKey } from '@/lib/wallet';
import { prisma } from '@/lib/prisma';

// ============================================================
// REPLACE THESE WITH REAL ADDRESSES ON ROBINHOOD CHAIN
// ============================================================
const UNIVERSAL_ROUTER = '0x...'; // UniversalRouter V4 address
const WETH_ADDRESS = '0x...';     // Wrapped ETH address
const FACTORY_ADDRESS = '0x...';  // Uniswap V4 PoolManager factory
// ============================================================

// Uniswap V4 UniversalRouter ABI (minimal)
const ROUTER_ABI = [
  'function swap((bytes commands, bytes[] inputs, uint256 deadline)) external payable',
  'function approve(address token, address spender, uint256 amount) external returns (bool)',
];

// ERC20 ABI for approvals
const ERC20_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function balanceOf(address owner) external view returns (uint256)',
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

    const amountIn = ethers.parseEther(amount);
    const minOut = ethers.parseEther(minAmount);
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 min

    // --- If selling, need to approve router to spend token ---
    if (!isBuy) {
      const tokenContract = new ethers.Contract(tokenCa, ERC20_ABI, wallet);
      const allowance = await tokenContract.allowance(address, UNIVERSAL_ROUTER);
      if (allowance < amountIn) {
        console.log('Approving router...');
        const approveTx = await tokenContract.approve(UNIVERSAL_ROUTER, amountIn);
        await approveTx.wait();
      }
    }

    // --- Build swap command (Uniswap V4) ---
    // Simplified: using the router's swap function directly.
    // In production, you need to build the exact command bytes and inputs.
    // For now, we use a direct swap via the router's swap function.
    // This assumes a simple ETH <-> token swap.

    const router = new ethers.Contract(UNIVERSAL_ROUTER, ROUTER_ABI, wallet);

    // For buying: send ETH, receive token
    // For selling: send token, receive ETH
    // We'll use the router's swap function with a single command.

    // Build the swap command (simplified for single-hop)
    const commands = '0x00'; // placeholder – replace with actual commands
    const inputs: any[] = [];

    // Actually, we need to use the proper command structure.
    // For V4, we need to use the PoolManager and actions.
    // Since I don't have the exact ABI, I'll provide a generic example.

    // Instead, let's use a simple Uniswap V2-like swap via the router if it supports.
    // Since we don't have the exact ABI, I'll provide a safer approach:
    // Use the router's "swap" function with a "SwapParams" struct.

    // For the sake of this example, we'll use the router's swap function with minimal parameters.
    // This must be replaced with actual V4 command building.

    // Example for buying:
    // const params = {
    //   commands: '0x00',
    //   inputs: [],
    //   deadline: deadline
    // };
    // const tx = await router.swap(params, { value: amountIn });

    // For now, to avoid blocking, I'll throw an error explaining what to do.
    throw new Error(
      '⚠️ Real trading requires the correct UniversalRouter address and ABI. ' +
      'Please replace UNIVERSAL_ROUTER with the actual address and build proper swap commands. ' +
      'See https://docs.uniswap.org/contracts/v4/guides/universal-router for details.'
    );

    // The following code will not run; it's just to show the structure.

    // const tx = await router.swap(
    //   {
    //     commands: '0x00',
    //     inputs: [],
    //     deadline,
    //   },
    //   {
    //     value: isBuy ? amountIn : 0,
    //     gasLimit: 500000,
    //   }
    // );

    // const receipt = await tx.wait();

    // await prisma.transaction.create({
    //   data: {
    //     walletId: (await prisma.wallet.findFirst({ where: { userId: session.userId } }))!.id,
    //     txHash: receipt.hash,
    //     type: isBuy ? 'buy' : 'sell',
    //     tokenCa,
    //     amount,
    //     timestamp: new Date(),
    //   },
    // });

    // return NextResponse.json({
    //   success: true,
    //   txHash: receipt.hash,
    //   blockNumber: receipt.blockNumber,
    // });
  } catch (error: any) {
    console.error('Execution error:', error);
    return NextResponse.json({ error: error.message || 'Transaction failed' }, { status: 500 });
  }
}
