import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ethers } from 'ethers';
import { RPC_URL } from '@/lib/constants';

// This endpoint builds candles from on-chain Swap events.
// It assumes we have stored SwapEvent rows via a background sync.
// For simplicity, we will also fetch new events on the fly (caching).

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
  const timeframe = searchParams.get('timeframe') || '1H'; // 1m,5m,15m,30m,1H,4H,1D,1W

  if (!pairAddress) {
    return NextResponse.json({ error: 'Missing pair address' }, { status: 400 });
  }

  try {
    // 1. Find last cached block for this pair
    const lastEvent = await prisma.swapEvent.findFirst({
      where: { pairAddress },
      orderBy: { blockNumber: 'desc' },
    });
    const lastBlock = lastEvent ? lastEvent.blockNumber : 0;

    // 2. Get current block number
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const currentBlock = await provider.getBlockNumber();

    // 3. Fetch new events from lastBlock+1 to currentBlock
    if (currentBlock > lastBlock) {
      const events = await fetchSwapEvents(pairAddress, lastBlock + 1, currentBlock);
      // Decode and store
      for (const event of events) {
        const args = event.args as any;
        if (!args) continue;
        const { amount0In, amount1In, amount0Out, amount1Out } = args;
        // Determine if buy/sell (simple heuristic: if amount0In > 0 and amount0Out == 0, it's buy of token0)
        const isBuy = amount0In > 0n && amount0Out === 0n;
        const ourAmount = isBuy ? amount0In : amount0Out; // token amount
        const otherAmount = isBuy ? amount1Out : amount1In; // paired token amount
        const rawRatio = parseFloat(ethers.formatEther(otherAmount)) / parseFloat(ethers.formatEther(ourAmount));

        await prisma.swapEvent.create({
          data: {
            pairAddress,
            tokenCa: '', // Could be derived from pair, but we'll store later
            txHash: event.transactionHash,
            logIndex: event.logIndex,
            blockNumber: event.blockNumber,
            timestamp: new Date((await provider.getBlock(event.blockNumber))!.timestamp * 1000),
            isBuy,
            rawRatio: rawRatio.toString(),
            ourAmount: ourAmount.toString(),
            otherAmount: otherAmount.toString(),
          },
        });
      }
    }

    // 4. Query cached swaps within time range
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

    // 5. Bucket into time intervals (align to timeframe start)
    // For simplicity, we'll group by minute/hour/day accordingly.
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
      b.volume += parseFloat(swap.otherAmount); // volume in ETH or paired token
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

    // For normalizing USD price, we need a reference price.
    // We'll use the most recent swap's rawRatio and a known USD price.
    // For simplicity, we will fetch current USD price from DexScreener.
    // We'll assume the user has a token CA and we can fetch.
    // We'll just return raw ratios; client can multiply.

    return NextResponse.json({
      candles,
      normalized: false, // client will fetch reference price separately
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to build candles' }, { status: 500 });
  }
}
