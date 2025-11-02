/**
 * Controlador de Autenticación - CERMONT ATG
 *
 * Este módulo maneja todos los endpoints relacionados con autenticación y autorización
 * en el sistema CERMONT ATG. Implementa un sistema completo de autenticación JWT
 * con rotación de tokens, gestión de sesiones, recuperación de contraseña y
 * auditoría de seguridad.
 *
 * Características principales:
 * - Registro de usuarios con validación completa
 * - Inicio de sesión con rate limiting y detección de dispositivos
 * - Sistema de tokens JWT con refresh token rotation
 * - Gestión de sesiones activas por usuario
 * - Recuperación de contraseña por email
 * - Cambio de contraseña con verificación
 * - Logout individual y global
 * - Verificación de tokens activos
 * - Auditoría completa de todas las operaciones de seguridad
 * - Notificaciones WebSocket en tiempo real
 * - Cookies seguras con configuración HttpOnly
 *
 * Funciones de seguridad implementadas:
 * - Rate limiting por endpoint
 * - Detección y logging de intentos fallidos
 * - Blacklist de tokens revocados
 * - Validación de dispositivos y ubicaciones
 * - Encriptación de contraseñas con bcrypt
 * - Sanitización de inputs
 *
 * @module auth.controller
 * @version 1.0.0
 * @since October 2025
 */

import crypto from 'crypto';
import User from '../models/User.js';
import { generateTokenPair, verifyRefreshToken } from '../config/jwt.js';
import { successResponse, errorResponse, HTTP_STATUS } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logger } from '../utils/logger.js';
import { emitToUser } from '../config/socket.js';
// NUEVO: Importar validadores
import { 
  validateRegisterData, 
  validateLoginData,
  validateAndRespond,
} from '../utils/validators.js';
// ✅ AGREGAR: Importar funciones de auditoría
import { createAuditLog, logLoginFailed } from '../middleware/auditLogger.js';
// ✅ AGREGAR: Importar BlacklistedToken
import BlacklistedToken from '../models/BlacklistedToken.js';
/**
 * Obtener información del dispositivo desde request
 */
const getDeviceInfo = (req) => {
  const userAgent = req.headers['user-agent'] || 'unknown';
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  
  // Detectar tipo de dispositivo básico
  let device = 'desktop';
  if (/mobile/i.test(userAgent)) device = 'mobile';
  else if (/tablet/i.test(userAgent)) device = 'tablet';
  
  return {
    device,
    ip,
    userAgent,
  };
};

/**
 * Configurar cookies de tokens
 */
const setTokenCookies = (res, tokens, remember = false) => {
  const accessMaxAge = tokens.expiresIn * 1000; // Convertir a ms
  const refreshMaxAge = remember 
    ? 30 * 24 * 60 * 60 * 1000 // 30 días
    : 7 * 24 * 60 * 60 * 1000;  // 7 días
  
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };
  
  res.cookie('accessToken', tokens.accessToken, {
    ...cookieOptions,
    maxAge: accessMaxAge,
  });
  
  res.cookie('refreshToken', tokens.refreshToken, {
    ...cookieOptions,
    maxAge: refreshMaxAge,
  });
};

/**
 * Registrar nuevo usuario
 *
 * Crea una nueva cuenta de usuario en el sistema CERMONT ATG con validación completa
 * de datos, verificación de unicidad y generación automática de tokens de autenticación.
 * Registra la operación en los logs de auditoría y configura la primera sesión.
 *
 * @async
 * @function register
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.body - Datos del nuevo usuario
 * @param {string} req.body.nombre - Nombre completo (2-100 caracteres)
 * @param {string} req.body.email - Correo electrónico único y válido
 * @param {string} req.body.password - Contraseña segura (mínimo 8 caracteres)
 * @param {string} [req.body.rol] - Rol del usuario (default: technician)
 * @param {string} [req.body.telefono] - Número de teléfono
 * @param {string} [req.body.cedula] - Número de cédula único
 * @param {string} [req.body.cargo] - Cargo laboral
 * @param {string} [req.body.especialidad] - Especialidad técnica
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Promise<void>} Respuesta JSON con usuario creado y tokens
 * @throws {ValidationError} Cuando los datos no cumplen las validaciones
 * @throws {ConflictError} Cuando email o cédula ya existen
 *
 * @example
 * // Registro exitoso devuelve:
 * {
 *   "success": true,
 *   "message": "Usuario registrado exitosamente",
 *   "data": {
 *     "user": { "id": "...", "nombre": "Juan Pérez", ... },
 *     "tokens": { "accessToken": "...", "refreshToken": "..." }
 *   }
 * }
 */
