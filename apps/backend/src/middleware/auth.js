/**
 * Middleware de Autenticación
 * @description Verificación de token JWT y carga de datos del usuario
 */

import { verifyAccessToken } from '../config/jwt.js';
import { errorResponse } from '../utils/response.js';
import { HTTP_STATUS } from '../utils/constants.js';
import { logger } from '../utils/logger.js';
import User from '../models/User.js';
// ✅ AGREGAR: Importar BlacklistedToken
import BlacklistedToken from '../models/BlacklistedToken.js';

/**
 * Middleware de autenticación principal
 * Verifica el token JWT y carga los datos del usuario autenticado
 */
export const authenticate = async (req, res, next) => {
  try {
    // Obtener token desde header Authorization o cookies
    let token = req.headers.authorization?.split(' ')[1];
    
    if (!token && req.cookies) {
      token = req.cookies.accessToken;
    }

    // Verificar que el token existe
    if (!token) {
      return errorResponse(
        res,
        'No autorizado. Token no proporcionado',
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    // ✅ AGREGAR: Verificar blacklist
    const isBlacklisted = await BlacklistedToken.isBlacklisted(token);

    if (isBlacklisted) {
      return errorResponse(
        res,
        'Token revocado. Inicia sesión nuevamente.',
        HTTP_STATUS.UNAUTHORIZED,
        [],
        'TOKEN_BLACKLISTED'
      );
    }

    // Verificar y decodificar el token
    const decoded = await verifyAccessToken(token);

    // Buscar el usuario en la base de datos
    const user = await User.findById(decoded.userId).select('-password -refreshToken');

    if (!user) {
      return errorResponse(
        res,
        'Usuario no encontrado',
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    // Verificar que el usuario está activo
    if (!user.isActive) {
      return errorResponse(
        res,
        'Usuario inactivo. Contacta al administrador',
        HTTP_STATUS.FORBIDDEN
      );
    }

    // Adjuntar datos del usuario al request
    req.user = user;
    req.userId = user._id;
    req.userRole = user.rol;

    next();
  } catch (error) {
    logger.error('Error en autenticación:', error);
    
    // Manejar diferentes tipos de errores de token
    if (error.message.includes('expired')) {
      return errorResponse(
        res,
        'Token expirado. Por favor, inicia sesión nuevamente',
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    if (error.message.includes('invalid') || error.message.includes('malformed')) {
      return errorResponse(
        res,
        'Token inválido',
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    return errorResponse(
      res,
      'Error de autenticación',
      HTTP_STATUS.UNAUTHORIZED
    );
  }
};

/**
 * Autenticación opcional
 * No falla si no hay token, pero carga el usuario si existe
 * Útil para endpoints públicos que pueden beneficiarse de datos del usuario
 */
export const optionalAuth = async (req, res, next) => {
  try {
    // Obtener token desde header Authorization o cookies
    let token = req.headers.authorization?.split(' ')[1];
    
    if (!token && req.cookies) {
      token = req.cookies.accessToken;
    }

    // Si no hay token, continuar sin autenticar
    if (!token) {
      return next();
    }

  // Verificar y decodificar el token
  const decoded = await verifyAccessToken(token);
    
    // Buscar el usuario en la base de datos
    const user = await User.findById(decoded.userId).select('-password -refreshToken');
    
    // Si el usuario existe y está activo, adjuntarlo al request
    if (user && user.isActive) {
      req.user = user;
      req.userId = user._id;
      req.userRole = user.rol;
    }

    next();
  } catch (error) {
    // En caso de error, continuar sin autenticar (es opcional)
    logger.debug('Optional auth failed (expected behavior):', error.message);
    next();
  }
};

/**
 * Verificar que el usuario está autenticado
 * Alias más descriptivo para authenticate
 */
export const requireAuth = authenticate;

/**
 * Middleware para verificar autenticación desde WebSocket
 * Utilizado en Socket.IO
 */
export const authenticateSocket = async (socket, next) => {
  try {
    // Obtener token desde handshake
    const token = socket.handshake.auth.token || 
                  socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Autenticación requerida'));
    }

  // Verificar token
  const decoded = await verifyAccessToken(token);

    // Buscar usuario
    const user = await User.findById(decoded.userId).select('-password -refreshToken');

    if (!user || !user.isActive) {
      return next(new Error('Usuario inválido o inactivo'));
    }

    // Adjuntar datos al socket
    socket.userId = user._id.toString();
    socket.userRole = user.rol;
    socket.user = user;

    next();
  } catch (error) {
    logger.error('Error en autenticación de socket:', error);
    next(new Error('Token inválido'));
  }
};
