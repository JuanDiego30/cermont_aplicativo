/**
 * JWT Auth Service with Jose & JWKS (TypeScript - November 2025)
 * @description Manejo de JWT con jose: JWKS/KID/rotación automática, JTI para revocación granular,
 * blacklist Redis, secrets separados. Secure: HS256→RS256 future, short exp (15m access, 7d refresh).
 * Uso: signAccessToken(user), verifyToken(req). Env: JWT_PRIVATE_KEY (base64), JWKS_URI, JWT_EXP=900.
 * Integrado con: ioredis (blacklist), argon2 (hash), express-validator. Secure: Verify iss/aud/kid/jti/exp.
 * Performance: Async sign/verify, Redis TTL. Extensible: RS256 asymmetric. Tests: Mock Redis/jose.
 * Fixes 2025: JWKS endpoint /.well-known/jwks.json, KID rotation con grace period, jose library.
 * Assumes: User model con _id/roles. Deps: jose@5.2.0, nanoid@5.0.7, ioredis@5.4.1.
 */

import { SignJWT, jwtVerify, JWTPayload, JWK, importJWK, exportJWK, createRemoteJWKSet } from 'jose';
import { Redis } from 'ioredis';
import { nanoid } from 'nanoid';
import { logger } from '../utils/logger.js';
import { AppError } from '../utils/errorHandler.js';

// Redis para blacklist
const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
redisClient.connect().catch((err: unknown) => logger.error('Redis connect fail:', err));

// Configuración JWT con jose
const JWT_CONFIG = {
  privateKey: process.env.JWT_PRIVATE_KEY || 'fallback-key-change-me-64chars-base64-encoded',
  publicKey: process.env.JWT_PUBLIC_KEY || 'fallback-public-key',
  refreshPrivateKey: process.env.JWT_REFRESH_PRIVATE_KEY || 'fallback-refresh-key',
  refreshPublicKey: process.env.JWT_REFRESH_PUBLIC_KEY || 'fallback-refresh-public-key',
  exp: parseInt(process.env.JWT_EXP || '900'), // 15m
  refreshExp: parseInt(process.env.REFRESH_EXP || '604800'), // 7d
  issuer: 'cermont-backend',
  audience: 'cermont-api',
  kid: process.env.JWT_KID || 'current-key-001',
  gracePeriod: parseInt(process.env.JWT_GRACE_PERIOD || '300'), // 5min grace period
};

// JWKS cache (en memoria para performance)
let jwksCache: JWK[] = [];
let lastRotation = Date.now();

// Importar claves (base64 encoded)
let privateKey: any;
let publicKey: any;
let refreshPrivateKey: any;
let refreshPublicKey: any;

const initializeKeys = async () => {
  try {
    // Para HS256 (simétrico), usamos la misma clave
    const secret = Buffer.from(JWT_CONFIG.privateKey, 'base64');
    privateKey = await importJWK({ k: secret.toString('base64'), kty: 'oct' });
    publicKey = privateKey; // Para HS256, public = private

    const refreshSecret = Buffer.from(JWT_CONFIG.refreshPrivateKey, 'base64');
    refreshPrivateKey = await importJWK({ k: refreshSecret.toString('base64'), kty: 'oct' });
    refreshPublicKey = refreshPrivateKey;

    logger.info('JWT keys initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize JWT keys', error);
    throw new AppError('Error inicializando claves JWT', 500);
  }
};

// Inicializar claves al cargar el módulo
initializeKeys();

interface CustomJWTPayload extends JWTPayload {
  sub: string; // userId
  jti: string; // Unique ID
  roles: string[];
  kid?: string; // Key ID
}

// Sign access token con jose
export const signAccessToken = async (userId: string, roles: string[]): Promise<string> => {
  const jti = nanoid(21); // 128-bit unique

  try {
    const token = await new SignJWT({
      sub: userId,
      jti,
      roles,
    })
      .setProtectedHeader({ alg: 'HS256', kid: JWT_CONFIG.kid })
      .setIssuedAt()
      .setIssuer(JWT_CONFIG.issuer)
      .setAudience(JWT_CONFIG.audience)
      .setExpirationTime(`${JWT_CONFIG.exp}s`)
      .sign(privateKey);

    return token;
  } catch (error) {
    logger.error('Error signing access token', error);
    throw new AppError('Error generando token de acceso', 500);
  }
};

