import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { loginRateLimiter, otpRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public routes
router.post('/register', AuthController.register);
router.post('/login', loginRateLimiter, AuthController.login);
router.post('/refresh', AuthController.refreshToken);
router.post('/phone/send-otp', otpRateLimiter, AuthController.sendPhoneOTP);
router.post('/phone/verify-otp', AuthController.verifyPhoneOTP);
router.post('/google', AuthController.googleAuth);

// Protected routes
router.get('/me', authenticate, AuthController.me);
router.post('/become-creator', authenticate, AuthController.becomeCreator);
router.post('/logout', authenticate, AuthController.logout);

export default router;
