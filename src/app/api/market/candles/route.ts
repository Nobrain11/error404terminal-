import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ethers, EventLog } from 'ethers';
import { RPC_URL } from '@/lib/constants';

async function fetchSwapEvents(pairAddress: string, fromBlock: number, toBlock: number) {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(
    pairAddress,
    [
      'event Swap(address indexed sender, uint amount0In, uint amount1In, uint amount0Out, uint amount1Out, address indexed to)',
    ],
    provider
  );
  const filter = contract.filters.Swap();
  const events = await contract.queryFilter(filter, fromBlock, toBlock);
  return events;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pairAddress = searchParams.get('pair');
  const timeframe = searchParams.get('timeframe') || '1H';

  if (!pairAddress) {
    return NextResponse.json({ error: 'Missing pair address' }, { status: 400 });
  }

  try {
    const lastEvent = await prisma.swapEvent.findFirst({
      where: { pairAddress },
      orderBy: { blockNumber: 'desc' },
    });
    const lastBlock = lastEvent ? lastEvent.blockNumber : 0;

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const currentBlock = await provider.getBlockNumber();

    if (currentBlock > lastBlock) {
      const events = await fetchSwapEvents(pairAddress, lastBlock + 1, currentBlock);
      for (const event of events) {
        // Cast to any to access properties that exist at runtime
        const ev = event as any;
        const args = ev.args;
        if (!args) continue;
        const { amount0In, amount1In, amount0Out, amount1Out } = args;
        const isBuy = amount0In > BigInt(0) && amount0Out === BigInt(0);
        const ourAmount = isBuy ? amount0In : amount0Out;
        const otherAmount = isBuy ? amount1Out : amount1In;
        const rawRatio = parseFloat(ethers.formatEther(otherAmount)) / parseFloat(ethers.formatEther(ourAmount));

        await prisma.swapEvent.create({
          data: {
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
    }

    const now = new Date();
    let startTime = new Date();
    switch (timeframe) {
      case '1m': startTime.setMinutes(now.getMinutes() - 1); break;
      case '5m': startTime.setMinutes(now.getMinutes() - 5); break;
      case '15m': startTime.setMinutes(now.getMinutes() - 15); break;
      case '30m': startTime.setMinutes(now.getMinutes() - 30); break;
      case '1H': startTime.setHours(now.getHours() - 1); break;
      case '4H': startTime.setHours(now.getHours() - 4); break;
      case '1D': startTime.setDate(now.getDate() - 1); break;
      case '1W': startTime.setDate(now.getDate() - 7); break;
      default: startTime.setHours(now.getHours() - 1);
    }

    const swaps = await prisma.swapEvent.findMany({
      where: {
        pairAddress,
        timestamp: { gte: startTime },
      },
      orderBy: { timestamp: 'asc' },
    });

    if (swaps.length === 0) {
      return NextResponse.json({ candles: [], error: 'No on-chain trades available for this period.' });
    }

    const bucketSize = (() => {
      switch (timeframe) {
        case '1m': return 60 * 1000;
        case '5m': return 5 * 60 * 1000;
        case '15m': return 15 * 60 * 1000;
        case '30m': return 30 * 60 * 1000;
        case '1H': return 60 * 60 * 1000;
        case '4H': return 4 * 60 * 60 * 1000;
        case '1D': return 24 * 60 * 60 * 1000;
        case '1W': return 7 * 24 * 60 * 60 * 1000;
        default: return 60 * 60 * 1000;
      }
    })();

    const buckets: { [key: string]: any } = {};
    for (const swap of swaps) {
      const ts = new Date(swap.timestamp).getTime();
      const bucketTs = Math.floor(ts / bucketSize) * bucketSize;
      const key = bucketTs.toString();
      if (!buckets[key]) {
        buckets[key] = {
          open: parseFloat(swap.rawRatio),
          high: parseFloat(swap.rawRatio),
          low: parseFloat(swap.rawRatio),
          close: parseFloat(swap.rawRatio),
          volume: 0,
          trades: 0,
        };
      }
      const price = parseFloat(swap.rawRatio);
      const b = buckets[key];
      if (price < b.low) b.low = price;
      if (price > b.high) b.high = price;
      b.close = price;
      b.volume += parseFloat(swap.otherAmount);
      b.trades += 1;
    }

    const candles = Object.keys(buckets).sort().map(key => {
      const b = buckets[key];
      return {
        time: parseInt(key) / 1000,
        open: b.open,
        high: b.high,
        low: b.low,
        close: b.close,
        volume: b.volume,
        tradeCount: b.trades,
      };
    });

    return NextResponse.json({
      candles,
      normalized: false,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to build candles' }, { status: 500 });
  }
}
