/**
 * Auth Service (Optimized with Token Rotation - October 2025)
 * @description Servicios de autenticación con refresh token rotation
 */

import User from '../models/User.js';
import { generateTokenPair, verifyRefreshToken } from '../config/jwt.js';
import { logger } from '../utils/logger.js';

/**
 * Autenticar usuario con email y contraseña
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña
 * @param {Object} metadata - Información de dispositivo/sesión
 * @returns {Promise<Object>} Usuario y tokens
 */
export const authenticateUser = async (email, password, metadata = {}) => {
  try {
    // Buscar usuario con campos de seguridad
    const user = await User.findByEmail(email);

    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    // Verificar si cuenta está bloqueada
    if (user.isLocked) {
      const lockTime = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
      throw new Error(`Cuenta bloqueada. Intenta en ${lockTime} minutos`);
    }

    // Verificar si está activo
    if (!user.isActive) {
      throw new Error('Usuario inactivo');
    }

    // Comparar contraseña
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      // Incrementar intentos fallidos
      await user.incrementLoginAttempts();
      throw new Error('Credenciales inválidas');
    }

    // Login exitoso - resetear intentos
    await user.resetLoginAttempts(metadata.ip);

    // Generar tokens con metadata
    const tokens = await generateTokenPair(
      {
        userId: user._id.toString(),
        role: user.rol,
        tokenVersion: user.tokenVersion || 0,
      },
      metadata
    );

    // Calcular fecha de expiración del refresh token
    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7);

    // Agregar refresh token al usuario
    await user.addRefreshToken(
      tokens.refreshToken,
      refreshExpiresAt,
      metadata.device,
      metadata.ip,
      metadata.userAgent
    );

    logger.info(`Usuario autenticado: ${user.email} from ${metadata.device}`);

    return {
      user: user.toAuthJSON(),
      tokens,
    };
  } catch (error) {
    logger.error('Error en autenticación:', error.message);
    throw error;
  }
};

/**
 * Renovar tokens usando refresh token (CON ROTACIÓN)
 * @param {string} refreshToken - Refresh token actual
 * @param {Object} metadata - Información de dispositivo/sesión
 * @returns {Promise<Object>} Nuevos tokens
 */
export const refreshUserTokens = async (refreshToken, metadata = {}) => {
  try {
    // Verificar refresh token
    const decoded = await verifyRefreshToken(refreshToken);

    // Buscar usuario con tokenVersion
    const user = await User.findById(decoded.userId)
      .select('+tokenVersion +refreshTokens');

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Verificar que el refresh token existe y es válido
    if (!user.hasValidRefreshToken(refreshToken)) {
      logger.warn(`Invalid refresh token used for user: ${user.email}`);
      throw new Error('Refresh token inválido o ya fue usado');
    }

    // Verificar tokenVersion
    if (decoded.tokenVersion !== undefined && decoded.tokenVersion !== user.tokenVersion) {
      logger.warn(`Outdated token version used for user: ${user.email}`);
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente');
    }

    if (!user.isActive) {
      throw new Error('Usuario inactivo');
    }

    // ✅ ROTACIÓN: Generar NUEVOS tokens
    const newTokens = await generateTokenPair(
      {
        userId: user._id.toString(),
        role: user.rol,
        tokenVersion: user.tokenVersion || 0,
      },
      metadata
    );

    // ✅ ROTACIÓN: Remover refresh token antiguo
    await user.removeRefreshToken(refreshToken);

    // ✅ ROTACIÓN: Agregar nuevo refresh token
    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7);
    
    await user.addRefreshToken(
      newTokens.refreshToken,
      refreshExpiresAt,
      metadata.device,
      metadata.ip,
      metadata.userAgent
    );

    logger.info(`Tokens refreshed for user: ${user.email}`);

    return newTokens;
  } catch (error) {
    logger.error('Error al renovar tokens:', error.message);
    throw error;
  }
};

/**
 * Cerrar sesión de usuario (remover refresh token específico)
 * @param {string} userId - ID del usuario
 * @param {string} refreshToken - Refresh token a invalidar
 * @returns {Promise<boolean>}
 */