/**
 * Register new user
 * @route POST /api/v1/auth/register
 * @access Public (but can be restricted to admin only)
 */
export const register = asyncHandler(async (req, res) => {
  // ✅ NUEVO: Validar y sanitizar datos
  const validation = validateAndRespond(validateRegisterData, req.body, res);
  if (validation.hasErrors) return validation.response;

  const { sanitized } = validation;

  // Check if user already exists
  const existingUser = await User.findOne({ email: sanitized.email.toLowerCase() });
  if (existingUser) {
    return errorResponse(
      res,
      'El email ya está registrado',
      HTTP_STATUS.CONFLICT
    );
  }

  // Check if cedula exists
  if (sanitized.cedula) {
    const existingCedula = await User.findOne({ cedula: sanitized.cedula });
    if (existingCedula) {
      return errorResponse(
        res,
        'La cédula ya está registrada',
        HTTP_STATUS.CONFLICT
      );
    }
  }

  // ✅ Usar datos sanitizados
  const user = await User.create({
    ...sanitized,
    email: sanitized.email.toLowerCase(),
    rol: sanitized.rol || 'technician',
  });

  logger.info(`New user registered: ${user.email} (${user.rol})`);

  // ... resto del código igual
  const deviceInfo = getDeviceInfo(req);
  const tokens = await generateTokenPair(
    {
      userId: user._id.toString(),
      role: user.rol,
    },
    deviceInfo
  );

  const refreshExpiresAt = new Date();
  refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7);

  await user.addRefreshToken(
    tokens.refreshToken,
    refreshExpiresAt,
    deviceInfo.device,
    deviceInfo.ip,
    deviceInfo.userAgent
  );

  setTokenCookies(res, tokens, false);

  return successResponse(
    res,
    {
      user: user.toAuthJSON(),
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenType: tokens.tokenType,
        expiresIn: tokens.expiresIn,
        expiresAt: tokens.expiresAt,
      },
    },
    'Usuario registrado exitosamente',
    HTTP_STATUS.CREATED
  );
});


/**
 * Iniciar sesión de usuario
 *
 * Autentica a un usuario en el sistema CERMONT ATG verificando credenciales,
 * aplicando rate limiting, detectando dispositivos y generando tokens JWT.
 * Registra la sesión en el historial del usuario y configura cookies seguras.
 *
 * @async
 * @function login
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.body - Credenciales de acceso
 * @param {string} req.body.email - Correo electrónico del usuario
 * @param {string} req.body.password - Contraseña del usuario
 * @param {boolean} [req.body.remember] - Recordar sesión (extiende duración)
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Promise<void>} Respuesta JSON con tokens y datos de usuario
 * @throws {ValidationError} Cuando email o password no son válidos
 * @throws {UnauthorizedError} Cuando las credenciales son incorrectas
 * @throws {ForbiddenError} Cuando la cuenta está bloqueada o inactiva
 *
 * @example
 * // Login exitoso devuelve:
 * {
 *   "success": true,
 *   "message": "Inicio de sesión exitoso",
 *   "data": {
 *     "user": { "id": "...", "nombre": "Juan Pérez", ... },
 *     "tokens": {
 *       "accessToken": "...",
 *       "refreshToken": "...",
 *       "expiresIn": 3600
 *     }
 *   }
 * }
 */
/**
 * Login user
 * @route POST /api/v1/auth/login
 * @access Public
 */
