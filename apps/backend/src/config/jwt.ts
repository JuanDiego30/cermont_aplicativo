/**
 * JWT Configuration & Utilities with Jose (TypeScript - November 2025)
 * @description Generación, verificación y utilidades para tokens JWT con Jose library, RSA-2048, JWKS support.
 * Modern JWT implementation with RSA signatures, automatic key rotation, and JWKS endpoint support.
 */

import { SignJWT, jwtVerify, JWTPayload as JoseJWTPayload, KeyLike } from 'jose';
import { readFileSync } from 'fs';
import { join } from 'path';
import crypto from 'crypto';
import { logger } from '../utils/logger';

// ==================== TYPES ====================

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number; // Segundos
  expiresAt: Date;
};

export type DeviceInfo = Partial<{
  device: string;
  ip: string;
  userAgent: string;
}>;

export type JWTPayload = {
  userId: string;
  rol: string; // Changed from 'role' to 'rol' for consistency
  tokenVersion?: number;
  email?: string;
};

export type TokenMetadata = Partial<{
  sessionId: string;
  device: string;
  ip: string;
  userAgent: string;
}>;

export type TokenMetadataExtracted = {
  userId: string;
  rol?: string;
  sessionId?: string;
  device?: string;
  ip?: string;
  issuedAt: Date | null;
  expiresAt: Date | null;
};

// ==================== CONFIGURATION ====================

const KEYS_DIR = join(process.cwd(), 'keys');
const PUBLIC_KEY_PATH = join(KEYS_DIR, 'jwt-public.pem');
const PRIVATE_KEY_PATH = join(KEYS_DIR, 'jwt-private.pem');

const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Load RSA keys
let publicKey: KeyLike;
let privateKey: KeyLike;

try {
  publicKey = crypto.createPublicKey(readFileSync(PUBLIC_KEY_PATH));
  privateKey = crypto.createPrivateKey(readFileSync(PRIVATE_KEY_PATH));
  logger.info('JWT RSA keys loaded successfully');
} catch (error) {
  logger.error('Failed to load JWT RSA keys:', error);
  logger.error('Please run: npm run generate-jwks');
  process.exit(1);
}

// ==================== TOKEN GENERATION ====================

/**
 * Generate Access Token with RSA signature
 */
const generateAccessToken = async (payload: JWTPayload): Promise<string> => {
  const now = Math.floor(Date.now() / 1000);

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuedAt(now)
    .setExpirationTime(ACCESS_TOKEN_EXPIRES_IN)
    .sign(privateKey);
};

/**
 * Generate Refresh Token with metadata
 */
const generateRefreshToken = async (
  payload: JWTPayload,
  metadata: TokenMetadata = {}
): Promise<string> => {
  const now = Math.floor(Date.now() / 1000);

  return new SignJWT({
    ...payload,
    ...metadata,
  })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuedAt(now)
    .setExpirationTime(REFRESH_TOKEN_EXPIRES_IN)
    .sign(privateKey);
};

/**
 * Generate token pair (access + refresh) with Jose
 */
export const generateTokenPair = async (
  payload: JWTPayload,
  deviceInfo: DeviceInfo = {},
  metadata: TokenMetadata = {}
): Promise<TokenPair> => {
  try {
    const fullMetadata: TokenMetadata = {
      ...metadata,
      sessionId: metadata.sessionId,
      device: deviceInfo?.device ?? metadata.device,
      ip: deviceInfo?.ip ?? metadata.ip,
      userAgent: deviceInfo?.userAgent ?? metadata.userAgent,
    };

    const [accessToken, refreshToken] = await Promise.all([
      generateAccessToken(payload),
      generateRefreshToken(payload, fullMetadata),
    ]);

    // Calculate expiration time
    const expiresIn = ACCESS_TOKEN_EXPIRES_IN.includes('m')
      ? parseInt(ACCESS_TOKEN_EXPIRES_IN) * 60
      : ACCESS_TOKEN_EXPIRES_IN.includes('h')
      ? parseInt(ACCESS_TOKEN_EXPIRES_IN) * 3600
      : ACCESS_TOKEN_EXPIRES_IN.includes('d')
      ? parseInt(ACCESS_TOKEN_EXPIRES_IN) * 86400
      : 900; // 15min default

    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn,
      expiresAt,
    };
  } catch (error) {
    logger.error('Error generating token pair:', error);
    throw new Error('Failed to generate tokens');
  }
};

// ==================== TOKEN VERIFICATION ====================

/**
 * Verify JWT token with Jose
 */
