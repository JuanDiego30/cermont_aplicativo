/**
 * Auth Routes (Optimized with Token Rotation - October 2025)
 * @description Authentication and authorization routes with session management
 */

import express from 'express';
import { validateRequest } from '../middleware/validateRequest.js';
import { authenticate } from '../middleware/auth.js';
import { loginLimiter, strictLimiter } from '../middleware/rateLimiter.js';
import {
  register,
  login,
  logout,
  logoutAll,
  refreshToken,
  getSessions,
  revokeSession,
  getMe,
  updateMe,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyToken,
} from '../controllers/auth.controller.js';

const router = express.Router();

/**
 * Validation schemas
 */
const registerSchema = {
  body: {
    type: 'object',
    properties: {
      nombre: { type: 'string', minLength: 2, maxLength: 100 },
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 8 },
      rol: { type: 'string', enum: ['root', 'admin', 'coordinator_hes', 'engineer', 'supervisor', 'technician', 'accountant', 'client'] },
      telefono: { type: 'string' },
      cedula: { type: 'string' },
      cargo: { type: 'string' },
      especialidad: { type: 'string' },
    },
    required: ['nombre', 'email', 'password'],
    additionalProperties: false,
  },
};

const loginSchema = {
  body: {
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 1 },
      remember: { type: 'boolean' },
    },
    required: ['email', 'password'],
    additionalProperties: false,
  },
};

const refreshTokenSchema = {
  body: {
    type: 'object',
    properties: {
      refreshToken: { type: 'string' },
    },
    additionalProperties: false,
  },
};

const updateProfileSchema = {
  body: {
    type: 'object',
    properties: {
      nombre: { type: 'string', minLength: 2, maxLength: 100 },
      telefono: { type: 'string' },
      cargo: { type: 'string' },
      especialidad: { type: 'string' },
    },
    additionalProperties: false,
  },
};

const changePasswordSchema = {
  body: {
    type: 'object',
    properties: {
      currentPassword: { type: 'string', minLength: 1 },
      newPassword: { type: 'string', minLength: 8 },
    },
    required: ['currentPassword', 'newPassword'],
    additionalProperties: false,
  },
};

const forgotPasswordSchema = {
  body: {
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email' },
    },
    required: ['email'],
    additionalProperties: false,
  },
};

const resetPasswordSchema = {
  body: {
    type: 'object',
    properties: {
      token: { type: 'string', minLength: 1 },
      newPassword: { type: 'string', minLength: 8 },
    },
    required: ['token', 'newPassword'],
    additionalProperties: false,
  },
};

// ============================================================================
// PUBLIC ROUTES
// ============================================================================

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Registrar nuevo usuario
 *     description: Crea una nueva cuenta de usuario en el sistema CERMONT ATG
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - email
 *               - password
 *             properties:
 *               nombre:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: Nombre completo del usuario
 *                 example: "Juan Pérez"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico único
 *                 example: "juan.perez@cermont.com"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: Contraseña segura
 *                 example: "SecurePass123!"
 *               rol:
 *                 type: string
 *                 enum: [root, admin, coordinator_hes, engineer, supervisor, technician, accountant, client]
 *                 description: Rol del usuario en el sistema
 *                 example: "engineer"
 *               telefono:
 *                 type: string
 *                 description: Número de teléfono
 *                 example: "+57 300 123 4567"
 *               cedula:
 *                 type: string
 *                 description: Número de cédula o identificación
 *                 example: "1234567890"
 *               cargo:
 *                 type: string
 *                 description: Cargo laboral
 *                 example: "Ingeniero Senior"
 *               especialidad:
 *                 type: string
 *                 description: Especialidad técnica
 *                 example: "Ingeniería Eléctrica"
 *           example:
 *             nombre: "Juan Pérez"
 *             email: "juan.perez@cermont.com"
 *             password: "SecurePass123!"
 *             rol: "engineer"
 *             telefono: "+57 300 123 4567"
 *             cedula: "1234567890"
 *             cargo: "Ingeniero Senior"
 *             especialidad: "Ingeniería Eléctrica"
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Usuario registrado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Datos de entrada inválidos o usuario ya existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Demasiados intentos de registro
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public (can be restricted to admin only in production)
 */