export const logoutUser = async (userId, refreshToken) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    if (refreshToken) {
      await user.removeRefreshToken(refreshToken);
    }

    logger.info(`Usuario cerró sesión: ${user.email}`);
    return true;
  } catch (error) {
    logger.error('Error al cerrar sesión:', error.message);
    throw error;
  }
};

/**
 * Cerrar todas las sesiones de usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<boolean>}
 */
export const logoutAllDevices = async (userId) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    await user.invalidateAllTokens();

    logger.info(`Usuario cerró todas las sesiones: ${user.email}`);
    return true;
  } catch (error) {
    logger.error('Error al cerrar todas las sesiones:', error.message);
    throw error;
  }
};

/**
 * Obtener sesiones activas de usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} Array de sesiones activas
 */
export const getActiveSessions = async (userId) => {
  try {
    const user = await User.findById(userId).select('+refreshTokens');
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Filtrar solo tokens no expirados
    const now = new Date();
    const activeSessions = user.refreshTokens
      .filter(rt => rt.expiresAt > now)
      .map(rt => ({
        device: rt.device,
        ip: rt.ip,
        userAgent: rt.userAgent,
        createdAt: rt.createdAt,
        expiresAt: rt.expiresAt,
      }));

    return activeSessions;
  } catch (error) {
    logger.error('Error al obtener sesiones:', error.message);
    throw error;
  }
};

/**
 * Cambiar contraseña de usuario
 * @param {string} userId - ID del usuario
 * @param {string} currentPassword - Contraseña actual
 * @param {string} newPassword - Nueva contraseña
 * @returns {Promise<boolean>}
 */
export const changeUserPassword = async (userId, currentPassword, newPassword) => {
  try {
    const user = await User.findById(userId).select('+password');

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Verificar contraseña actual
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      throw new Error('Contraseña actual incorrecta');
    }

    // Verificar que la nueva contraseña sea diferente
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      throw new Error('La nueva contraseña debe ser diferente');
    }

    // Actualizar contraseña
    user.password = newPassword;
    
    // ✅ Invalidar todos los tokens (forzar re-login)
    await user.invalidateAllTokens();

    logger.info(`Contraseña cambiada para: ${user.email}`);
    return true;
  } catch (error) {
    logger.error('Error al cambiar contraseña:', error.message);
    throw error;
  }
};

/**
 * Generar token de restablecimiento de contraseña
 * @param {string} email - Email del usuario
 * @returns {Promise<Object|null>}
 */
export const generatePasswordResetToken = async (email) => {
  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // No revelar si el usuario existe
      return null;
    }

    // Generar token seguro
    const resetToken = crypto.randomUUID();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetTokenExpiry;
    await user.save();

    logger.info(`Token de restablecimiento generado para: ${user.email}`);

    return {
      resetToken,
      email: user.email,
      expiresAt: resetTokenExpiry,
    };
  } catch (error) {
    logger.error('Error al generar token de restablecimiento:', error.message);
    throw error;
  }
};

/**
 * Restablecer contraseña con token
 * @param {string} token - Token de restablecimiento
 * @param {string} newPassword - Nueva contraseña
 * @returns {Promise<boolean>}
 */
export const resetPasswordWithToken = async (token, newPassword) => {
  try {
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new Error('Token inválido o expirado');
    }

    // Actualizar contraseña
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    // ✅ Invalidar todos los tokens
    await user.invalidateAllTokens();

    logger.info(`Contraseña restablecida para: ${user.email}`);
    return true;
  } catch (error) {
    logger.error('Error al restablecer contraseña:', error.message);
    throw error;
  }
};

/**
 * Verificar si un usuario tiene sesiones activas
 * @param {string} userId - ID del usuario
 * @returns {Promise<number>} Número de sesiones activas
 */
export const getActiveSessionsCount = async (userId) => {
  try {
    const user = await User.findById(userId).select('+refreshTokens');
    
    if (!user) {
      return 0;
    }

    const now = new Date();
    const activeCount = user.refreshTokens.filter(rt => rt.expiresAt > now).length;
    
    return activeCount;
  } catch (error) {
    logger.error('Error al contar sesiones activas:', error.message);
    return 0;
  }
};

