import crypto from 'crypto';

export function verifyTelegramInitData(initData: string, botToken: string): boolean {
  // Parse query string
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return false;

  // Remove hash from params for comparison
  params.delete('hash');
  const sortedKeys = Array.from(params.keys()).sort();
  let dataCheckString = '';
  for (const key of sortedKeys) {
    dataCheckString += `${key}=${params.get(key)}\n`;
  }
  dataCheckString = dataCheckString.slice(0, -1); // remove trailing newline

  // Compute secret key: HMAC-SHA256 of bot token with "WebAppData" as key
  const secretKey = crypto.createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();

  // Compute HMAC-SHA256 of dataCheckString with secretKey
  const computedHash = crypto.createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  return computedHash === hash;
}

export function parseTelegramUser(initData: string): { id: string; username?: string; firstName?: string; lastName?: string } | null {
  const params = new URLSearchParams(initData);
  const userStr = params.get('user');
  if (!userStr) return null;
  try {
    const user = JSON.parse(userStr);
    return {
      id: user.id.toString(),
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
    };
  } catch {
    return null;
  }
}
