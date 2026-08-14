import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET!;
const SESSION_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

export async function createSession(userId: number): Promise<string> {
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: SESSION_TTL });
  const expiresAt = new Date(Date.now() + SESSION_TTL * 1000);

  await prisma.session.create({
    data: { userId, token, expiresAt },
  });

  return token;
}

export async function verifySession(token: string): Promise<{ userId: number } | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });
    if (!session || session.expiresAt < new Date()) {
      return null;
    }
    return { userId: session.userId };
  } catch {
    return null;
  }
}

export async function deleteSession(token: string): Promise<void> {
  await prisma.session.deleteMany({ where: { token } });
}
