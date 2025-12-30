import Redis from 'ioredis';
import { env } from './env';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('connect', () => {
  console.log('✅ Redis connected');
});

redis.on('error', (err) => {
  console.error('❌ Redis error:', err);
});

// Helper functions for common Redis operations
export const redisHelpers = {
  // Session management
  async setSession(sessionId: string, data: any, expiresIn: number): Promise<void> {
    await redis.setex(`session:${sessionId}`, expiresIn, JSON.stringify(data));
  },

  async getSession(sessionId: string): Promise<any | null> {
    const data = await redis.get(`session:${sessionId}`);
    return data ? JSON.parse(data) : null;
  },

  async deleteSession(sessionId: string): Promise<void> {
    await redis.del(`session:${sessionId}`);
  },

  // Rate limiting
  async checkRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
    const current = await redis.incr(`ratelimit:${key}`);
    if (current === 1) {
      await redis.pexpire(`ratelimit:${key}`, windowMs);
    }
    return current <= limit;
  },

  // OTP management
  async setOTP(phone: string, otp: string, expiresIn: number): Promise<void> {
    await redis.setex(`otp:${phone}`, expiresIn, otp);
  },

  async getOTP(phone: string): Promise<string | null> {
    return await redis.get(`otp:${phone}`);
  },

  async deleteOTP(phone: string): Promise<void> {
    await redis.del(`otp:${phone}`);
  },

  // Playback position tracking
  async setPlaybackPosition(userId: string, contentId: string, position: number): Promise<void> {
    await redis.hset(`playback:${userId}`, contentId, position.toString());
  },

  async getPlaybackPosition(userId: string, contentId: string): Promise<number> {
    const position = await redis.hget(`playback:${userId}`, contentId);
    return position ? parseInt(position, 10) : 0;
  },

  // Cache management
  async cache(key: string, data: any, expiresIn: number): Promise<void> {
    await redis.setex(`cache:${key}`, expiresIn, JSON.stringify(data));
  },

  async getCached(key: string): Promise<any | null> {
    const data = await redis.get(`cache:${key}`);
    return data ? JSON.parse(data) : null;
  },

  async invalidateCache(key: string): Promise<void> {
    await redis.del(`cache:${key}`);
  },
};

export default redis;
