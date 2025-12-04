import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/password-reset', authController.requestPasswordReset);

// Protect these routes so req.userId is available
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);

router.post('/logout', (req, res) => res.json({ success: true }));

export const authRouter = router;