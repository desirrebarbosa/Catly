import { Router } from 'express';
import * as authController from '../controllers/auth.controller';

const router = Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/password-reset', authController.requestPasswordReset);
router.get('/profile', authController.getProfile);
router.put('/profile', authController.updateProfile);
router.post('/logout', (req, res) => res.json({ success: true }));

export const authRouter = router;