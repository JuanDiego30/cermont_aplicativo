import { SignJWT, jwtVerify, importJWK } from 'jose';
import fs from 'fs/promises';
import path from 'path';
import { generateUniqueId } from '@shared/utils/generateUniqueId.js';
import { logger } from '../utils/logger.js';

/**
 * ========================================
 * JWT SERVICE (JOSE + RS256)
 * ========================================
 * Servicio de gestión de JWT con algoritmo RS256 (RSA asimétrico).
 * Usa JWKS (JSON Web Key Set) para rotación de claves segura.
 * 
 * **Características:**
 * - Algoritmo RS256 (RSA + SHA-256)
 * - JWKS público/privado
 * - JTI único para blacklist
 * - Refresh token rotation
 * 
 * @see https://jose.readthedocs.io/en/latest/
 */

/**
 * Tipos
 */
interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  jti: string;
}

interface JWKSKeys {
  keys: Array<{
    kty: string;
    kid: string;
    use: string;
    alg: string;
    n: string;
    e: string;
    d?: string;
    p?: string;
    q?: string;
    dp?: string;
    dq?: string;
    qi?: string;
  }>;
}

/**
 * JWT Service Class
 */
class JwtService {
  private privateKey: any | null = null;
  private publicKey: any | null = null;
  private kid: string = 'cermont-jwt-key-1';
  private issuer = process.env.JWT_ISSUER || 'https://atg.cermont.com';
  private audience = process.env.JWT_AUDIENCE || 'cermont-atg-api';
  private accessTtl = process.env.JWT_ACCESS_TTL || '15m';
  private refreshTtl = process.env.JWT_REFRESH_TTL || '7d';

  constructor() {
    this.initialize().catch((error) => {
      logger.error('Failed to initialize JWT service', {
        error: error.message,
        stack: error.stack,
      });
    });
  }

  /**
   * Inicializar servicio (cargar JWKS)
   */
  private async initialize(): Promise<void> {
    try {
      // Rutas configurables por env vars
      const privatePath = process.env.JWKS_PRIVATE_PATH || (await this.findJWKSPath('jwks-private.json'));
      const publicPath = process.env.JWKS_PUBLIC_PATH || (await this.findJWKSPath('jwks-public.json'));

      console.log('🔍 JWT Paths:', { privatePath, publicPath, cwd: process.cwd() });

      // Cargar clave privada
      const privateJWKS: JWKSKeys = JSON.parse(await fs.readFile(privatePath, 'utf-8'));
      const privateJWK = privateJWKS.keys[0];
      this.kid = privateJWK.kid;
      this.privateKey = await importJWK(privateJWK, 'RS256');

      // Cargar clave pública
      const publicJWKS: JWKSKeys = JSON.parse(await fs.readFile(publicPath, 'utf-8'));
      const publicJWK = publicJWKS.keys[0];
      this.publicKey = await importJWK(publicJWK, 'RS256');

      logger.info('✅ JWKS loaded successfully', {
        kid: this.kid,
        issuer: this.issuer,
      });
    } catch (error: any) {
      logger.error('❌ Error loading JWKS', {
        error: error.message,
      });
      throw new Error('No se pudo cargar las claves JWT');
    }
  }

  private async findJWKSPath(filename: string): Promise<string> {
    const candidates = [
      path.join(process.cwd(), '..', 'config', filename),
      path.join(process.cwd(), 'config', filename),
    ];

    for (const candidate of candidates) {
      try {
        await fs.access(candidate);
        return candidate;
      } catch {
        continue;
      }
    }

    return candidates[0];
  }

  /**
   * Generar Access Token (JWT RS256)
   * 
   * @param payload - Datos del usuario
   * @returns JWT firmado
   * 
   * @example
   * ```
   * const token = await jwtService.generateAccessToken({
   *   userId: '123',
   *   email: 'user@example.com',
   *   role: 'ADMIN'
   * });
   * ```
   */
  async generateAccessToken(payload: {
    userId: string;
    email: string;
    role: string;
  }): Promise<string> {
    if (!this.privateKey) {
      throw new Error('Private key no inicializada');
    }

    const jti = generateUniqueId(32); // JTI único para blacklist

    const token = await new SignJWT({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      jti,
    })
      .setProtectedHeader({ alg: 'RS256', kid: this.kid })
      .setIssuedAt()
      .setIssuer(this.issuer)
      .setAudience(this.audience)
      .setExpirationTime(this.accessTtl)
      .sign(this.privateKey);

    logger.debug('Access token generated', {
      userId: payload.userId,
      jti,
      expiresIn: this.accessTtl,
    });

    return token;
  }

  /**
   * Generar Refresh Token (JWT RS256)
   * 
   * @param payload - Datos del usuario
   * @returns JWT de refresh firmado
   * 
   * @example
   * ```
   * const refreshToken = await jwtService.generateRefreshToken({
   *   userId: '123',
   *   email: 'user@example.com',
   *   role: 'ADMIN'
   * });
   * ```
   */
  async generateRefreshToken(payload: {
    userId: string;
    email: string;
    role: string;
  }): Promise<string> {
    if (!this.privateKey) {
      throw new Error('Private key no inicializada');
    }

    const jti = generateUniqueId(32); // JTI único para blacklist

    const token = await new SignJWT({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      jti,
      type: 'refresh',
    })
      .setProtectedHeader({ alg: 'RS256', kid: this.kid })
      .setIssuedAt()
      .setIssuer(this.issuer)
      .setAudience(this.audience)
      .setExpirationTime(this.refreshTtl)
      .sign(this.privateKey);

    logger.debug('Refresh token generated', {
      userId: payload.userId,
      jti,
      expiresIn: this.refreshTtl,
    });

    return token;
  }

  /**
   * Verificar Access Token
   * 
   * @param token - JWT a verificar
   * @returns Payload del token
   * @throws Error si el token es inválido o expirado
   */
  async verifyAccessToken(token: string): Promise<TokenPayload> {
    if (!this.publicKey) {
      throw new Error('Public key no inicializada');
    }

    try {
      const { payload } = await jwtVerify(token, this.publicKey, {
        issuer: this.issuer,
        audience: this.audience,
      });

      return {
        userId: payload.userId as string,
        email: payload.email as string,
        role: payload.role as string,
        jti: payload.jti as string,
      };
    } catch (error: any) {
      logger.warn('Token verification failed', {
        error: error.message,
      });
      throw new Error(error.code === 'ERR_JWT_EXPIRED' ? 'Token expirado' : 'Token inválido');
    }
  }

  /**
   * Obtener JWKS público (para endpoint /.well-known/jwks.json)
   * 
   * @returns JWKS público
   */
  async getPublicJWKS(): Promise<JWKSKeys> {
    const publicPath = process.env.JWKS_PUBLIC_PATH || path.join(process.cwd(), 'config', 'jwks-public.json');
    const publicJWKS: JWKSKeys = JSON.parse(await fs.readFile(publicPath, 'utf-8'));
    return publicJWKS;
  }

  /**
   * Decodificar token sin verificar (útil para debugging)
   * **NO usar en producción para validación**
   */
  decodeTokenUnsafe(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      return payload;
    } catch {
      return null;
    }
  }
}

/**
 * Instancia singleton del servicio JWT
 */
export const jwtService = new JwtService();
