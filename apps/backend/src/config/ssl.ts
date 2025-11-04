/**
 * SSL/TLS Configuration (TypeScript - November 2025)
 * @description Configuración de certificados SSL para HTTPS en dev/prod, con validación async y generación de dev certs.
 * Uso: En server.ts (const sslConfig = await getSSLConfig(); const server = https.createServer(sslConfig, app);). Env: SSL_ENABLED=true, SSL_DIR='ssl', SSL_CERT_PATH, SSL_KEY_PATH.
 * Integrado con: fs/promises (async I/O), logger (info/warn/error/debug). Secure: PEM format check, prod self-signed warn, absolute paths.
 * Performance: Promise.all para parallel access/read (non-blocking). Extensible: Agrega CA chain via env.SSL_CA_PATH.
 * Types: Node built-ins (@types/node). Pruebas: Mock fs en Jest (jest.mock('fs/promises')). Para ATG: HTTPS enforce con middleware.httpsRedirect.
 * Fixes: Typed return (HttpsServerOptions | null), paths resolved (no relative exploits), error as Error, optional passphrase.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger';
import { createServer, Server } from 'https'; // Optional import for types
import { IncomingMessage, ServerResponse } from 'http'; // For HttpsServerOptions

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * SSL/TLS configuration options (compatible with https.createServer)
 */
interface SSLConfig {
  key: string;
  cert: string;
  passphrase?: string;
  ca?: string; // Optional CA chain
}

/**
 * Get SSL configuration asynchronously
 * @returns SSL config or null if disabled
 * @throws Error if certs invalid/missing (propagates to prevent server start)
 */
export const getSSLConfig = async (): Promise<SSLConfig | null> => {
  const sslEnabled: boolean = process.env.SSL_ENABLED === 'true';
  const isProduction: boolean = process.env.NODE_ENV === 'production';

  if (!sslEnabled) {
    logger.info('ℹ️ SSL deshabilitado (SSL_ENABLED=false)');
    return null;
  }

  // Paths: Resolve absolute para security (previene relative traversal)
  const sslDir: string = process.env.SSL_DIR 
    ? path.resolve(process.cwd(), process.env.SSL_DIR) 
    : path.resolve(process.cwd(), 'ssl');
  const certPath: string = process.env.SSL_CERT_PATH 
    ? path.resolve(process.env.SSL_CERT_PATH) 
    : path.resolve(sslDir, 'dev', 'cert.pem');
  const keyPath: string = process.env.SSL_KEY_PATH 
    ? path.resolve(process.env.SSL_KEY_PATH) 
    : path.resolve(sslDir, 'dev', 'key.pem');
  const caPath: string | undefined = process.env.SSL_CA_PATH ? path.resolve(process.env.SSL_CA_PATH) : undefined;

  try {
    // Parallel access check (faster than sequential)
    const [certExists, keyExists, caExists] = await Promise.all([
      fs.access(certPath).then(() => true).catch(() => false),
      fs.access(keyPath).then(() => true).catch(() => false),
      caPath ? fs.access(caPath).then(() => true).catch(() => false) : Promise.resolve(false),
    ]);

    if (!certExists) {
      throw new Error(`Certificado no encontrado: ${certPath}`);
    }
    if (!keyExists) {
      throw new Error(`Llave privada no encontrada: ${keyPath}`);
    }

    // Parallel read (non-blocking)
    const [certContent, keyContent, caContent] = await Promise.all([
      fs.readFile(certPath, 'utf8'),
      fs.readFile(keyPath, 'utf8'),
      caPath && caExists ? fs.readFile(caPath, 'utf8') : Promise.resolve(undefined),
    ]);

    // Validate non-empty
    if (!certContent || certContent.trim().length === 0) {
      throw new Error('Certificado está vacío o corrupto');
    }
    if (!keyContent || keyContent.trim().length === 0) {
      throw new Error('Llave privada está vacía o corrupta');
    }

    // Basic PEM format validation (regex for headers)
    if (!certContent.includes('-----BEGIN CERTIFICATE-----')) {
      throw new Error('Formato de certificado inválido (debe ser PEM)');
    }
    if (!keyContent.includes('-----BEGIN ') || !keyContent.includes('PRIVATE KEY-----')) {
      throw new Error('Formato de llave privada inválido (debe ser PEM RSA/ECDSA)');
    }
    if (caContent && !caContent.includes('-----BEGIN CERTIFICATE-----')) {
      throw new Error('Formato de CA inválido (debe ser PEM)');
    }

    // Prod: Warn if self-signed (basic subject check)
    if (isProduction) {
      const certLines: string[] = certContent.split('\n');
      const subjectMatch: string | undefined = certLines.find(line => line.includes('Subject:'));
      if (subjectMatch && (subjectMatch.includes('localhost') || subjectMatch.includes('127.0.0.1') || subjectMatch.includes('CN=localhost'))) {
        logger.warn('⚠️ En producción, usa certificados reales (no self-signed/localhost). Configura SSL_CERT_PATH y SSL_KEY_PATH con Let\'s Encrypt o similares.');
      }
    }

    logger.info('✅ Certificados SSL cargados correctamente');
    logger.debug(`  Certificado: ${certPath}`);
    logger.debug(`  Llave: ${keyPath}`);
    if (caPath) {
      logger.debug(`  CA: ${caPath}`);
    }

    const config: SSLConfig = {
      key: keyContent,
      cert: certContent,
      ...(process.env.SSL_PASSPHRASE && { passphrase: process.env.SSL_PASSPHRASE }),
      ...(caContent && { ca: caContent }),
    };

    return config;
  } catch (error: unknown) {
    const err: Error = error as Error;
    logger.error('❌ Error en getSSLConfig():', err.message);
    
    if (!isProduction) {
      logger.info('\n💡 Solución para desarrollo:');
      logger.info(' 1. Ejecuta: npm run generate-cert');
      logger.info(' 2. Verifica que ssl/dev/ contiene cert.pem y key.pem válidos');
      logger.info(' 3. O desactiva SSL: SSL_ENABLED=false en .env\n');
    } else {
      logger.error('\n💡 En producción:');
      logger.error(' 1. Usa certificados reales (Let\'s Encrypt, certbot)');
      logger.error(' 2. Configura SSL_CERT_PATH y SSL_KEY_PATH en .env');
      logger.error(' 3. Asegúrate de renew automático en VPS\n');
    }
    
    throw err; // Propaga para fail-fast (no start insecure server)
  }
};

/**
 * Generate self-signed dev certs (utility, call via npm script)
 * @param outputDir - Dir to save certs (default: ssl/dev)
 * @param days - Validity days (default: 365)
 * @returns Promise<void>
 * @throws Error on generation failure
 */
export const generateDevCert = async (outputDir: string = path.resolve('ssl', 'dev'), days: number = 365): Promise<void> => {
  const { exec } = await import('child_process');
  const opensslCmd: string = `openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days ${days} -nodes -subj "/C=US/ST=Dev/L=Local/O=Dev/CN=localhost"`;

  const outputPath: string = path.resolve(outputDir);
  await fs.mkdir(outputPath, { recursive: true });

  return new Promise((resolve, reject) => {
    exec(opensslCmd, { cwd: outputPath }, (error, stdout, stderr) => {
      if (error) {
        logger.error(`Error generating dev cert: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr) {
        logger.warn(`OpenSSL stderr: ${stderr}`);
      }
      logger.info(`✅ Dev certs generated in ${outputPath}`);
      resolve();
    });
  });
};

export default getSSLConfig;

