import { prisma } from '@looksell/database';
import { UserRole, validateEmail, validateUsername, validatePassword } from '@looksell/shared';
import { hashPassword, comparePassword } from '../utils/password';
import { generateTokens, TokenPayload } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';
import { redisHelpers } from '../config/redis';
import { generateRandomCode } from '@looksell/shared';

export class AuthService {
  async register(data: {
    username: string;
    email: string;
    password: string;
  }) {
    // Validate input
    if (!validateEmail(data.email)) {
      throw new AppError(400, 'Invalid email format');
    }

    if (!validateUsername(data.username)) {
      throw new AppError(400, 'Invalid username format (3-30 alphanumeric characters, underscore, or hyphen)');
    }

    if (!validatePassword(data.password)) {
      throw new AppError(400, 'Password must be at least 8 characters with uppercase, lowercase, and number');
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          { username: data.username },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === data.email) {
        throw new AppError(400, 'Email already in use');
      }
      throw new AppError(400, 'Username already taken');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        passwordHash,
        role: UserRole.BUYER,
        profile: {
          create: {
            displayName: data.username,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // TODO: Send verification email

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        profile: user.profile,
      },
      tokens,
    };
  }

  async login(data: { emailOrUsername: string; password: string }) {
    // Find user by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.emailOrUsername },
          { username: data.emailOrUsername },
        ],
        status: 'active',
      },
      include: {
        profile: true,
        creatorProfile: true,
      },
    });

    if (!user) {
      throw new AppError(401, 'Invalid credentials');
    }

    // Verify password
    const isValidPassword = await comparePassword(data.password, user.passwordHash);
    if (!isValidPassword) {
      throw new AppError(401, 'Invalid credentials');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        profile: user.profile,
        creatorProfile: user.creatorProfile,
      },
      tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    // Verify refresh token would be done by jwt.verify in the route
    // This method just generates new tokens
    throw new Error('Not implemented - handle in route with verifyRefreshToken');
  }

  async sendPhoneOTP(phone: string) {
    // Generate 6-digit OTP
    const otp = generateRandomCode(6);

    // Store in Redis with 5-minute expiration
    await redisHelpers.setOTP(phone, otp, 5 * 60);

    // TODO: Send SMS via Twilio
    console.log(`OTP for ${phone}: ${otp}`);

    return { success: true };
  }

  async verifyPhoneOTP(phone: string, otp: string) {
    // Get stored OTP
    const storedOTP = await redisHelpers.getOTP(phone);

    if (!storedOTP || storedOTP !== otp) {
      throw new AppError(400, 'Invalid or expired OTP');
    }

    // Delete used OTP
    await redisHelpers.deleteOTP(phone);

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { phone },
      include: {
        profile: true,
        creatorProfile: true,
      },
    });

    if (!user) {
      // Create new user with phone
      const username = `user_${phone.slice(-6)}`;
      user = await prisma.user.create({
        data: {
          username,
          email: `${phone}@phone.local`, // Temporary email
          phone,
          phoneVerified: true,
          passwordHash: await hashPassword(generateRandomCode(32)),
          role: UserRole.BUYER,
          profile: {
            create: {
              displayName: username,
            },
          },
        },
        include: {
          profile: true,
          creatorProfile: true,
        },
      });
    } else {
      // Update phone verification
      user = await prisma.user.update({
        where: { id: user.id },
        data: { phoneVerified: true },
        include: {
          profile: true,
          creatorProfile: true,
        },
      });
    }

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        phoneVerified: user.phoneVerified,
        profile: user.profile,
        creatorProfile: user.creatorProfile,
      },
      tokens,
    };
  }

  async googleAuth(googleToken: string) {
    // TODO: Verify Google token and extract user info
    // For now, this is a placeholder
    throw new AppError(501, 'Google authentication not implemented yet');
  }

  async becomeCreator(userId: string) {
    // Check if user already has creator profile
    const existingCreator = await prisma.creatorProfile.findUnique({
      where: { userId },
    });

    if (existingCreator) {
      throw new AppError(400, 'User is already a creator');
    }

    // Check if email is verified
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.emailVerified) {
      throw new AppError(400, 'Email verification required to become a creator');
    }

    // Create creator profile
    const creatorProfile = await prisma.creatorProfile.create({
      data: {
        userId,
        creatorStatus: 'active', // Could be 'pending' if manual approval required
      },
    });

    // Update user role
    await prisma.user.update({
      where: { id: userId },
      data: { role: UserRole.CREATOR },
    });

    return creatorProfile;
  }
}
