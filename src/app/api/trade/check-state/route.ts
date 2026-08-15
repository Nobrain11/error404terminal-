import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { RPC_URL, BAGS_LENS_ADDRESS } from '@/lib/constants';

const BAGS_LENS_ABI = [
  'function getTokenState(address token) external view returns (uint8, bool, uint256, uint256, uint256, uint256)',
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tokenCa = searchParams.get('tokenCa');
  if (!tokenCa) {
    return NextResponse.json({ error: 'Missing tokenCa' }, { status: 400 });
  }

  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const lens = new ethers.Contract(BAGS_LENS_ADDRESS, BAGS_LENS_ABI, provider);
    const result = await lens.getTokenState(tokenCa);
    // result: [state, graduated, mcap, liq, volume, price]
    const state = result[0];
    const graduated = result[1];
    const mcap = ethers.formatEther(result[2]);
    const liq = ethers.formatEther(result[3]);
    const volume = ethers.formatEther(result[4]);
    const price = ethers.formatEther(result[5]);

    return NextResponse.json({
      state: state.toString(),
      graduated: graduated,
      mcap,
      liq,
      volume,
      price,
    });
  } catch (error: any) {
    console.error('Check state error:', error);
    return NextResponse.json({ error: error.message || 'Failed to check token state' }, { status: 500 });
  }
}
