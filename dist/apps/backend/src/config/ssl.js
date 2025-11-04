import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const getSSLConfig = async () => {
    const sslEnabled = process.env.SSL_ENABLED === 'true';
    const isProduction = process.env.NODE_ENV === 'production';
    if (!sslEnabled) {
        logger.info('ℹ️ SSL deshabilitado (SSL_ENABLED=false)');
        return null;
    }
    const sslDir = process.env.SSL_DIR
        ? path.resolve(process.cwd(), process.env.SSL_DIR)
        : path.resolve(process.cwd(), 'ssl');
    const certPath = process.env.SSL_CERT_PATH
        ? path.resolve(process.env.SSL_CERT_PATH)
        : path.resolve(sslDir, 'dev', 'cert.pem');
    const keyPath = process.env.SSL_KEY_PATH
        ? path.resolve(process.env.SSL_KEY_PATH)
        : path.resolve(sslDir, 'dev', 'key.pem');
    const caPath = process.env.SSL_CA_PATH ? path.resolve(process.env.SSL_CA_PATH) : undefined;
    try {
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
        const [certContent, keyContent, caContent] = await Promise.all([
            fs.readFile(certPath, 'utf8'),
            fs.readFile(keyPath, 'utf8'),
            caPath && caExists ? fs.readFile(caPath, 'utf8') : Promise.resolve(undefined),
        ]);
        if (!certContent || certContent.trim().length === 0) {
            throw new Error('Certificado está vacío o corrupto');
        }
        if (!keyContent || keyContent.trim().length === 0) {
            throw new Error('Llave privada está vacía o corrupta');
        }
        if (!certContent.includes('-----BEGIN CERTIFICATE-----')) {
            throw new Error('Formato de certificado inválido (debe ser PEM)');
        }
        if (!keyContent.includes('-----BEGIN ') || !keyContent.includes('PRIVATE KEY-----')) {
            throw new Error('Formato de llave privada inválido (debe ser PEM RSA/ECDSA)');
        }
        if (caContent && !caContent.includes('-----BEGIN CERTIFICATE-----')) {
            throw new Error('Formato de CA inválido (debe ser PEM)');
        }
        if (isProduction) {
            const certLines = certContent.split('\n');
            const subjectMatch = certLines.find(line => line.includes('Subject:'));
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
        const config = {
            key: keyContent,
            cert: certContent,
            ...(process.env.SSL_PASSPHRASE && { passphrase: process.env.SSL_PASSPHRASE }),
            ...(caContent && { ca: caContent }),
        };
        return config;
    }
    catch (error) {
        const err = error;
        logger.error('❌ Error en getSSLConfig():', err.message);
        if (!isProduction) {
            logger.info('\n💡 Solución para desarrollo:');
            logger.info(' 1. Ejecuta: npm run generate-cert');
            logger.info(' 2. Verifica que ssl/dev/ contiene cert.pem y key.pem válidos');
            logger.info(' 3. O desactiva SSL: SSL_ENABLED=false en .env\n');
        }
        else {
            logger.error('\n💡 En producción:');
            logger.error(' 1. Usa certificados reales (Let\'s Encrypt, certbot)');
            logger.error(' 2. Configura SSL_CERT_PATH y SSL_KEY_PATH en .env');
            logger.error(' 3. Asegúrate de renew automático en VPS\n');
        }
        throw err;
    }
};
export const generateDevCert = async (outputDir = path.resolve('ssl', 'dev'), days = 365) => {
    const { exec } = await import('child_process');
    const opensslCmd = `openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days ${days} -nodes -subj "/C=US/ST=Dev/L=Local/O=Dev/CN=localhost"`;
    const outputPath = path.resolve(outputDir);
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
//# sourceMappingURL=ssl.js.map