router.post(
  '/register',
  strictLimiter, // 5 requests per 15 min
  validateRequest(registerSchema),
  register
);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Iniciar sesión de usuario
 *     description: Autentica a un usuario y devuelve tokens de acceso y refresco
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario
 *                 example: "usuario@cermont.com"
 *               password:
 *                 type: string
 *                 minLength: 1
 *                 description: Contraseña del usuario
 *                 example: "password123"
 *               remember:
 *                 type: boolean
 *                 description: Recordar sesión (extiende duración del token)
 *                 example: false
 *           example:
 *             email: "usuario@cermont.com"
 *             password: "password123"
 *             remember: false
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Inicio de sesión exitoso"
 *                 data:
 *                   $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Credenciales incorrectas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Demasiados intentos de inicio de sesión
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user and return tokens
 * @access  Public
 */
router.post(
  '/login',
  loginLimiter, // 10 requests per 15 min
  validateRequest(loginSchema),
  login
);

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     tags: [Authentication]
 *     summary: Refrescar token de acceso
 *     description: Genera un nuevo token de acceso usando un token de refresco válido (con rotación de tokens)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Token de refresco válido
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *           example:
 *             refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Token refrescado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Token refrescado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Token de refresco inválido o faltante
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Token de refresco expirado o revocado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token using refresh token (WITH ROTATION)
 * @access  Public
 */
router.post(
  '/refresh',
  validateRequest(refreshTokenSchema),
  refreshToken
);

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Solicitar recuperación de contraseña
 *     description: Envía un email con token de recuperación de contraseña al usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario
 *                 example: "usuario@cermont.com"
 *           example:
 *             email: "usuario@cermont.com"
 *     responses:
 *       200:
 *         description: Email de recuperación enviado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Se ha enviado un email con instrucciones para recuperar tu contraseña"
 *       400:
 *         description: Email inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Demasiados intentos de recuperación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Request password reset token
 * @access  Public
 */
router.post(
  '/forgot-password',
  strictLimiter,
  validateRequest(forgotPasswordSchema),
  forgotPassword
);

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Restablecer contraseña
 *     description: Cambia la contraseña del usuario usando el token de recuperación recibido por email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token de recuperación recibido por email
 *                 example: "abc123def456"
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 description: Nueva contraseña segura
 *                 example: "NewSecurePass123!"
 *           example:
 *             token: "abc123def456"
 *             newPassword: "NewSecurePass123!"
 *     responses:
 *       200:
 *         description: Contraseña restablecida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Contraseña restablecida exitosamente"
 *       400:
 *         description: Token inválido o contraseña no cumple requisitos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Token no encontrado o expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Demasiados intentos de restablecimiento
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password using token
 * @access  Public
 */
router.post(
  '/reset-password',
  strictLimiter,
  validateRequest(resetPasswordSchema),
  resetPassword
);

// ============================================================================
// PROTECTED ROUTES (require authentication)
// ============================================================================

/**
 * @swagger
 * /api/v1/auth/verify:
 *   get:
 *     tags: [Authentication]
 *     summary: Verificar token de acceso
 *     description: Verifica si el token de acceso actual es válido y no ha expirado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Token válido"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     tokenExp:
 *                       type: number
 *                       description: Timestamp de expiración del token
 *                       example: 1638360000
 *       401:
 *         description: Token inválido, expirado o faltante
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @route   GET /api/v1/auth/verify
 * @desc    Verify if token is valid
 * @access  Private
 */
router.get('/verify', authenticate, verifyToken);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: Cerrar sesión
 *     description: Invalida el token de refresco actual, cerrando la sesión en el dispositivo actual
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Sesión cerrada exitosamente"
 *       401:
 *         description: Token inválido o faltante
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user (invalidate current refresh token)
 * @access  Private
 */
router.post('/logout', authenticate, logout);

/**
 * @swagger
 * /api/v1/auth/logout-all:
 *   post:
 *     tags: [Authentication]
 *     summary: Cerrar sesión en todos los dispositivos
 *     description: Invalida todos los tokens de refresco del usuario, cerrando la sesión en todos los dispositivos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesiones cerradas exitosamente en todos los dispositivos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Sesión cerrada en todos los dispositivos"
 *       401:
 *         description: Token inválido o faltante
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @route   POST /api/v1/auth/logout-all
 * @desc    Logout from all devices (invalidate all refresh tokens)
 * @access  Private
 */
