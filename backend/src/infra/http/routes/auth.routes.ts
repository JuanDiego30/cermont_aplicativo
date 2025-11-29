import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { authenticate } from '../../../shared/middlewares/authenticate.js';
import { validateMiddleware } from '../../../shared/middlewares/validateMiddleware.js';
import { loginSchema, registerSchema } from '../schemas/validation.schemas.js';
import { authRateLimit } from '../../../shared/middlewares/authRateLimit.js';

const router = Router();

/**
 * @route   POST /api/auth/login
 * @desc    Login de usuario
 * @access  Public
 */
router.post(
  '/login',
  authRateLimit,
  validateMiddleware(loginSchema),
  AuthController.login
);

/**
 * @route   POST /api/auth/logout
 * @desc    Cerrar sesión actual
 * @access  Private
 */
router.post(
  '/logout',
  authenticate,
  AuthController.logout
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Renovar access token
 * @access  Public (requiere refresh token válido)
 */
router.post(
  '/refresh',
  authRateLimit,
  AuthController.refresh
);

/**
 * @route   GET /api/auth/profile
 * @desc    Obtener perfil del usuario autenticado
 * @access  Private
 */
router.get(
  '/profile',
  authenticate,
  AuthController.getProfile
);

/**
 * @route   POST /api/auth/logout-all
 * @desc    Cerrar todas las sesiones del usuario
 * @access  Private
 */
router.post(
  '/logout-all',
  authenticate,
  AuthController.logoutAll
);

/**
 * @route   POST /api/auth/register
 * @desc    Registro de nuevo cliente
 * @access  Public
 */
router.post(
  '/register',
  authRateLimit,
  validateMiddleware(registerSchema),
  AuthController.register
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Solicitar enlace de recuperación de contraseña
 * @access  Public
 */
router.post(
  '/forgot-password',
  authRateLimit,
  AuthController.forgotPassword
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Restablecer contraseña con token de recuperación
 * @access  Public
 */
router.post(
  '/reset-password',
  authRateLimit,
  AuthController.resetPassword
);

/**
 * @route   GET /api/auth/verify-reset-token
 * @desc    Verificar si un token de recuperación es válido
 * @access  Public
 */
router.get(
  '/verify-reset-token',
  AuthController.verifyResetToken
);

export default router;