export const verifyToken = async (token: string): Promise<JWTPayload> => {
  try {
    const { payload } = await jwtVerify(token, publicKey, {
      algorithms: ['RS256'],
      clockTolerance: 30, // 30s tolerance
    });

    return payload as JWTPayload;
  } catch (error) {
    logger.error('Token verification failed:', error);
    throw new Error('Invalid token');
  }
};

/**
 * Verify refresh token specifically
 */
export const verifyRefreshToken = async (token: string): Promise<JWTPayload & TokenMetadata> => {
  return verifyToken(token) as Promise<JWTPayload & TokenMetadata>;
};

// ==================== UTILITIES ====================

/**
 * Extract token metadata for logging/debugging
 */
export const extractTokenMetadata = (token: string): TokenMetadataExtracted | null => {
  try {
    // Decode without verification for metadata extraction
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());

    return {
      userId: payload.userId,
      rol: payload.rol,
      sessionId: payload.sessionId,
      device: payload.device,
      ip: payload.ip,
      issuedAt: payload.iat ? new Date(payload.iat * 1000) : null,
      expiresAt: payload.exp ? new Date(payload.exp * 1000) : null,
    };
  } catch (error) {
    logger.warn('Failed to extract token metadata:', error);
    return null;
  }
};

/**
 * Check if token is expired (without full verification)
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;

    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    const now = Math.floor(Date.now() / 1000);

    return (payload.exp || 0) < now;
  } catch {
    return true;
  }
};

// ==================== JWKS SUPPORT ====================

/**
 * Get JWKS for /.well-known/jwks.json endpoint
 */
export const getJWKS = async () => {
  try {
    const jwksPath = join(KEYS_DIR, 'jwks.json');
    const jwks = readFileSync(jwksPath, 'utf8');
    return JSON.parse(jwks);
  } catch (error) {
    logger.error('Failed to load JWKS:', error);
    throw new Error('JWKS not available');
  }
};

export default {
  generateTokenPair,
  verifyToken,
  verifyRefreshToken,
  extractTokenMetadata,
  isTokenExpired,
  getJWKS,
};
const generateAccessToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    ...signOptionsBase,
    expiresIn: ACCESS_TOKEN_EXPIRES_IN, // TS infiere string correctamente
  };
  return jwt.sign(payload, JWT_SECRET as jwt.Secret, options);
};

/**
 * Generar Refresh Token con metadata
 * @param payload - Datos del usuario
 * @param metadata - Metadata opcional
 * @returns Token JWT firmado
 */
const generateRefreshToken = (payload: TokenPayload, metadata: TokenMetadata = {}): string => {
  const options: SignOptions = {
    ...signOptionsBase,
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  };
  return jwt.sign(
    {
      ...payload,
      ...metadata, // Destructuring para merge simple
    } satisfies JwtPayload,
    JWT_REFRESH_SECRET as jwt.Secret,
    options
  );
};

/**
 * Generar par de tokens (access + refresh) con metadata
 * @param payload - Datos del usuario
 * @param deviceInfo - Info del dispositivo (legacy)
 * @param metadata - Metadata adicional
 * @returns Par de tokens con metadata
 */
export const generateTokenPair = async (
  payload: TokenPayload,
  deviceInfo: DeviceInfo = {},
  metadata: TokenMetadata = {}
): Promise<TokenPair> => {
  try {
    // Merge con nullish coalescing y optional chaining
    const fullMetadata: TokenMetadata = {
      ...metadata,
      sessionId: metadata.sessionId,
      device: deviceInfo?.device ?? metadata.device,
      ip: deviceInfo?.ip ?? metadata.ip,
      userAgent: deviceInfo?.userAgent ?? metadata.userAgent,
    };

    const [accessToken, refreshToken] = await Promise.all([
      Promise.resolve(generateAccessToken(payload)),
      Promise.resolve(generateRefreshToken(payload, fullMetadata)),
    ]);

    const expiresIn = parseExpiration(ACCESS_TOKEN_EXPIRES_IN);
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    logger.info(`Token pair generated for user: ${payload.userId}`);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn,
      expiresAt,
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Error generating token pair:', err.message);
    throw new Error('Could not generate token pair');
  }
};

// ==================== VERIFICACIÓN DE TOKENS ====================

/**
 * Verificar Access Token
 * @param token - Token JWT
 * @returns Payload decodificado
 * @throws Error si inválido o expirado
 */
