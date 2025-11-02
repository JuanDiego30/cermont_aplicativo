# CERMONT ATG - Código Completo

Este documento contiene todo el código fuente del proyecto CERMONT ATG, organizado por backend y frontend. Generado para análisis de errores de autenticación.

## Índice

### Backend
- [Configuración](#backend-config)
- [Modelos](#backend-models)
- [Controladores](#backend-controllers)
- [Servicios](#backend-services)
- [Middleware](#backend-middleware)
- [Rutas](#backend-routes)
- [Utilidades](#backend-utils)

### Frontend
- [Configuración](#frontend-config)
- [Componentes](#frontend-components)
- [Servicios](#frontend-services)
- [Tipos](#frontend-types)
- [Páginas](#frontend-pages)

---

## Backend

### Configuración {#backend-config}

#### server.js
```javascript
// apps/backend/src/server.js
```

#### app.js
```javascript
// apps/backend/src/app.js
```

#### database.js
```javascript
// apps/backend/src/config/database.js
```

#### jwt.js
```javascript
/**
 * JWT Configuration (Optimized with Token Rotation - October 2025)
 * @description Uso de library `jose` para firmar y verificar JWT con rotation
 */

import * as jose from 'jose';
import { logger } from '../utils/logger.js';

const JWT_OPTIONS = {
  issuer: 'cermont-api',
  audience: 'cermont-client',
};

// Claves como Uint8Array para HMAC
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-min-32-chars'
);
const JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-min-32-chars'
);

// Configuración de expiración
const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Generar access token
 * @param {Object} payload - Datos a incluir en el token
 * @returns {Promise<string>} Access token firmado
 */
export const generateAccessToken = async (payload) => {
  try {
    const token = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(ACCESS_TOKEN_EXPIRES_IN)
      .setIssuer(JWT_OPTIONS.issuer)
      .setAudience(JWT_OPTIONS.audience)
      .setJti(crypto.randomUUID()) // Unique token ID
      .sign(JWT_SECRET);
    
    logger.debug(`Access token generated for user: ${payload.userId}`);
    return token;
  } catch (error) {
    logger.error('Error generating access token:', error);
    throw new Error('Could not generate access token');
  }
};

/**
 * Generar refresh token con metadata de sesión
 * @param {Object} payload - Datos del usuario
 * @param {Object} metadata - Información de dispositivo/sesión
 * @returns {Promise<string>} Refresh token firmado
 */
export const generateRefreshToken = async (payload, metadata = {}) => {
  try {
    // Agregar metadata de sesión al payload
    const enrichedPayload = {
      ...payload,
      sessionId: crypto.randomUUID(), // ID único de sesión
      device: metadata.device || 'unknown',
      ip: metadata.ip || 'unknown',
      timestamp: Date.now(),
    };
    
    const token = await new jose.SignJWT(enrichedPayload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(REFRESH_TOKEN_EXPIRES_IN)
      .setIssuer(JWT_OPTIONS.issuer)
      .setAudience(JWT_OPTIONS.audience)
      .setJti(crypto.randomUUID()) // Unique token ID
      .sign(JWT_REFRESH_SECRET);
    
    logger.debug(`Refresh token generated for user: ${payload.userId}`);
    return token;
  } catch (error) {
    logger.error('Error generating refresh token:', error);
    throw new Error('Could not generate refresh token');
  }
};

/**
 * Verificar access token
 * @param {string} token - Token a verificar
 * @returns {Promise<Object>} Payload del token
 */
export const verifyAccessToken = async (token) => {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET, {
      issuer: JWT_OPTIONS.issuer,
      audience: JWT_OPTIONS.audience,
    });
    
    return payload;
  } catch (error) {
    if (error.code === 'ERR_JWT_EXPIRED') {
      logger.debug('Access token expired');
      throw new Error('Token expirado');
    }
    
    logger.debug('Invalid access token:', error.message);
    throw new Error('Token inválido');
  }
};

/**
 * Verificar refresh token
 * @param {string} token - Refresh token a verificar
 * @returns {Promise<Object>} Payload del token
 */
export const verifyRefreshToken = async (token) => {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_REFRESH_SECRET, {
      issuer: JWT_OPTIONS.issuer,
      audience: JWT_OPTIONS.audience,
    });
    
    return payload;
  } catch (error) {
    if (error.code === 'ERR_JWT_EXPIRED') {
      logger.debug('Refresh token expired');
      throw new Error('Refresh token expirado');
    }
    
    logger.debug('Invalid refresh token:', error.message);
    throw new Error('Refresh token inválido');
  }
};

/**
 * Decodificar token sin verificar (uso limitado - solo para debugging)
 * @param {string} token - Token a decodificar
 * @returns {Object|null} Payload decodificado o null
 */
export const decodeToken = (token) => {
  try {
    const decoded = jose.decodeJwt(token);
    return decoded;
  } catch (err) {
    logger.debug('Error decoding token:', err);
    return null;
  }
};

/**
 * Generar par de tokens (access + refresh) con metadata
 * @param {Object} payload - Datos del usuario
 * @param {Object} metadata - Información de sesión
 * @returns {Promise<Object>} Par de tokens con metadata
 */
export const generateTokenPair = async (payload, metadata = {}) => {
  try {
    const [accessToken, refreshToken] = await Promise.all([
      generateAccessToken(payload),
      generateRefreshToken(payload, metadata),
    ]);
    
    // Calcular tiempo de expiración en segundos
    const expiresIn = parseExpiration(ACCESS_TOKEN_EXPIRES_IN);
    
    logger.info(`Token pair generated for user: ${payload.userId}`);
    
    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn, // en segundos
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
    };
  } catch (error) {
    logger.error('Error generating token pair:', error);
    throw new Error('Could not generate token pair');
  }
};

/**
 * Parsear string de expiración a segundos
 * @param {string} expiresIn - String de tiempo (ej: '15m', '7d', '1h')
 * @returns {number} Segundos
 */
const parseExpiration = (expiresIn) => {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) return 900; // Default: 15 minutos
  
  const [, value, unit] = match;
  const num = parseInt(value, 10);
  
  const units = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
  };
  
  return num * units[unit];
};

/**
 * Obtener tiempo restante de un token
 * @param {string} token - Token JWT
 * @returns {number|null} Segundos restantes o null si expirado/inválido
 */
export const getTokenTimeRemaining = (token) => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return null;
    
    const now = Math.floor(Date.now() / 1000);
    const remaining = decoded.exp - now;
    
    return remaining > 0 ? remaining : 0;
  } catch {
    return null;
  }
};

/**
 * Verificar si un token está próximo a expirar
 * @param {string} token - Token JWT
 * @param {number} thresholdSeconds - Umbral en segundos (default: 5 min)
 * @returns {boolean} true si está por expirar
 */
export const isTokenExpiringSoon = (token, thresholdSeconds = 300) => {
  const remaining = getTokenTimeRemaining(token);
  return remaining !== null && remaining < thresholdSeconds;
};

/**
 * Extraer metadata de un token
 * @param {string} token - Token JWT
 * @returns {Object|null} Metadata del token
 */
export const extractTokenMetadata = (token) => {
  try {
    const decoded = decodeToken(token);
    if (!decoded) return null;
    
    return {
      userId: decoded.userId,
      role: decoded.role,
      sessionId: decoded.sessionId,
      device: decoded.device,
      ip: decoded.ip,
      issuedAt: decoded.iat ? new Date(decoded.iat * 1000) : null,
      expiresAt: decoded.exp ? new Date(decoded.exp * 1000) : null,
    };
  } catch (error) {
    logger.debug('Error extracting token metadata:', error);
    return null;
  }
};

// Exportar constantes útiles
export const TOKEN_CONSTANTS = {
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
  ACCESS_TOKEN_SECONDS: parseExpiration(ACCESS_TOKEN_EXPIRES_IN),
  REFRESH_TOKEN_SECONDS: parseExpiration(REFRESH_TOKEN_EXPIRES_IN),
};
```

### Modelos {#backend-models}

#### User.js
```javascript
// apps/backend/src/models/User.js
/**
 * User Model (Optimized - October 2025)
 * @description Modelo para usuarios con seguridad avanzada y performance optimizado
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES } from '../utils/constants.js';
import { hashPassword, verifyPassword, detectHashType } from '../utils/passwordHash.js';
import { logger } from '../utils/logger.js';

const userSchema = new mongoose.Schema(
  {
    // ============================================================================
    // INFORMACIÓN PERSONAL
    // ============================================================================
    nombre: {
      type: String,
      required: [true, 'El nombre es requerido'],
      trim: true,
      minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
      maxlength: [100, 'El nombre no puede exceder 100 caracteres'],
    },
    
    // ============================================================================
    // CREDENCIALES
    // ============================================================================
    email: {
      type: String,
      required: [true, 'El email es requerido'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email inválido'],
    },
    password: {
      type: String,
      required: [true, 'La contraseña es requerida'],
      minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
      select: false, // No devolver por defecto
    },
    
    // ============================================================================
    // ROL Y PERMISOS
    // ============================================================================
    rol: {
      type: String,
      enum: {
        values: Object.values(ROLES),
        message: 'Rol inválido',
      },
      default: ROLES.TECHNICIAN,
      required: true,
    },
    
    // ============================================================================
    // INFORMACIÓN DE CONTACTO
    // ============================================================================
    telefono: {
      type: String,
      trim: true,
    },
    
    // ============================================================================
    // IDENTIFICACIÓN
    // ============================================================================
    cedula: {
      type: String,
      trim: true,
      unique: true,
      sparse: true, // Permite valores null múltiples
    },
    
    // ============================================================================
    // INFORMACIÓN LABORAL
    // ============================================================================
    cargo: {
      type: String,
      trim: true,
      maxlength: [100, 'El cargo no puede exceder 100 caracteres'],
    },
    especialidad: {
      type: String,
      trim: true,
      maxlength: [100, 'La especialidad no puede exceder 100 caracteres'],
    },
    
    // ============================================================================
    // AVATAR/FOTO
    // ============================================================================
    avatar: {
      type: String,
      default: null,
    },
    
    // ============================================================================
    // ESTADO
    // ============================================================================
    isActive: {
      type: Boolean,
      default: true,
    },
    
    // ============================================================================
    // SEGURIDAD AVANZADA (NUEVO)
    // ============================================================================
    
    // Token versioning para invalidar tokens antiguos
    tokenVersion: {
      type: Number,
      default: 0,
      select: false, // No devolver en queries
    },
    
    // Refresh tokens para múltiples dispositivos
    refreshTokens: [{
      token: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      expiresAt: {
        type: Date,
        required: true,
      },
      device: {
        type: String,
        default: 'unknown',
      },
      ip: String,
      userAgent: String,
    }],
    
    // Protección contra brute force
    loginAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    lockUntil: {
      type: Date,
      select: false,
    },
    
    // ============================================================================
    // AUDITORÍA Y SESIONES (NUEVO)
    // ============================================================================
    lastLogin: {
      type: Date,
      default: null,
    },
    lastLoginIp: {
      type: String,
      select: false,
    },
    lastPasswordChange: {
      type: Date,
      default: Date.now,
      select: false,
    },
    
    // Historial de cambios importantes (últimos 10)
    securityLog: [{
      action: {
        type: String,
        enum: ['password_change', 'email_change', 'role_change', 'account_locked', 'account_unlocked'],
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      ip: String,
      performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    }],
    
    // ============================================================================
    // TOKENS (EXISTENTES - Mantener compatibilidad)
    // ============================================================================
    refreshToken: {
      type: String,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    
    // ============================================================================
    // AUDITORÍA DE CREACIÓN/MODIFICACIÓN (NUEVO)
    // ============================================================================
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      select: false,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ============================================================================
// ÍNDICES OPTIMIZADOS
// ============================================================================

// Índices simples
// (email y cedula ya tienen unique: true en campo, no necesitan schema.index simple)
userSchema.index({ rol: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Índices compuestos para queries comunes
userSchema.index({ email: 1, isActive: 1 });
userSchema.index({ rol: 1, isActive: 1 });
userSchema.index({ isActive: 1, lastLogin: -1 }); // Para dashboard

// Índice de texto para búsqueda
userSchema.index({ nombre: 'text', email: 'text' });

// ============================================================================
// VIRTUALS
// ============================================================================

// Virtual: Nombre completo
userSchema.virtual('nombreCompleto').get(function () {
  return this.nombre;
});

// Virtual: Iniciales
userSchema.virtual('iniciales').get(function () {
  const nombres = this.nombre.split(' ');
  return nombres.map(n => n[0]).join('').toUpperCase();
});

// Virtual: Verificar si cuenta está bloqueada
userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// ============================================================================
// MIDDLEWARE PRE-SAVE
// ============================================================================

// Hash de contraseña
userSchema.pre('save', async function (next) {
  // Solo hashear si la contraseña fue modificada
  if (!this.isModified('password')) return next();

  try {
    // Registrar cambio de contraseña en log de seguridad
    if (!this.isNew) {
      this.lastPasswordChange = new Date();
      this.securityLog.push({
        action: 'password_change',
        timestamp: new Date(),
        performedBy: this._id,
      });
      
      // Mantener solo últimos 10 logs
      if (this.securityLog.length > 10) {
        this.securityLog = this.securityLog.slice(-10);
      }
    }
    
    // Hash con Argon2
    this.password = await hashPassword(this.password);
    next();
  } catch (error) {
    next(error);
  }
});

// Limpiar refresh tokens expirados antes de guardar
userSchema.pre('save', function (next) {
  if (this.refreshTokens && this.refreshTokens.length > 0) {
    this.refreshTokens = this.refreshTokens.filter(
      token => token.expiresAt > new Date()
    );
  }
  next();
});

// ============================================================================
// MÉTODOS DE INSTANCIA
// ============================================================================

/**
 * Comparar contraseña con hash almacenado
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    const hashType = detectHashType(this.password);

    if (hashType === 'bcrypt') {
      // Hash antiguo con bcrypt (compatibilidad)
      const isMatch = await bcrypt.compare(candidatePassword, this.password);

      // Si es correcto, rehash con argon2 y guardar
      if (isMatch) {
        try {
          this.password = await hashPassword(candidatePassword);
          await this.save();
          logger.info(`Password rehashed to argon2 for user: ${this.email}`);
        } catch (err) {
          logger.error('Rehash to argon2 failed:', err);
        }
      }

      return isMatch;
    } else if (hashType === 'argon2') {
      // Hash nuevo con argon2
      return await verifyPassword(this.password, candidatePassword);
    }

    return false;
  } catch (error) {
    // Log the original error for debugging
    console.error('comparePassword error:', error);
    throw new Error('Error al comparar contraseñas');
  }
};

/**
 * Generar objeto para JWT/Auth (sin datos sensibles)
 */
userSchema.methods.toAuthJSON = function () {
  return {
    _id: this._id,
    nombre: this.nombre,
    email: this.email,
    rol: this.rol,
    telefono: this.telefono,
    cedula: this.cedula,
    cargo: this.cargo,
    especialidad: this.especialidad,
    avatar: this.avatar,
    isActive: this.isActive,
    lastLogin: this.lastLogin,
  };
};

/**
 * Verificar si tiene rol específico
 */
userSchema.methods.hasRole = function (role) {
  return this.rol === role;
};

/**
 * Verificar si tiene al menos cierto nivel de rol
 */
userSchema.methods.hasMinRole = function (minRole) {
  const ROLE_HIERARCHY = {
    root: 100,
    admin: 90,
    coordinator_hes: 80,
    engineer: 70,
    supervisor: 60,
    technician: 50,
    accountant: 40,
    client: 10,
  };
  
  return ROLE_HIERARCHY[this.rol] >= ROLE_HIERARCHY[minRole];
};

// ============================================================================
// MÉTODOS DE SEGURIDAD (NUEVO)
// ============================================================================

/**
 * Incrementar intentos de login fallidos
 */
userSchema.methods.incrementLoginAttempts = async function () {
  // Si ya está bloqueado y el periodo expiró, resetear
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return await this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }
  
  // Incrementar intentos
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Bloquear cuenta si se alcanzó el máximo de intentos (5)
  const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
  const lockTime = parseInt(process.env.ACCOUNT_LOCKOUT_TIME) || 15 * 60 * 1000; // 15 min
  
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + lockTime };
    
    // Registrar en log de seguridad
    this.securityLog.push({
      action: 'account_locked',
      timestamp: new Date(),
    });
    
    logger.warn(`Account locked due to failed login attempts: ${this.email}`);
  }
  
  return await this.updateOne(updates);
};

/**
 * Resetear intentos de login después de login exitoso
 */
userSchema.methods.resetLoginAttempts = async function (ip) {
  return await this.updateOne({
    $set: { 
      loginAttempts: 0,
      lastLogin: new Date(),
      lastLoginIp: ip,
    },
    $unset: { lockUntil: 1 },
  });
};

/**
 * Invalidar todos los tokens (logout en todos los dispositivos)
 */
userSchema.methods.invalidateAllTokens = async function () {
  this.tokenVersion += 1;
  this.refreshTokens = [];
  
  logger.info(`All tokens invalidated for user: ${this.email}`);
  
  return await this.save();
};

/**
 * Agregar refresh token para un dispositivo
 */
userSchema.methods.addRefreshToken = async function (token, expiresAt, device = 'unknown', ip, userAgent) {
  // Limitar a máximo 5 dispositivos
  if (this.refreshTokens.length >= 5) {
    // Eliminar el más antiguo
    this.refreshTokens.shift();
  }
  
  this.refreshTokens.push({
    token,
    expiresAt,
    device,
    ip,
    userAgent,
  });
  
  return await this.save();
};

/**
 * Remover refresh token específico
 */
userSchema.methods.removeRefreshToken = async function (token) {
  this.refreshTokens = this.refreshTokens.filter(rt => rt.token !== token);
  return await this.save();
};

/**
 * Verificar si refresh token es válido
 */
userSchema.methods.hasValidRefreshToken = function (token) {
  return this.refreshTokens.some(
    rt => rt.token === token && rt.expiresAt > new Date()
  );
};

// ============================================================================
// MÉTODOS ESTÁTICOS
// ============================================================================

/**
 * Buscar por email (incluye password para autenticación)
 */
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() })
    .select('+password +loginAttempts +lockUntil +tokenVersion');
};

/**
 * Buscar por rol
 */
userSchema.statics.findByRole = function (role) {
  return this.find({ rol: role, isActive: true });
};

/**
 * Buscar usuarios activos
 */
userSchema.statics.findActive = function () {
  return this.find({ isActive: true });
};

/**
 * Búsqueda full-text
 */
userSchema.statics.search = function (query) {
  return this.find(
    { $text: { $search: query }, isActive: true },
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } });
};

/**
 * Estadísticas de usuarios
 */
userSchema.statics.getStats = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$rol',
        count: { $sum: 1 },
        active: {
          $sum: { $cond: ['$isActive', 1, 0] },
        },
      },
    },
  ]);
  
  return stats;
};

// ============================================================================
// EXPORTAR MODELO
// ============================================================================

const User = mongoose.model('User', userSchema);

export default User;
```

#### AuditLog.js
```javascript
// apps/backend/src/models/AuditLog.js
```

#### BlacklistedToken.js
```javascript
// apps/backend/src/models/BlacklistedToken.js
```

### Controladores {#backend-controllers}

#### auth.controller.js
```javascript
// apps/backend/src/controllers/auth.controller.js
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

// [RESTO DEL ARCHIVO TRUNCADO PARA BREVEDAD - CONTINÚA CON logout, refreshToken, etc.]
```

#### users.controller.js
```javascript
// apps/backend/src/controllers/users.controller.js
```

### Servicios {#backend-services}

#### auth.service.js
```javascript
// apps/backend/src/services/auth.service.js
```

#### user.service.js
```javascript
// apps/backend/src/services/user.service.js
```

### Middleware {#backend-middleware}

#### auth.js
```javascript
// apps/backend/src/middleware/auth.js
```

#### errorHandler.js
```javascript
// apps/backend/src/middleware/errorHandler.js
```

### Rutas {#backend-routes}

#### auth.routes.js
```javascript
// apps/backend/src/routes/auth.routes.js
```

#### index.js
```javascript
// apps/backend/src/routes/index.js
```

### Utilidades {#backend-utils}

#### passwordHash.js
```javascript
// apps/backend/src/utils/passwordHash.js
```

#### response.js
```javascript
// apps/backend/src/utils/response.js
```

---

## Frontend

### Configuración {#frontend-config}

#### next.config.ts
```typescript
// apps/frontend/next.config.ts
```

#### tsconfig.json
```json
// apps/frontend/tsconfig.json
```

### Componentes {#frontend-components}

#### AuthContext.tsx
```tsx
// apps/frontend/src/lib/auth/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { User } from '@/types/user.types';

interface AuthContextType {
user: User | null;
loading: boolean;
isAuthenticated: boolean;
login: (email: string, password: string) => Promise<void>;
logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
const [user, setUser] = useState<User | null>(null);
const [loading, setLoading] = useState(true);
const router = useRouter();

useEffect(() => {
checkAuth();
}, []);

const checkAuth = async () => {
try {
const token = localStorage.getItem('accessToken');
if (token) {
const currentUser = await authService.getCurrentUser();
setUser(currentUser);
}
} catch (error) {
console.error('Error verificando autenticación:', error);
localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');
} finally {
setLoading(false);
}
};

const login = async (email: string, password: string) => {
try {
const { user, tokens } = await authService.login({ email, password });
localStorage.setItem('accessToken', tokens.accessToken);
localStorage.setItem('refreshToken', tokens.refreshToken);
setUser(user);
router.push('/dashboard');
} catch (error) {
console.error('Error en login:', error);
throw error;
}
};

const logout = async () => {
try {
await authService.logout();
} finally {
setUser(null);
router.push('/login');
}
};

return (
<AuthContext.Provider
value={{
user,
loading,
isAuthenticated: !!user,
login,
logout,
}}
>
{children}
</AuthContext.Provider>
);
}

export const useAuth = () => {
const context = useContext(AuthContext);
if (!context) {
throw new Error('useAuth debe usarse dentro de AuthProvider');
}
return context;
};
```

#### ProtectedRoute.tsx
```tsx
// apps/frontend/src/components/shared/ProtectedRoute.tsx
```

### Servicios {#frontend-services}

#### auth.service.ts
```typescript
// apps/frontend/src/services/auth.service.ts
import apiClient from '@/lib/api/client';
import { LoginCredentials, LoginResponse, User, ApiResponse } from '@/types/user.types';

export const authService = {
async login(credentials: LoginCredentials): Promise<LoginResponse> {
const response = await apiClient.post<ApiResponse<LoginResponse>>(
'/auth/login',
credentials
);
return response.data.data;
},

async logout(): Promise<void> {
try {
await apiClient.post('/auth/logout');
} catch (error) {
console.error('Error en logout:', error);
} finally {
localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');
}
},

async getCurrentUser(): Promise<User> {
const response = await apiClient.get<ApiResponse<User>>('/auth/me');
return response.data.data;
},

async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
const response = await apiClient.post<ApiResponse<{ accessToken: string }>>(
'/auth/refresh',
{ refreshToken }
);
return response.data.data;
},
};
```

#### client.ts
```typescript
// apps/frontend/src/lib/api/client.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import https from 'https';

// DEBUG: Log de configuración
console.log('🔍 API Client Config:', {
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/${process.env.NEXT_PUBLIC_API_VERSION}`,
  protocol: process.env.NEXT_PUBLIC_API_URL?.startsWith('https') ? 'HTTPS' : 'HTTP',
  environment: process.env.NODE_ENV,
});

// Agente HTTPS que acepta certificados auto-firmados en desarrollo
const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // ⚠️ Solo para desarrollo con certificados auto-firmados
});

const apiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/${process.env.NEXT_PUBLIC_API_VERSION}`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: false,
  // Usar agente HTTPS solo si la URL es HTTPS
  ...(process.env.NEXT_PUBLIC_API_URL?.startsWith('https') && { httpsAgent }),
});

// Interceptor: Agregar token JWT
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log('📤 Request:', config.method?.toUpperCase(), config.url);
    
    if (!config.url?.includes('/auth/login')) {
      const token = localStorage.getItem('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Interceptor: Refresh token automático
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.status, response.config.url);
    return response;
  },
  async (error: AxiosError) => {
    console.error('❌ Response error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      url: error.config?.url,
    });

    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/${process.env.NEXT_PUBLIC_API_VERSION}/auth/refresh`,
          { refreshToken },
          // Usar el mismo agente HTTPS para el refresh
          process.env.NEXT_PUBLIC_API_URL?.startsWith('https') ? { httpsAgent } : {}
        );

        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('❌ Refresh token failed:', refreshError);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### Tipos {#frontend-types}

#### user.types.ts
```typescript
export interface User {
  _id: string;
  nombre: string;
  email: string;
  cedula: string;
  rol: 'root' | 'admin' | 'coordinator' | 'supervisor' | 'engineer' | 'user';
  telefono?: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    message: string;
    code: string;
  };
}
```

### Páginas {#frontend-pages}

#### login/page.tsx
```tsx
'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      // El redirect se hace automáticamente en AuthContext
    } catch (err: unknown) {
      console.error('Error en login:', err);
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      const errorMessage = error.response?.data?.error?.message || 'Credenciales inválidas. Verifica tu email y contraseña.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
      <div className="text-center">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>
          CERMONT ATG
        </h1>
        <p className="mt-2 text-gray-600">Sistema de Gestión de Trabajos</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </Button>
      </form>

      <div className="text-center text-xs text-gray-500">
        <p>Credenciales de prueba:</p>
        <p className="mt-1 font-mono">admin@cermont.com / admin123</p>
      </div>
    </div>
  );
}
```

#### dashboard/page.tsx
```tsx
// apps/frontend/src/app/(dashboard)/dashboard/page.tsx
```

---

## Archivos de Configuración

### Backend .env
```properties
# apps/backend/.env
# ============================================================================
# CONFIGURACIÓN DEL SERVIDOR
# ============================================================================
NODE_ENV=development
PORT=4100
HOST=0.0.0.0

# ============================================================================
# SSL/HTTPS CONFIGURATION
# ============================================================================
SSL_ENABLED=true
SSL_KEY_PATH=./ssl/dev/key.pem
SSL_CERT_PATH=./ssl/dev/cert.pem

# ============================================================================
# BASE DE DATOS - MONGODB
# ============================================================================
# MongoDB Local
MONGO_URI=mongodb://localhost:27017/cermont_db

# MongoDB Atlas (Producción - Ejemplo)
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/cermont_db?retryWrites=true&w=majority

# MongoDB de Testing
MONGO_TEST_URI=mongodb://localhost:27017/cermont_test_db

# ============================================================================
# JWT - AUTENTICACIÓN CON JOSE (2025)
# ============================================================================
# IMPORTANTE: Cambiar estos secrets en producción (mínimo 32 caracteres)
# jose requiere strings seguros para TextEncoder
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars-1234567890abcdef
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production-min-32-chars-fedcba0987654321
JWT_REFRESH_EXPIRES_IN=7d

# Algoritmo de firma (jose soporta: HS256, HS384, HS512, RS256, ES256)
JWT_ALGORITHM=HS256

# ============================================================================
# PASSWORD HASHING - ARGON2 (2025)
# ============================================================================
# Argon2 configuración (más seguro que bcrypt)
ARGON2_TYPE=argon2id
ARGON2_MEMORY_COST=65536
ARGON2_TIME_COST=3
ARGON2_PARALLELISM=1

# Mantener compatibilidad con bcrypt para usuarios existentes
ENABLE_BCRYPT_FALLBACK=true

# ============================================================================
# CORS - ORÍGENES PERMITIDOS
# ============================================================================
# Separar múltiples orígenes con comas
CORS_ORIGINS=http://localhost:3000,https://localhost:3000,http://localhost:5173,http://localhost:4173,https://cermont.app

# Métodos HTTP permitidos
CORS_METHODS=GET,POST,PUT,DELETE,PATCH,OPTIONS

# Headers permitidos
CORS_ALLOWED_HEADERS=Content-Type,Authorization,X-Requested-With

# Habilitar credentials (cookies, authorization headers)
CORS_CREDENTIALS=true

# ============================================================================
# ALMACENAMIENTO DE ARCHIVOS - MULTER 2.0
# ============================================================================
STORAGE_DIR=./uploads
MAX_FILE_SIZE=10485760

# Tipos MIME permitidos (separados por comas)
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg,image/webp,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,text/csv

# Configuración de subdirectorios
UPLOAD_EVIDENCES_DIR=uploads/evidences
UPLOAD_ORDERS_DIR=uploads/orders
UPLOAD_REPORTS_DIR=uploads/reports
UPLOAD_PROFILES_DIR=uploads/profiles

# ============================================================================
# RATE LIMITING - PROTECCIÓN CONTRA ATAQUES
# ============================================================================
# Ventana de tiempo en milisegundos (15 minutos)
RATE_LIMIT_WINDOW_MS=900000

# Máximo de requests por ventana (general)
RATE_LIMIT_MAX_REQUESTS=100

# Rate limit para autenticación (más restrictivo)
AUTH_RATE_LIMIT_MAX=5
AUTH_RATE_LIMIT_WINDOW_MS=900000

# Rate limit para upload de archivos
UPLOAD_RATE_LIMIT_MAX=20
UPLOAD_RATE_LIMIT_WINDOW_MS=600000

# Habilitar rate limiting
ENABLE_RATE_LIMITING=true
```

### Frontend .env.local
```bash
NEXT_PUBLIC_API_URL=https://localhost:4100
NEXT_PUBLIC_API_VERSION=v1
NEXT_PUBLIC_WS_URL=wss://localhost:4100
```

### package.json Backend
```json
{
  "$schema": "https://json.schemastore.org/package.json",
  "name": "cermont-backend",
  "version": "1.0.0",
  "description": "Backend API REST para CERMONT ATG - Sistema de Gestión de Órdenes de Trabajo con Socket.IO",
  "type": "module",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "dev:debug": "nodemon --inspect src/server.js",
    "seed": "node scripts/seed.js",
    "create-root": "node scripts/createRootUser.js",
    "lint": "node node_modules\\\\eslint\\\\bin\\\\eslint.js src/**/*.js",
    "lint:fix": "eslint src/**/*.js --fix",
    "format": "prettier --write \"src/**/*.js\"",
    "test": "cross-env NODE_ENV=test jest --detectOpenHandles --forceExit",
    "test:security": "cross-env NODE_ENV=test jest src/tests/security.test.js",
    "test:audit": "cross-env NODE_ENV=test jest src/tests/audit-and-blacklist.test.js --forceExit",
    "test:performance": "cross-env NODE_ENV=test jest src/tests/performance.test.js --forceExit",
    "test:coverage": "cross-env NODE_ENV=test jest --coverage",
    "test:watch": "cross-env NODE_ENV=test jest --watch",
    "generate-cert": "node scripts/generateDevCert.js",
    "check-ssl": "node scripts/checkSSL.js",
    "dev:https": "npm run generate-cert && cross-env SSL_ENABLED=true NODE_ENV=development nodemon src/server.js",
    "test:https": "cross-env NODE_ENV=test SSL_ENABLED=false jest src/tests/https-headers.test.js --forceExit"
  },
  "keywords": [
    "express",
    "api",
    "cermont",
    "rest",
    "mongodb",
    "mongoose",
    "jwt",
    "socket.io",
    "nodejs"
  ],
  "author": "CERMONT Tech Team",
  "license": "MIT",
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "dependencies": {
    "ajv": "^8.17.1",
    "ajv-formats": "^3.0.1",
    "argon2": "^0.41.1",
    "bcryptjs": "^2.4.3",
    "compression": "^1.8.1",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.5",
    "dompurify": "^3.3.0",
    "dotenv": "^16.4.7",
    "express": "^4.21.1",
    "express-mongo-sanitize": "^2.2.0",
    "express-rate-limit": "^7.4.1",
    "helmet": "^8.0.0",
    "joi": "^17.13.3",
    "jose": "^5.10.0",
    "jsdom": "^27.1.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.8.1",
    "morgan": "^1.10.0",
    "multer": "^2.0.2",
    "node-cache": "^5.1.2",
    "socket.io": "^4.8.1",
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.1",
    "validator": "^13.15.20",
    "winston": "^3.17.0",
    "xss-clean": "^0.1.4"
  },
  "devDependencies": {
    "@babel/preset-env": "^7.22.0",
    "babel-jest": "^29.7.0",
    "cross-env": "^7.0.3",
    "eslint": "^9.14.0",
    "jest": "^29.7.0",
    "nodemon": "^3.1.7",
    "prettier": "^3.3.3",
    "supertest": "^6.3.4"
  }
}
```

### package.json Frontend
```json
{
  "name": "frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@hookform/resolvers": "^5.2.2",
    "@radix-ui/react-avatar": "^1.1.10",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-tabs": "^1.1.13",
    "@tanstack/react-query": "^5.90.6",
    "axios": "^1.13.1",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "date-fns": "^4.1.0",
    "lucide-react": "^0.552.0",
    "next": "16.0.1",
    "next-themes": "^0.4.6",
    "react": "19.2.0",
    "react-dom": "19.2.0",
    "react-hook-form": "^7.66.0",
    "recharts": "^3.3.0",
    "socket.io-client": "^4.8.1",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.3.1",
    "zod": "^4.1.12",
    "zustand": "^5.0.8"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.0.1",
    "tailwindcss": "^4",
    "tw-animate-css": "^1.4.0",
    "typescript": "^5"
  }
}
```

---

## Scripts de Utilidad

### resetUserPassword.js
```javascript
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import argon2 from 'argon2';
import User from '../src/models/User.js';

dotenv.config();

async function resetPassword() {
  try {
    // Conectar a MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/cermont_db';
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB Connected:', mongoose.connection.host);
    console.log('📊 Database:', mongoose.connection.name);

    console.log('\n🔐 ============================================');
    console.log('🔐 RESETEAR CONTRASEÑA - CERMONT ATG');
    console.log('🔐 ============================================\n');

    // Buscar usuario
    const email = 'juan.arevalo2@unipamplona.edu.co';
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`❌ No se encontró usuario con email: ${email}`);
      process.exit(1);
    }

    console.log(`✅ Usuario encontrado:`);
    console.log(`   Nombre: ${user.nombre}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Rol: ${user.rol}`);
    console.log(`   Activo: ${user.isActive || user.activo}\n`);

    // Nueva contraseña (cumple requisitos: mayúscula, minúscula, número)
    const newPassword = 'Admin123';
    
    console.log(`🔑 Estableciendo nueva contraseña: ${newPassword}`);
    console.log(`   ⚠️  Requisitos: Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número`);
    console.log(`   🔒 Usando Argon2 (algoritmo del backend)\n`);

    // Hashear nueva contraseña con Argon2 (igual que el backend)
    const hashedPassword = await argon2.hash(newPassword, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 1
    });
    
    // Actualizar directamente en la BD (bypass pre-save hooks)
    // Esto evita que el hook vuelva a hashear un hash ya hasheado
    await User.updateOne(
      { _id: user._id },
      { 
        $set: { 
          password: hashedPassword,
          lastPasswordChange: new Date(),
          loginAttempts: 0,
          lockUntil: null
        }
      }
    );

    console.log('✅ Contraseña actualizada exitosamente!\n');
    console.log('📝 Credenciales de acceso:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: ${newPassword}`);
    console.log(`   Rol: ${user.rol}\n`);
    console.log('🎯 Ahora puedes iniciar sesión con estas credenciales\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al resetear contraseña:', error.message);
    process.exit(1);
  }
}

resetPassword();
```

### checkUserStatus.js
```javascript
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../src/models/User.js';

dotenv.config();

async function checkUser() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/cermont_db';
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB\n');

    const email = 'juan.arevalo2@unipamplona.edu.co';
    const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');

    if (!user) {
      console.log(`❌ Usuario no encontrado: ${email}`);
      process.exit(1);
    }

    console.log('📊 INFORMACIÓN COMPLETA DEL USUARIO:\n');
    console.log(`Email: ${user.email}`);
    console.log(`Nombre: ${user.nombre}`);
    console.log(`Rol: ${user.rol}`);
    console.log(`Activo (isActive): ${user.isActive !== undefined ? user.isActive : user.activo}`);
    console.log(`Bloqueado (isLocked): ${user.isLocked}`);
    console.log(`Intentos de login: ${user.loginAttempts || 0}`);
    console.log(`Bloqueado hasta: ${user.lockUntil || 'No bloqueado'}`);
    console.log(`Token Version: ${user.tokenVersion || 0}`);
    console.log(`Password hash presente: ${user.password ? 'Sí' : 'No'}`);
    console.log(`Password hash (primeros 20): ${user.password ? user.password.substring(0, 20) + '...' : 'N/A'}\n`);

    // Verificar el campo exacto de activo
    console.log('🔍 CAMPOS RAW DEL DOCUMENTO:');
    console.log(`user.activo: ${user.activo}`);
    console.log(`user.isActive: ${user.isActive}`);
    console.log(`user.active: ${user.active}\n`);

    // Probar comparación de contraseña
    const testPassword = 'Admin123';
    console.log(`🔐 Probando contraseña: "${testPassword}"`);
    
    if (user.comparePassword) {
      const isValid = await user.comparePassword(testPassword);
      console.log(`Resultado comparePassword: ${isValid ? '✅ VÁLIDA' : '❌ INVÁLIDA'}\n`);
    } else {
      console.log('⚠️  Método comparePassword no disponible\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

checkUser();
```

### testLogin.js
```javascript
/**
 * Test Login API
 */

import https from 'https';

const data = JSON.stringify({
  email: 'juan.arevalo2@unipamplona.edu.co',
  password: 'Admin123'
});

const options = {
  hostname: 'localhost',
  port: 4100,
  path: '/api/v1/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  },
  rejectUnauthorized: false // Aceptar certificados auto-firmados
};

console.log('\n🔐 Probando Login API');
console.log('='.repeat(50));
console.log(`📧 Email: juan.arevalo2@unipamplona.edu.co`);
console.log(`🔑 Password: Admin123`);
console.log(`🌐 URL: https://localhost:4100/api/v1/auth/login\n`);

const req = https.request(options, (res) => {
  let body = '';

  res.on('data', (chunk) => {
    body += chunk;
  });

  res.on('end', () => {
    console.log(`📊 Status: ${res.statusCode} ${res.statusMessage}`);
    console.log(`📝 Response:\n`);
    
    try {
      const json = JSON.parse(body);
      console.log(JSON.stringify(json, null, 2));
      
      if (res.statusCode === 200 && json.success) {
        console.log('\n✅ LOGIN EXITOSO!');
        console.log(`👤 Usuario: ${json.data?.user?.nombre || 'N/A'}`);
        console.log(`🎫 Access Token: ${json.data?.tokens?.accessToken ? 'Presente' : 'No encontrado'}`);
        console.log(`🔄 Refresh Token: ${json.data?.tokens?.refreshToken ? 'Presente' : 'No encontrado'}`);
      } else {
        console.log('\n❌ LOGIN FALLIDO');
      }
    } catch (e) {
      console.log(body);
    }
    
    console.log('\n' + '='.repeat(50));
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error);
});

req.write(data);
req.write(data);
req.end();
```

---

## Contenido Detallado

A continuación se incluye el contenido completo de todos los archivos de código fuente.