router.post('/logout-all', authenticate, logoutAll);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     tags: [Authentication]
 *     summary: Obtener perfil del usuario actual
 *     description: Devuelve la información completa del perfil del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Perfil obtenido exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Token inválido o faltante
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, getMe);

/**
 * @swagger
 * /api/v1/auth/me:
 *   put:
 *     tags: [Authentication]
 *     summary: Actualizar perfil del usuario
 *     description: Actualiza la información del perfil del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: Nombre completo del usuario
 *                 example: "Juan Pérez Actualizado"
 *               telefono:
 *                 type: string
 *                 description: Número de teléfono
 *                 example: "+57 300 123 4567"
 *               cargo:
 *                 type: string
 *                 description: Cargo laboral
 *                 example: "Ingeniero Senior"
 *               especialidad:
 *                 type: string
 *                 description: Especialidad técnica
 *                 example: "Ingeniería Eléctrica"
 *           example:
 *             nombre: "Juan Pérez Actualizado"
 *             telefono: "+57 300 123 4567"
 *             cargo: "Ingeniero Senior"
 *             especialidad: "Ingeniería Eléctrica"
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Perfil actualizado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Token inválido o faltante
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @route   PUT /api/v1/auth/me
 * @desc    Update current user profile
 * @access  Private
 */
router.put(
  '/me',
  authenticate,
  validateRequest(updateProfileSchema),
  updateMe
);

/**
 * @swagger
 * /api/v1/auth/change-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Cambiar contraseña
 *     description: Cambia la contraseña del usuario autenticado verificando la contraseña actual
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Contraseña actual del usuario
 *                 example: "CurrentPass123!"
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 description: Nueva contraseña segura
 *                 example: "NewSecurePass456!"
 *           example:
 *             currentPassword: "CurrentPass123!"
 *             newPassword: "NewSecurePass456!"
 *     responses:
 *       200:
 *         description: Contraseña cambiada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Contraseña cambiada exitosamente"
 *       400:
 *         description: Contraseña actual incorrecta o nueva contraseña inválida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Token inválido o faltante
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post(
  '/change-password',
  authenticate,
  validateRequest(changePasswordSchema),
  changePassword
);

// ============================================================================
// SESSION MANAGEMENT ROUTES (NEW)
// ============================================================================

/**
 * @swagger
 * /api/v1/auth/sessions:
 *   get:
 *     tags: [Authentication]
 *     summary: Obtener sesiones activas
 *     description: Devuelve una lista de todas las sesiones activas del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesiones obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Sesiones obtenidas exitosamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       index:
 *                         type: integer
 *                         description: Índice de la sesión
 *                         example: 0
 *                       device:
 *                         type: string
 *                         description: Información del dispositivo
 *                         example: "Chrome 91.0.4472.124 on Windows"
 *                       ip:
 *                         type: string
 *                         description: Dirección IP
 *                         example: "192.168.1.100"
 *                       location:
 *                         type: string
 *                         description: Ubicación aproximada
 *                         example: "Bogotá, Colombia"
 *                       lastActivity:
 *                         type: string
 *                         format: date-time
 *                         description: Última actividad
 *                         example: "2023-10-15T10:30:00Z"
 *                       current:
 *                         type: boolean
 *                         description: Indica si es la sesión actual
 *                         example: true
 *       401:
 *         description: Token inválido o faltante
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @route   GET /api/v1/auth/sessions
 * @desc    Get all active sessions for current user
 * @access  Private
 */
router.get('/sessions', authenticate, getSessions);

/**
 * @swagger
 * /api/v1/auth/sessions/{sessionIndex}:
 *   delete:
 *     tags: [Authentication]
 *     summary: Revocar sesión específica
 *     description: Revoca una sesión específica del usuario usando el índice de la sesión
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionIndex
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Índice de la sesión a revocar
 *         example: 1
 *     responses:
 *       200:
 *         description: Sesión revocada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Sesión revocada exitosamente"
 *       400:
 *         description: Índice de sesión inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Token inválido o faltante
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Sesión no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @route   DELETE /api/v1/auth/sessions/:sessionIndex
 * @desc    Revoke specific session by index
 * @access  Private
 */
router.delete('/sessions/:sessionIndex', authenticate, revokeSession);

export default router;
