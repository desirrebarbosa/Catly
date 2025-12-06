import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { rateLimit } from 'express-rate-limit';

const router = Router();

// Rate Limiter for Login/Signup
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 20, // Limit each IP to 20 requests per window
	message: { success: false, error: 'Too many login attempts, please try again later.' },
    standardHeaders: 'draft-7',
    legacyHeaders: false,
});

// Public Routes
router.post('/signup', authLimiter, authController.signup);
router.post('/login', authLimiter, authController.login);
router.post('/login/2fa', authLimiter, authController.login2FA);
router.post('/google', authLimiter, authController.googleLogin);
router.post('/password-reset', authLimiter, authController.requestPasswordReset);

// Protected Routes
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);
router.post('/logout', (req, res) => res.json({ success: true }));

// 2FA Management
router.post('/2fa/generate', authenticate, authController.generate2FA);
router.post('/2fa/enable', authenticate, authController.verifyAndEnable2FA);
router.post('/2fa/disable', authenticate, authController.disable2FA);

export const authRouter = router;
