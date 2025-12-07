import { Router } from 'express';
import { authController } from './auth.controller.js';
import { authMiddleware } from './auth.middleware.js';

const router = Router();

// Rutas públicas
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/verify', authController.verify);
router.post('/refresh', authController.refresh);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Rutas protegidas
router.post('/logout', authController.logout);
router.get('/me', authMiddleware, authController.me);

export default router;
