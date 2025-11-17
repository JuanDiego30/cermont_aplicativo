/**
 * Rutas de Autenticación
 *
 * @file backend/src/infra/http/routes/auth.routes.ts
 */

import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticate } from '../../../shared/middlewares/authenticate';
import { validateMiddleware } from '../../../shared/middlewares/validateMiddleware';
import { loginSchema } from '../schemas/validation.schemas';

const router = Router();

/**
 * @route   POST /api/auth/login
 * @desc    Login de usuario
 * @access  Public
 */
router.post(
  '/login',
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
  AuthController.logoutAll // Reutilizar el mismo controller
);

export default router;
