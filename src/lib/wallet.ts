export async function importWallet(userId: number, privateKeyOrPhrase: string): Promise<{ address: string; privateKey: string; mnemonic?: string }> {
  const input = privateKeyOrPhrase.trim();
  let wallet: ethers.Wallet;
  let mnemonic: string | undefined;

  // Detect mnemonic: at least 12 words, all letters
  const words = input.split(/\s+/).filter(w => w.length > 0);
  const isMnemonic = words.length >= 12 && words.every(w => /^[a-zA-Z]+$/.test(w));

  if (isMnemonic) {
    try {
      const hdWallet = ethers.HDNodeWallet.fromPhrase(input);
      wallet = new ethers.Wallet(hdWallet.privateKey);
      mnemonic = input;
    } catch (e) {
      throw new Error('Invalid mnemonic phrase');
    }
  } else {
    // Private key: must be hex
    if (!/^[0-9a-fA-FxX]+$/.test(input)) {
      throw new Error('Invalid private key format (must be hex)');
    }
    try {
      wallet = new ethers.Wallet(input);
    } catch (e) {
      throw new Error('Invalid private key');
    }
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