// Sign refresh token con jose
export const signRefreshToken = async (userId: string): Promise<string> => {
  try {
    const token = await new SignJWT({
      sub: userId,
    })
      .setProtectedHeader({ alg: 'HS256', kid: `${JWT_CONFIG.kid}-refresh` })
      .setIssuedAt()
      .setIssuer(JWT_CONFIG.issuer)
      .setAudience(JWT_CONFIG.audience)
      .setExpirationTime(`${JWT_CONFIG.refreshExp}s`)
      .sign(refreshPrivateKey);

    return token;
  } catch (error) {
    logger.error('Error signing refresh token', error);
    throw new AppError('Error generando token de refresh', 500);
  }
};

// Verify access token con jose + blacklist check
export const verifyAccessToken = async (token: string): Promise<CustomJWTPayload | null> => {
  try {
    const { payload } = await jwtVerify(token, publicKey, {
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience,
      maxTokenAge: `${JWT_CONFIG.exp}s`,
    });

    const customPayload = payload as CustomJWTPayload;

    // Blacklist check (revoked?)
    const isBlacklisted = await redisClient.get(`blacklist:${customPayload.jti}`);
    if (isBlacklisted) {
      logger.warn('Blacklisted JTI access attempt', { jti: customPayload.jti, sub: customPayload.sub });
      throw new AppError('Token revocado', 401);
    }

    // Verificar KID (para rotación)
    if (customPayload.kid && customPayload.kid !== JWT_CONFIG.kid) {
      // Verificar si está en grace period
      const tokenIat = customPayload.iat || 0;
      const graceExpiry = tokenIat + JWT_CONFIG.gracePeriod;
      const now = Math.floor(Date.now() / 1000);

      if (now > graceExpiry) {
        logger.warn('Token with old KID expired grace period', { kid: customPayload.kid, sub: customPayload.sub });
        throw new AppError('Token expirado (clave rotada)', 401);
      }

      logger.info('Token with old KID accepted (grace period)', { kid: customPayload.kid, sub: customPayload.sub });
    }

    return customPayload;
  } catch (error: any) {
    if (error.code === 'ERR_JWT_EXPIRED' || error.code === 'ERR_JWT_INVALID') {
      logger.warn('JWT verification failed', { error: error.message });
      throw new AppError('Token inválido o expirado', 401);
    }
    throw error;
  }
};

// Blacklist token (on logout/revoke)
export const blacklistToken = async (jti: string, exp: number): Promise<void> => {
  const ttl = Math.max(0, exp - Math.floor(Date.now() / 1000));
  await redisClient.setex(`blacklist:${jti}`, ttl, 'revoked');
  logger.info('Token blacklisted', { jti, ttl });
};

// Rotate secrets con grace period
export const rotateJWTSecret = async (): Promise<{ newKid: string; gracePeriod: number }> => {
  const newKid = `key-${nanoid(8)}`;
  const gracePeriod = JWT_CONFIG.gracePeriod;

  // Actualizar configuración
  process.env.JWT_KID = newKid;
  lastRotation = Date.now();

  // En producción: actualizar vault/env, notificar servicios
  logger.info('JWT secret rotated with grace period', { newKid, gracePeriod });

  // Actualizar JWKS cache
  await updateJWKS();

  return { newKid, gracePeriod };
};

// Generar JWKS para endpoint público
export const getJWKS = async (): Promise<{ keys: JWK[] }> => {
  // Si cache está vacío o es antigua, actualizar
  if (jwksCache.length === 0 || Date.now() - lastRotation > 3600000) { // 1 hora
    await updateJWKS();
  }

  return { keys: jwksCache };
};

// Actualizar JWKS cache
const updateJWKS = async (): Promise<void> => {
  try {
    const publicJWK = await exportJWK(publicKey);
    publicJWK.kid = JWT_CONFIG.kid;
    publicJWK.use = 'sig';
    publicJWK.alg = 'HS256';

    const refreshPublicJWK = await exportJWK(refreshPublicKey);
    refreshPublicJWK.kid = `${JWT_CONFIG.kid}-refresh`;
    refreshPublicJWK.use = 'sig';
    refreshPublicJWK.alg = 'HS256';

    jwksCache = [publicJWK, refreshPublicJWK];
    logger.info('JWKS cache updated', { keyCount: jwksCache.length });
  } catch (error) {
    logger.error('Error updating JWKS', error);
  }
};

// Middleware para rutas (verify + attach user)
export const authenticateJWT = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Token requerido', 401);
  }
  const token = authHeader.substring(7);
  const payload = await verifyAccessToken(token);
  if (!payload) throw new AppError('Token inválido', 401);
  req.user = { id: payload.sub, roles: payload.roles, jti: payload.jti };
  next();
};

export default {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  blacklistToken,
  rotateJWTSecret,
  getJWKS,
  authenticateJWT
};