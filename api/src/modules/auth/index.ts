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

// Google Routes
import passport from 'passport';
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    authController.googleCallback
);

// Rutas protegidas
router.post('/logout', authController.logout);
router.get('/me', authMiddleware, authController.me);

export default router;
