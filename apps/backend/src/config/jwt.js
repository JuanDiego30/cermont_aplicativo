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

