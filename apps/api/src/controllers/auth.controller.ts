import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AuthService } from '../services/auth.service';
import { asyncHandler } from '../middleware/errorHandler';
import { z } from 'zod';
import { verifyRefreshToken } from '../utils/jwt';

const authService = new AuthService();

// Validation schemas
const registerSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  emailOrUsername: z.string(),
  password: z.string(),
});

const phoneOTPSchema = z.object({
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/),
});

const verifyOTPSchema = z.object({
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/),
  otp: z.string().length(6),
});

export const AuthController = {
  register: asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = registerSchema.parse(req.body);
    const result = await authService.register(data);

    res.status(201).json({
      success: true,
      data: result,
    });
  }),

  login: asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data);

    res.json({
      success: true,
      data: result,
    });
  }),

  refreshToken: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token required',
      });
    }

    try {
      const payload = verifyRefreshToken(refreshToken);

      // Generate new tokens
      const { generateTokens } = require('../utils/jwt');
      const tokens = generateTokens({
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      });

      res.json({
        success: true,
        data: tokens,
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: 'Invalid refresh token',
      });
    }
  }),

  sendPhoneOTP: asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = phoneOTPSchema.parse(req.body);
    const result = await authService.sendPhoneOTP(data.phone);

    res.json({
      success: true,
      data: result,
    });
  }),

  verifyPhoneOTP: asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = verifyOTPSchema.parse(req.body);
    const result = await authService.verifyPhoneOTP(data.phone, data.otp);

    res.json({
      success: true,
      data: result,
    });
  }),

  googleAuth: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { googleToken } = req.body;

    if (!googleToken) {
      return res.status(400).json({
        success: false,
        error: 'Google token required',
      });
    }

    const result = await authService.googleAuth(googleToken);

    res.json({
      success: true,
      data: result,
    });
  }),

  me: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { prisma } = require('@looksell/database');

    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: {
        profile: true,
        creatorProfile: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        profile: user.profile,
        creatorProfile: user.creatorProfile,
      },
    });
  }),

  becomeCreator: asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await authService.becomeCreator(req.user!.userId);

    res.json({
      success: true,
      data: result,
    });
  }),

  logout: asyncHandler(async (req: AuthRequest, res: Response) => {
    // In a real implementation, you'd invalidate the token
    // For now, just return success (client should delete token)
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  }),
};
