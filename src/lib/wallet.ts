import crypto from 'crypto';
import { ethers } from 'ethers';
import { prisma } from './prisma';

const ENCRYPTION_KEY = process.env.WALLET_ENCRYPTION_KEY!; // 32 bytes hex or base64
const ALGORITHM = 'aes-256-gcm';

// Derive key from hex or base64
function getKey(): Buffer {
  if (ENCRYPTION_KEY.length === 64) {
    return Buffer.from(ENCRYPTION_KEY, 'hex');
  }
  return Buffer.from(ENCRYPTION_KEY, 'base64');
}

function encrypt(text: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString('hex');
}

function decrypt(encryptedHex: string): string {
  const key = getKey();
  const data = Buffer.from(encryptedHex, 'hex');
  const iv = data.subarray(0, 16);
  const authTag = data.subarray(16, 32);
  const encrypted = data.subarray(32);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  return decipher.update(encrypted) + decipher.final('utf8');
}

export function encryptPrivateKey(privateKey: string): string {
  return encrypt(privateKey);
}

export function decryptPrivateKey(encrypted: string): string {
  return decrypt(encrypted);
}

export function encryptPhrase(phrase: string): string {
  return encrypt(phrase);
}

export function decryptPhrase(encrypted: string): string {
  return decrypt(encrypted);
}

export async function createWallet(userId: number): Promise<{ address: string; privateKey: string; mnemonic?: string }> {
  const wallet = ethers.Wallet.createRandom();
  const address = wallet.address;
  const privateKey = wallet.privateKey;
  const mnemonic = wallet.mnemonic?.phrase;

  const encryptedKey = encryptPrivateKey(privateKey);
  const encryptedPhrase = mnemonic ? encryptPhrase(mnemonic) : null;

  await prisma.wallet.create({
    data: {
      userId,
      address,
      encryptedKey,
      encryptedPhrase,
    },
  });

  // Also create a portfolio entry for this wallet? Not needed now.
  return { address, privateKey, mnemonic };
}

export async function importWallet(userId: number, privateKeyOrPhrase: string): Promise<{ address: string; privateKey: string; mnemonic?: string }> {
  let wallet: ethers.Wallet;
  let mnemonic: string | undefined;
  // Check if it's a mnemonic (12 or 24 words)
  if (privateKeyOrPhrase.split(' ').length >= 12) {
    wallet = ethers.Wallet.fromPhrase(privateKeyOrPhrase);
    mnemonic = privateKeyOrPhrase;
  } else {
    wallet = new ethers.Wallet(privateKeyOrPhrase);
  }
  const address = wallet.address;
  const privateKey = wallet.privateKey;

  const encryptedKey = encryptPrivateKey(privateKey);
  const encryptedPhrase = mnemonic ? encryptPhrase(mnemonic) : null;

  await prisma.wallet.create({
    data: {
      userId,
      address,
      encryptedKey,
      encryptedPhrase,
    },
  });

  return { address, privateKey, mnemonic };
}

export async function getWalletAddress(userId: number): Promise<string | null> {
  const wallet = await prisma.wallet.findFirst({ where: { userId } });
  return wallet?.address || null;
}

export async function getDecryptedPrivateKey(userId: number): Promise<string | null> {
  const wallet = await prisma.wallet.findFirst({ where: { userId } });
  if (!wallet) return null;
  return decryptPrivateKey(wallet.encryptedKey);
}

export async function getDecryptedPhrase(userId: number): Promise<string | null> {
  const wallet = await prisma.wallet.findFirst({ where: { userId } });
  if (!wallet || !wallet.encryptedPhrase) return null;
  return decryptPhrase(wallet.encryptedPhrase);
}

// Utility: get ETH balance from RPC
export async function getEthBalance(address: string): Promise<string> {
  const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL!);
  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
}
