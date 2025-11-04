/**
 * JWKS Key Generation Script (TypeScript - November 2025)
 * @description Genera par de claves RSA-2048 para JWT con JWKS endpoint
 * @usage npm run generate-jwks
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import crypto from 'crypto';
import { logger } from '../src/utils/logger';

interface JWKSKey {
  kty: string;
  use: string;
  kid: string;
  n: string;
  e: string;
  alg: string;
}

interface JWKS {
  keys: JWKSKey[];
}

interface KeyPair {
  publicKey: string;
  privateKey: string;
  jwks: JWKS;
}

/**
 * Genera par de claves RSA-2048
 */
function generateRSAKeyPair(): { publicKey: string; privateKey: string } {
  return crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });
}

/**
 * Convierte clave pública RSA PEM a formato JWKS
 */
function publicKeyToJWKS(publicKeyPem: string, kid: string): JWKSKey {
  // Importar clave pública para obtener componentes
  const publicKey = crypto.createPublicKey(publicKeyPem);
  const keyDer = publicKey.export({ type: 'spki', format: 'der' });

  // Extraer modulus y exponent (simplificado - en producción usar biblioteca JWKS)
  const modulus = keyDer.subarray(33, 33 + 256); // 2048 bits = 256 bytes
  const exponent = keyDer.subarray(-3);

  return {
    kty: 'RSA',
    use: 'sig',
    kid,
    n: modulus.toString('base64url'),
    e: exponent.toString('base64url'),
    alg: 'RS256'
  };
}

/**
 * Genera KID único basado en hash de la clave pública
 */
function generateKID(publicKeyPem: string): string {
  const hash = crypto.createHash('sha256').update(publicKeyPem).digest('hex');
  return hash.substring(0, 16);
}

/**
 * Genera y guarda claves JWKS
 */
function generateJWKS(): KeyPair {
  logger.info('Generando par de claves RSA-2048 para JWKS...');

  const { publicKey, privateKey } = generateRSAKeyPair();
  const kid = generateKID(publicKey);
  const jwksKey = publicKeyToJWKS(publicKey, kid);

  const jwks: JWKS = {
    keys: [jwksKey]
  };

  return {
    publicKey,
    privateKey,
    jwks
  };
}

/**
 * Guarda claves en archivos
 */
function saveKeys(keyPair: KeyPair): void {
  const keysDir = join(process.cwd(), 'keys');

  // Crear directorio si no existe
  if (!existsSync(keysDir)) {
    mkdirSync(keysDir, { recursive: true });
  }

  const publicKeyPath = join(keysDir, 'jwt-public.pem');
  const privateKeyPath = join(keysDir, 'jwt-private.pem');
  const jwksPath = join(keysDir, 'jwks.json');

  writeFileSync(publicKeyPath, keyPair.publicKey, 'utf8');
  writeFileSync(privateKeyPath, keyPair.privateKey, 'utf8');
  writeFileSync(jwksPath, JSON.stringify(keyPair.jwks, null, 2), 'utf8');

  logger.info(`Claves guardadas en ${keysDir}:`);
  logger.info(`- jwt-public.pem (clave pública)`);
  logger.info(`- jwt-private.pem (clave privada - ¡NO COMPARTIR!)`);
  logger.info(`- jwks.json (JWKS para /.well-known/jwks.json)`);
}

/**
 * Función principal
 */
function main(): void {
  try {
    const keyPair = generateJWKS();
    saveKeys(keyPair);
    logger.info('✅ JWKS generado exitosamente');
    logger.info('🔒 IMPORTANTE: Mantén jwt-private.pem seguro y nunca lo subas a control de versiones');
  } catch (error) {
    logger.error('❌ Error generando JWKS:', error);
    process.exit(1);
  }
}

// Ejecutar automáticamente
main();

export { generateJWKS, saveKeys, KeyPair, JWKSKey, JWKS };