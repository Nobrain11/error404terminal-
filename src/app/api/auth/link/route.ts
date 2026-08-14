import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/jwt';
import { getWalletAddress } from '@/lib/wallet';

export async function POST(req: NextRequest) {
  const { code } = await req.json();
  if (!code) {
    return NextResponse.json({ error: 'Code required' }, { status: 400 });
  }

  const loginCode = await prisma.loginCode.findUnique({
    where: { code },
    include: { user: true },
  });

  if (!loginCode || loginCode.used || loginCode.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Invalid or expired code' }, { status: 401 });
  }

  // Mark as used, associate user
  let userId = loginCode.userId;
  if (!userId) {
    // Create user if not already (should exist from bot)
    const user = await prisma.user.upsert({
      where: { telegramId: loginCode.telegramId },
      update: {},
      create: { telegramId: loginCode.telegramId },
    });
    userId = user.id;
  }

  await prisma.loginCode.update({
    where: { id: loginCode.id },
    data: { used: true, userId },
  });

  const token = await createSession(userId);
  const walletAddress = await getWalletAddress(userId);

  const user = await prisma.user.findUnique({ where: { id: userId } });

  return NextResponse.json({
    token,
    user: { id: user!.id, telegramId: user!.telegramId, username: user!.username },
    walletAddress,
  });
}
