import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyTelegramInitData, parseTelegramUser } from '@/lib/telegram-auth';
import { createSession } from '@/lib/jwt';
import { getWalletAddress } from '@/lib/wallet';

export async function POST(req: NextRequest) {
  const { initData } = await req.json();
  const botToken = process.env.BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  if (!verifyTelegramInitData(initData, botToken)) {
    return NextResponse.json({ error: 'Invalid Telegram data' }, { status: 401 });
  }

  const userData = parseTelegramUser(initData);
  if (!userData) {
    return NextResponse.json({ error: 'Invalid user data' }, { status: 400 });
  }

  // Upsert user
  const user = await prisma.user.upsert({
    where: { telegramId: userData.id },
    update: {
      username: userData.username,
      firstName: userData.firstName,
      lastName: userData.lastName,
    },
    create: {
      telegramId: userData.id,
      username: userData.username,
      firstName: userData.firstName,
      lastName: userData.lastName,
    },
  });

  // Create session
  const token = await createSession(user.id);

  // Get wallet address if exists
  const walletAddress = await getWalletAddress(user.id);

  return NextResponse.json({
    token,
    user: { id: user.id, telegramId: user.telegramId, username: user.username },
    walletAddress,
  });
}
