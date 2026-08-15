import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ethers } from 'ethers';
import { RPC_URL } from '@/lib/constants';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pairAddress = searchParams.get('pair');
  const limit = parseInt(searchParams.get('limit') || '20');
  const since = parseInt(searchParams.get('since') || '0'); // timestamp in seconds

  if (!pairAddress) {
    return NextResponse.json({ error: 'Missing pair address' }, { status: 400 });
  }

  try {
    // Check if we have recent swaps in DB
    const where: any = { pairAddress };
    if (since > 0) {
      where.timestamp = { gte: new Date(since * 1000) };
    }

    let swaps = await prisma.swapEvent.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    // If no swaps in DB, fetch from chain
    if (swaps.length === 0 && since === 0) {
      try {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const contract = new ethers.Contract(
          pairAddress,
          [
            'event Swap(address indexed sender, uint amount0In, uint amount1In, uint amount0Out, uint amount1Out, address indexed to)',
          ],
          provider
        );
        const filter = contract.filters.Swap();
        const currentBlock = await provider.getBlockNumber();
        const fromBlock = Math.max(currentBlock - 1000, 0);
        const events = await contract.queryFilter(filter, fromBlock, currentBlock);

        for (const event of events) {
          const ev = event as any;
          const args = ev.args;
          if (!args) continue;
          const { amount0In, amount1In, amount0Out, amount1Out } = args;
          const isBuy = amount0In > BigInt(0) && amount0Out === BigInt(0);
          const ourAmount = isBuy ? amount0In : amount0Out;
          const otherAmount = isBuy ? amount1Out : amount1In;
          const rawRatio = parseFloat(ethers.formatEther(otherAmount)) / parseFloat(ethers.formatEther(ourAmount));

          await prisma.swapEvent.upsert({
            where: {
              txHash_logIndex: {
                txHash: ev.transactionHash,
                logIndex: ev.logIndex,
              },
            },
            update: {},
            create: {
              pairAddress,
              tokenCa: '',
              txHash: ev.transactionHash,
              logIndex: ev.logIndex,
              blockNumber: ev.blockNumber,
              timestamp: new Date((await provider.getBlock(ev.blockNumber))!.timestamp * 1000),
              isBuy,
              rawRatio: rawRatio.toString(),
              ourAmount: ourAmount.toString(),
              otherAmount: otherAmount.toString(),
            },
          });
        }

        swaps = await prisma.swapEvent.findMany({
          where: { pairAddress },
          orderBy: { timestamp: 'desc' },
          take: limit,
        });
      } catch (e) {
        console.error('Failed to fetch on-chain swaps:', e);
      }
    }

    const formatted = swaps.map((s: any) => ({
      txHash: s.txHash,
      time: s.timestamp,
      side: s.isBuy ? 'buy' : 'sell',
      usdSize: s.usdNormalizedPrice 
        ? (parseFloat(s.usdNormalizedPrice) * parseFloat(s.ourAmount)).toFixed(2)
        : '0.00',
      trader: '0x' + s.txHash.slice(0, 6) + '...' + s.txHash.slice(-4),
      marketCap: s.usdNormalizedPrice 
        ? (parseFloat(s.usdNormalizedPrice) * 1000000).toFixed(2)
        : '0',
    }));

    return NextResponse.json({ trades: formatted });
  } catch (error) {
    console.error('Transactions error:', error);
    return NextResponse.json({ error: 'Failed to fetch trades' }, { status: 500 });
  }
}