export const login = asyncHandler(async (req, res) => {
  // ✅ NUEVO: Validar y sanitizar datos
  const validation = validateAndRespond(validateLoginData, req.body, res);
  if (validation.hasErrors) return validation.response;

  const { sanitized } = validation;

  // Find user
  const user = await User.findByEmail(sanitized.email);

  if (!user) {
    return errorResponse(
      res,
      'Credenciales inválidas',
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  // ... resto del código igual (verificar lock, isActive, password, etc.)
  if (user.isLocked) {
    const lockTime = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
    return errorResponse(
      res,
      `Cuenta bloqueada por múltiples intentos fallidos. Intenta en ${lockTime} minutos`,
      HTTP_STATUS.FORBIDDEN
    );
  }

  if (!user.isActive) {
    return errorResponse(
      res,
      'Usuario inactivo. Contacta al administrador',
      HTTP_STATUS.FORBIDDEN
    );
  }

  const isPasswordValid = await user.comparePassword(sanitized.password);

  if (!isPasswordValid) {
    // ✅ AGREGAR: Log de auditoría de login fallido
    await logLoginFailed(
      sanitized.email,
      req.ip,
      req.get('user-agent'),
      'Contraseña incorrecta'
    );
    
    await user.incrementLoginAttempts();
    return errorResponse(
      res,
      'Credenciales inválidas',
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  const deviceInfo = getDeviceInfo(req);
  await user.resetLoginAttempts(deviceInfo.ip);

  const tokens = await generateTokenPair(
    {
      userId: user._id.toString(),
      role: user.rol,
      tokenVersion: user.tokenVersion || 0,
    },
    deviceInfo
  );

  const refreshExpiresAt = new Date();
  const daysToAdd = sanitized.remember ? 30 : 7;
  refreshExpiresAt.setDate(refreshExpiresAt.getDate() + daysToAdd);

  await user.addRefreshToken(
    tokens.refreshToken,
    refreshExpiresAt,
    deviceInfo.device,
    deviceInfo.ip,
    deviceInfo.userAgent
  );

  setTokenCookies(res, tokens, sanitized.remember);

  logger.info(`User logged in: ${user.email} from ${deviceInfo.device} (${deviceInfo.ip})`);

  // ✅ AGREGAR: Log de auditoría de login exitoso
  await createAuditLog({
    userId: user._id,
    userEmail: user.email,
    userRole: user.rol,
    action: 'LOGIN',
    resource: 'Auth',
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    method: 'POST',
    endpoint: '/api/auth/login',
    status: 'SUCCESS',
    severity: 'LOW'
  });

  return successResponse(
    res,
    {
      user: user.toAuthJSON(),
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenType: tokens.tokenType,
        expiresIn: tokens.expiresIn,
        expiresAt: tokens.expiresAt,
      },
    },
    'Login exitoso'
  );
});

/**
 * Logout user (cerrar sesión actual)
 * @route POST /api/v1/auth/logout
 * @access Private
 */
export const logout = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
  const accessToken = req.headers.authorization?.split(' ')[1];

  // ✅ AGREGAR: Revocar tokens añadiéndolos a blacklist
  if (accessToken) {
    await BlacklistedToken.revokeToken(
      accessToken,
      userId,
      'LOGOUT',
      {
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    );
  }

  if (refreshToken) {
    // Remover solo el refresh token actual
    const user = await User.findById(userId);
    if (user) {
      await user.removeRefreshToken(refreshToken);
      logger.info(`User logged out: ${user.email}`);
    }
  }

  // Clear cookies
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  // ✅ AGREGAR: Log de auditoría de logout
  const user = await User.findById(userId);
  await createAuditLog({
    userId,
    userEmail: user?.email,
    userRole: user?.rol,
    action: 'LOGOUT',
    resource: 'Auth',
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    method: 'POST',
    endpoint: '/api/auth/logout',
    status: 'SUCCESS',
    severity: 'LOW'
  });

  return successResponse(res, null, 'Logout exitoso');
});

/**
 * Logout from all devices (cerrar todas las sesiones)
 * @route POST /api/v1/auth/logout-all
 * @access Private
 */
export const logoutAll = asyncHandler(async (req, res) => {
  const userId = req.userId;

  // Invalidar todos los tokens
  const user = await User.findById(userId);
  if (user) {
    await user.invalidateAllTokens();
    logger.info(`User logged out from all devices: ${user.email}`);
  }

  // Clear cookies
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  return successResponse(
    res,
    null,
    'Sesión cerrada en todos los dispositivos'
  );
});

/**
 * Refresh access token (CON ROTACIÓN)
 * @route POST /api/v1/auth/refresh
 * @access Public
 */
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: clientRefreshToken } = req.body;
  const cookieRefreshToken = req.cookies?.refreshToken;

  const refreshToken = clientRefreshToken || cookieRefreshToken;

  if (!refreshToken) {
    return errorResponse(
      res,
      'Refresh token no proporcionado',
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  // Verify refresh token
  let decoded;
  try {
    decoded = await verifyRefreshToken(refreshToken);
  } catch {
    return errorResponse(
      res,
      'Refresh token inválido o expirado',
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  // Find user con tokenVersion
  const user = await User.findById(decoded.userId)
    .select('+tokenVersion +refreshTokens');

  if (!user) {
    return errorResponse(
      res,
      'Usuario no encontrado',
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  // Verificar que el refresh token existe y es válido
  if (!user.hasValidRefreshToken(refreshToken)) {
    logger.warn(`Invalid refresh token used for user: ${user.email}`);
    return errorResponse(
      res,
      'Refresh token inválido o ya fue usado',
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  // Verificar tokenVersion (previene uso de tokens anteriores a cambio de contraseña)
  if (decoded.tokenVersion !== undefined && decoded.tokenVersion !== user.tokenVersion) {
    logger.warn(`Outdated token version used for user: ${user.email}`);
    return errorResponse(
      res,
      'Token expirado. Por favor, inicia sesión nuevamente',
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  if (!user.isActive) {
    return errorResponse(
      res,
      'Usuario inactivo',
      HTTP_STATUS.FORBIDDEN
    );
  }

  // Obtener info del dispositivo
  const deviceInfo = getDeviceInfo(req);

  // ✅ ROTACIÓN: Generar NUEVOS tokens
  const newTokens = await generateTokenPair(
    {
      userId: user._id.toString(),
      role: user.rol,
      tokenVersion: user.tokenVersion || 0,
    },
    deviceInfo
  );

  // ✅ ROTACIÓN: Remover refresh token antiguo
  await user.removeRefreshToken(refreshToken);

  // ✅ ROTACIÓN: Agregar nuevo refresh token
  const refreshExpiresAt = new Date();
  refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7);
  
  await user.addRefreshToken(
    newTokens.refreshToken,
    refreshExpiresAt,
    deviceInfo.device,
    deviceInfo.ip,
    deviceInfo.userAgent
  );

  // Set new cookies
  setTokenCookies(res, newTokens, false);

  logger.info(`Tokens refreshed for user: ${user.email}`);

  return successResponse(
    res,
    {
      tokens: {
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken,
        tokenType: newTokens.tokenType,
        expiresIn: newTokens.expiresIn,
        expiresAt: newTokens.expiresAt,
      },
    },
    'Token renovado exitosamente'
  );
});

/**
 * Get active sessions
 * @route GET /api/v1/auth/sessions
 * @access Private
 */
export const getSessions = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId).select('+refreshTokens');

  if (!user) {
    return errorResponse(
      res,
      'Usuario no encontrado',
      HTTP_STATUS.NOT_FOUND
    );
  }

  // Limpiar tokens expirados primero
  const now = new Date();
  const activeSessions = user.refreshTokens
    .filter(rt => rt.expiresAt > now)
    .map(rt => ({
      device: rt.device,
      ip: rt.ip,
      createdAt: rt.createdAt,
      expiresAt: rt.expiresAt,
      isCurrent: req.cookies?.refreshToken === rt.token,
    }));

  return successResponse(
    res,
    {
      sessions: activeSessions,
      total: activeSessions.length,
    },
    'Sesiones activas obtenidas'
  );
});

/**
 * Revoke specific session
 * @route DELETE /api/v1/auth/sessions/:sessionIndex
 * @access Private
 */
export const revokeSession = asyncHandler(async (req, res) => {
  const { sessionIndex } = req.params;
  const user = await User.findById(req.userId).select('+refreshTokens');

  if (!user) {
    return errorResponse(
      res,
      'Usuario no encontrado',
      HTTP_STATUS.NOT_FOUND
    );
  }

  const index = parseInt(sessionIndex, 10);
  if (index < 0 || index >= user.refreshTokens.length) {
    return errorResponse(
      res,
      'Sesión no encontrada',
      HTTP_STATUS.NOT_FOUND
    );
  }

  // Remover sesión
  user.refreshTokens.splice(index, 1);
  await user.save();

  logger.info(`Session revoked for user: ${user.email}`);

  return successResponse(res, null, 'Sesión cerrada exitosamente');
});

/**
 * Get current user profile
 * @route GET /api/v1/auth/me
 * @access Private
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);

  if (!user) {
    return errorResponse(
      res,
      'Usuario no encontrado',
      HTTP_STATUS.NOT_FOUND
    );
  }

  return successResponse(
    res,
    { user: user.toAuthJSON() },
    'Perfil obtenido exitosamente'
  );
});

/**
 * Update current user profile
 * @route PUT /api/v1/auth/me
 * @access Private
 */
export const updateMe = asyncHandler(async (req, res) => {
  const { nombre, telefono, cargo, especialidad } = req.body;

  const user = await User.findById(req.userId);

  if (!user) {
    return errorResponse(
      res,
      'Usuario no encontrado',
      HTTP_STATUS.NOT_FOUND
    );
  }

  // Update allowed fields
  if (nombre) user.nombre = nombre;
  if (telefono) user.telefono = telefono;
  if (cargo) user.cargo = cargo;
  if (especialidad) user.especialidad = especialidad;

  await user.save();

  logger.info(`User updated profile: ${user.email}`);

  return successResponse(
    res,
    { user: user.toAuthJSON() },
    'Perfil actualizado exitosamente'
  );
});

/**
 * Change password
 * @route POST /api/v1/auth/change-password
 * @access Private
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.userId).select('+password');

  if (!user) {
    return errorResponse(
      res,
      'Usuario no encontrado',
      HTTP_STATUS.NOT_FOUND
    );
  }

  // Verify current password
  const isPasswordValid = await user.comparePassword(currentPassword);

  if (!isPasswordValid) {
    return errorResponse(
      res,
      'Contraseña actual incorrecta',
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  // Check if new password is different
  const isSamePassword = await user.comparePassword(newPassword);
  if (isSamePassword) {
    return errorResponse(
      res,
      'La nueva contraseña debe ser diferente a la actual',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // Update password
  user.password = newPassword;
  
  // ✅ ROTACIÓN: Invalidar todos los tokens anteriores
  await user.invalidateAllTokens();

  // ✅ AGREGAR: Revocar token actual también en blacklist
  const currentToken = req.headers.authorization?.split(' ')[1];
  if (currentToken) {
    await BlacklistedToken.revokeToken(
      currentToken,
      req.userId,
      'PASSWORD_CHANGE',
      { ipAddress: req.ip }
    );
  }

  logger.info(`User changed password: ${user.email}`);

  // Notify user via Socket.IO
  try {
    emitToUser(user._id.toString(), 'password_changed', {
      message: 'Tu contraseña ha sido cambiada. Todas las sesiones fueron cerradas.',
    });
  } catch (error) {
    logger.debug('Socket notification failed:', error);
  }

  // ✅ AGREGAR: Log de auditoría de cambio de contraseña
  await createAuditLog({
    userId: req.userId,
    userEmail: user.email,
    userRole: user.rol,
    action: 'PASSWORD_CHANGE',
    resource: 'User',
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    status: 'SUCCESS',
    severity: 'HIGH'
  });

  // Clear cookies
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  return successResponse(
    res,
    null,
    'Contraseña cambiada exitosamente. Por favor, inicia sesión nuevamente'
  );
});

/**
 * Request password reset
 * @route POST /api/v1/auth/forgot-password
 * @access Public
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    // Don't reveal if user exists
    return successResponse(
      res,
      null,
      'Si el email existe, recibirás instrucciones para restablecer tu contraseña'
    );
  }

  // Generate reset token
  const resetToken = crypto.randomUUID();
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  user.passwordResetToken = resetToken;
  user.passwordResetExpires = resetTokenExpiry;
  await user.save();

  // TODO: Send email with reset link
  // const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  // await sendPasswordResetEmail(user.email, resetUrl);

  logger.info(`Password reset requested for: ${user.email}`);

  return successResponse(
    res,
    process.env.NODE_ENV === 'development' ? { resetToken } : null,
    'Si el email existe, recibirás instrucciones para restablecer tu contraseña'
  );
});

/**
 * Reset password
 * @route POST /api/v1/auth/reset-password
 * @access Public
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return errorResponse(
      res,
      'Token inválido o expirado',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // Update password
  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  
  // ✅ ROTACIÓN: Invalidar todos los tokens
  await user.invalidateAllTokens();

  logger.info(`Password reset completed for: ${user.email}`);

  return successResponse(
    res,
    null,
    'Contraseña restablecida exitosamente. Por favor, inicia sesión'
  );
});

/**
 * Verify token
 * @route GET /api/v1/auth/verify
 * @access Private
 */
export const verifyToken = asyncHandler(async (req, res) => {
  return successResponse(
    res,
    {
      valid: true,
      user: req.user.toAuthJSON(),
    },
    'Token válido'
  );
});

