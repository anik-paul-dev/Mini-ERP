import express from 'express';
import authController from './auth.controller';
import validate from '../../middleware/validate';
import auth from '../../middleware/auth';
import { authLimiter } from '../../middleware/rateLimiter';
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from './auth.validation';

const router = express.Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', auth, authController.logout);
router.get('/me', auth, authController.getCurrentUser);

export default router;
