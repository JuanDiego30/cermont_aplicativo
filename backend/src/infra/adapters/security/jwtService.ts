import { SignJWT, jwtVerify, importJWK, type KeyLike } from 'jose';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateUniqueId } from '../../../shared/utils/generateUniqueId.js';
import { logger } from '../../../shared/utils/index.js';
// Asumiendo que la interfaz está definida en el dominio (ajusta la ruta si es necesario)
import type { IJwtService } from '../../../domain/ports/security/IJwtService.js'; 

/**
 * Tipos internos
 */
interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  jti: string;
  [key: string]: unknown; // Permitir propiedades adicionales
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
 * ========================================
 * JWT SERVICE (JOSE + RS256)
 * ========================================
 */
export class JwtService implements IJwtService {
  private privateKey: KeyLike | null = null;
  private publicKey: KeyLike | null = null;
  private kid: string = 'cermont-jwt-key-1';
  
  // Configuración con fallbacks seguros
  private issuer = process.env.JWT_ISSUER || 'https://atg.cermont.com';
  private audience = process.env.JWT_AUDIENCE || 'cermont-atg-api';
  private accessTtl = process.env.JWT_ACCESS_TTL || '15m';
  private refreshTtl = process.env.JWT_REFRESH_TTL || '7d';

  constructor() {
    this.initialize().catch((error) => {
      logger.error('❌ Failed to initialize JWT service', {
        error: error instanceof Error ? error.message : String(error),
      });
    });
  }

  /**
   * Inicialización asíncrona de claves (JWKS)
   */
  private async initialize(): Promise<void> {
    try {
      const privatePath = process.env.JWKS_PRIVATE_PATH || (await this.findJWKSPath('jwks-private.json'));
      const publicPath = process.env.JWKS_PUBLIC_PATH || (await this.findJWKSPath('jwks-public.json'));

      // Cargar clave privada
      const privateContent = await fs.readFile(privatePath, 'utf-8');
      const privateJWKS: JWKSKeys = JSON.parse(privateContent);
      const privateJWK = privateJWKS.keys[0];
      
      if (!privateJWK) throw new Error('No keys found in private JWKS');
      
      this.kid = privateJWK.kid;
      this.privateKey = await importJWK(privateJWK, 'RS256') as KeyLike;

      // Cargar clave pública
      const publicContent = await fs.readFile(publicPath, 'utf-8');
      const publicJWKS: JWKSKeys = JSON.parse(publicContent);
      const publicJWK = publicJWKS.keys[0];
      
      if (!publicJWK) throw new Error('No keys found in public JWKS');

      this.publicKey = await importJWK(publicJWK, 'RS256') as KeyLike;

      logger.info('✅ JWT Service initialized', { kid: this.kid });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`❌ Critical: Could not load JWKS keys. Auth will fail. Error: ${msg}`);
      // No lanzamos error aquí para no crashear el servidor al inicio, 
      // pero los métodos fallarán si se llaman.
    }
  }

  /**
   * Busca los archivos JWKS en ubicaciones estándar
   */
  private async findJWKSPath(filename: string): Promise<string> {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const cwd = process.cwd();

    // Lista de posibles ubicaciones (prioridad descendente)
    const candidates = [
      process.env.JWKS_DIR ? path.join(process.env.JWKS_DIR, filename) : null,
      path.join(cwd, 'config', filename),
      path.join(cwd, '..', 'config', filename),
      path.resolve(__dirname, '../../../config', filename),
      path.resolve(__dirname, '../../../../config', filename), // Caso dist/
    ].filter((p): p is string => p !== null);

    for (const candidate of candidates) {
      try {
        await fs.access(candidate);
        return candidate;
      } catch {
        continue;
      }
    }

    // Si no se encuentra, retornar una ruta por defecto para que el error sea claro al intentar leer
    return path.join(cwd, 'config', filename);
  }

  /**
   * Genera un Access Token
   */
  async generateAccessToken(payload: { userId: string; email: string; role: string }): Promise<string> {
    if (!this.privateKey) await this.initialize(); // Reintento lazy
    if (!this.privateKey) throw new Error('JWT Service not initialized: Missing private key');

    const jti = generateUniqueId(32);

    return new SignJWT({
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
  }

  /**
   * Genera un Refresh Token
   */
  async generateRefreshToken(payload: { userId: string; email: string; role: string }): Promise<string> {
    if (!this.privateKey) await this.initialize();
    if (!this.privateKey) throw new Error('JWT Service not initialized: Missing private key');

    const jti = generateUniqueId(32);

    return new SignJWT({
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
  }

  /**
   * Verifica la validez de un Access Token
   */
  async verifyAccessToken(token: string): Promise<TokenPayload> {
    if (!this.publicKey) await this.initialize();
    if (!this.publicKey) throw new Error('JWT Service not initialized: Missing public key');

    try {
      const { payload } = await jwtVerify(token, this.publicKey, {
        issuer: this.issuer,
        audience: this.audience,
      });

      return {
        userId: String(payload.userId),
        email: String(payload.email),
        role: String(payload.role),
        jti: String(payload.jti),
        ...payload,
      };
    } catch (error: unknown) {
      // Check for JWT expired error code
      if (error instanceof Error && 'code' in error && error.code === 'ERR_JWT_EXPIRED') {
        throw new Error('Token expirado');
      }
      throw new Error('Token inválido');
    }
  }

  /**
   * Decodifica un token sin verificar firma (uso: inspección o extracción de expiración para logout)
   */
  decode(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      return JSON.parse(Buffer.from(parts[1], 'base64').toString());
    } catch {
      return null;
    }
  }

  /**
   * Método legacy compatible (alias para decode)
   */
  decodeTokenUnsafe(token: string): any {
    return this.decode(token);
  }

  /**
   * Implementación de decodeToken para IJwtService
   */
  decodeToken(token: string): any {
    return this.decode(token);
  }

  /**
   * Verifica refresh token (alias de verifyAccessToken para refresh)
   */
  async verifyRefreshToken(token: string): Promise<TokenPayload> {
    return this.verifyAccessToken(token);
  }

  /**
   * Alias: sign = generateAccessToken (para compatibilidad con JWTService interface)
   */
  async sign(payload: any, _options?: any): Promise<string> {
    return this.generateAccessToken(payload);
  }

  /**
   * Alias: verify = verifyAccessToken (para compatibilidad con JWTService interface)
   */
  async verify(token: string): Promise<any> {
    return this.verifyAccessToken(token);
  }

  /**
   * Obtiene las claves públicas (para endpoint .well-known)
   */
  async getPublicJWKS(): Promise<JWKSKeys> {
    const publicPath = process.env.JWKS_PUBLIC_PATH || (await this.findJWKSPath('jwks-public.json'));
    return JSON.parse(await fs.readFile(publicPath, 'utf-8'));
  }
}

export const jwtService = new JwtService();

