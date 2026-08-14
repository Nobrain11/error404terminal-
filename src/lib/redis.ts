import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || '';
let redis: Redis | null = null;

if (redisUrl && !redisUrl.startsWith('redis://localhost')) {
  try {
    redis = new Redis(redisUrl);
    console.log('✅ Redis connected');
  } catch (e) {
    console.warn('⚠️ Redis connection failed – using fallback');
  }
} else {
  console.warn('⚠️ Redis not configured – using fallback');
}

export { redis };