export const verifyAccessToken = (token: string): JWTPayload => {
  const options: VerifyOptions = {
    ...verifyOptionsBase,
    maxAge: ACCESS_TOKEN_EXPIRES_IN,
  };
  const decoded = jwt.verify(token, JWT_SECRET as jwt.Secret, options);
  return decoded as JWTPayload; // Safe cast post-verificación
};

/**
 * Verificar Refresh Token
 * @param token - Token JWT
 * @returns Payload decodificado
 * @throws Error si inválido o expirado
 */
export const verifyRefreshToken = (token: string): JWTPayload => {
  const options: VerifyOptions = {
    ...verifyOptionsBase,
    maxAge: REFRESH_TOKEN_EXPIRES_IN,
  };
  const decoded = jwt.verify(token, JWT_REFRESH_SECRET as jwt.Secret, options);
  return decoded as JWTPayload;
};

// ==================== UTILIDADES ====================

/**
 * Decodificar token sin verificar (solo debugging)
 * @param token - Token a decodificar
 * @returns Payload decodificado o null
 */
export const decodeToken = (token: string): Record<string, unknown> | null => {
  try {
    const decoded = jwt.decode(token);
    if (decoded === null) return null;

    if (typeof decoded === 'string') {
      try {
        return JSON.parse(decoded) as Record<string, unknown>;
      } catch {
        return { data: decoded };
      }
    }

    return decoded as Record<string, unknown>;
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.debug('Error decoding token:', error.message);
    return null;
  }
};

/**
 * Parsear string de expiración a segundos
 * @param expiresIn - String de tiempo o número de segundos (ej: '15m', '1h30m' o 900)
 * @returns Segundos numéricos
 */
const parseExpiration = (expiresIn: string | number): number => {
  // Si ya es número, usarlo (asegurando entero y mínimo 60s)
  if (typeof expiresIn === 'number') {
    return Math.max(Math.floor(expiresIn), 60);
  }

  const parts = (expiresIn || '').match(/(\d+)([smhdwy])/g) || [];
  if (parts.length === 0) return 900; // Default 15m

  let totalSeconds = 0;
  const units: Record<string, number> = {
    s: 1, m: 60, h: 3600, d: 86400, w: 604800, y: 31536000,
  };

  for (const part of parts) {
    const match = part.match(/^(\d+)([smhdwy])$/);
    if (match) {
      const [, value, unit] = match;
      const num = parseInt(value, 10);
      totalSeconds += num * (units[unit] ?? 1);
    }
  }

  return Math.max(totalSeconds, 60); // Mínimo 1min
};

/**
 * Obtener tiempo restante de un token
 * @param token - Token JWT
 * @returns Segundos restantes o null
 */
export const getTokenTimeRemaining = (token: string): number | null => {
  try {
    const decoded = decodeToken(token);
    if (!decoded?.exp || typeof decoded.exp !== 'number') return null;

    const now = Math.floor(Date.now() / 1000);
    const remaining = decoded.exp - now;

    return remaining > 0 ? remaining : 0;
  } catch {
    return null;
  }
};

/**
 * Verificar si un token está próximo a expirar
 * @param token - Token JWT
 * @param thresholdSeconds - Umbral en segundos (default: 300)
 * @returns true si expira pronto
 */
export const isTokenExpiringSoon = (token: string, thresholdSeconds: number = 300): boolean => {
  const remaining = getTokenTimeRemaining(token);
  return remaining !== null && remaining < thresholdSeconds;
};

/**
 * Extraer metadata de un token
 * @param token - Token JWT
 * @returns Metadata extraída o null
 */
export const extractTokenMetadata = (token: string): TokenMetadataExtracted | null => {
  try {
    const decoded = decodeToken(token);
    if (!decoded) return null;

    return {
      userId: decoded.userId as string,
      role: (decoded.role as string) ?? undefined,
      sessionId: decoded.sessionId as string | undefined,
      device: decoded.device as string | undefined,
      ip: decoded.ip as string | undefined,
      issuedAt: decoded.iat && typeof decoded.iat === 'number' ? new Date(decoded.iat * 1000) : null,
      expiresAt: decoded.exp && typeof decoded.exp === 'number' ? new Date(decoded.exp * 1000) : null,
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.debug('Error extracting token metadata:', err.message);
    return null;
  }
};

// ==================== CONSTANTES EXPORTADAS ====================

export const TOKEN_CONSTANTS = {
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
  ACCESS_TOKEN_SECONDS: parseExpiration(ACCESS_TOKEN_EXPIRES_IN),
  REFRESH_TOKEN_SECONDS: parseExpiration(REFRESH_TOKEN_EXPIRES_IN),
} as const;



