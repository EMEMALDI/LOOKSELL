import { Request, Response, NextFunction } from 'express';
import { redisHelpers } from '../config/redis';

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  keyGenerator?: (req: Request) => string;
  handler?: (req: Request, res: Response) => void;
}

export function createRateLimiter(options: RateLimitOptions) {
  const {
    windowMs,
    max,
    keyGenerator = (req) => req.ip || 'unknown',
    handler = (req, res) => {
      res.status(429).json({
        success: false,
        error: 'Too many requests, please try again later',
      });
    },
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = keyGenerator(req);
      const allowed = await redisHelpers.checkRateLimit(key, max, windowMs);

      if (!allowed) {
        return handler(req, res);
      }

      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      next(); // Fail open on rate limiter errors
    }
  };
}

// Predefined rate limiters
export const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
});

export const otpRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  keyGenerator: (req) => req.body.phone || req.ip,
});

export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000,
});

export const purchaseRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  keyGenerator: (req) => {
    const userId = (req as any).user?.userId;
    return userId || req.ip || 'unknown';
  },
});
