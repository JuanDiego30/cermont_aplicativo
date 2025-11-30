import { Router } from 'express';
import { container } from '../../../shared/container/index.js';
import { authenticate } from '../../../shared/middlewares/authenticate.js';
import { validateMiddleware } from '../../../shared/middlewares/validateMiddleware.js';
import { loginSchema, registerSchema } from '../schemas/validation.schemas.js';
import { authRateLimit } from '../../../shared/middlewares/authRateLimit.js';

const router = Router();
const { authController } = container;

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: Autentica un usuario y devuelve tokens JWT
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Credenciales inválidas
 *       429:
 *         description: Demasiados intentos de login
 */
router.post(
  '/login',
  authRateLimit,
  validateMiddleware(loginSchema),
  authController.login.bind(authController)
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     description: Invalida el token actual del usuario
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  '/logout',
  authenticate,
  authController.logout.bind(authController)
);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Renovar token de acceso
 *     description: Obtiene un nuevo access token usando el refresh token
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Token de refresco válido
 *     responses:
 *       200:
 *         description: Nuevo token generado
 *       401:
 *         description: Refresh token inválido o expirado
 */
router.post(
  '/refresh',
  authRateLimit,
  authController.refresh.bind(authController)
);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Obtener perfil del usuario
 *     description: Devuelve la información del usuario autenticado
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/profile',
  authenticate,
  authController.getProfile.bind(authController)
);

/**
 * @swagger
 * /auth/logout-all:
 *   post:
 *     summary: Cerrar todas las sesiones
 *     description: Invalida todos los tokens del usuario en todos los dispositivos
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Todas las sesiones cerradas
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  '/logout-all',
  authenticate,
  authController.logoutAll.bind(authController)
);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     description: Crea una nueva cuenta de usuario
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: El email ya está registrado
 */
router.post(
  '/register',
  authRateLimit,
  validateMiddleware(registerSchema),
  authController.register.bind(authController)
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Solicitar enlace de recuperación de contraseña
 * @access  Public
 */
router.post(
  '/forgot-password',
  authRateLimit,
  authController.forgotPassword.bind(authController)
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Restablecer contraseña con token de recuperación
 * @access  Public
 */
router.post(
  '/reset-password',
  authRateLimit,
  authController.resetPassword.bind(authController)
);

/**
 * @route   GET /api/auth/verify-reset-token
 * @desc    Verificar si un token de recuperación es válido
 * @access  Public
 */
router.get(
  '/verify-reset-token',
  authController.verifyResetToken.bind(authController)
);

export default router;
