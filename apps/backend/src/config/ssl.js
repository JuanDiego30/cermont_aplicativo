import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Configuración SSL/TLS para HTTPS en desarrollo local
 * Genera automáticamente certificados si no existen
 */
export const getSSLConfig = () => {
  const sslEnabled = process.env.SSL_ENABLED === 'true';

  if (!sslEnabled) {
    console.log('ℹ️ SSL deshabilitado (SSL_ENABLED=false)');
    return null;
  }

  try {
    const devCertPath = path.join(__dirname, '..', '..', 'ssl', 'dev', 'cert.pem');
    const devKeyPath = path.join(__dirname, '..', '..', 'ssl', 'dev', 'key.pem');

    // Verificar existencia de certificados
    if (!fs.existsSync(devCertPath)) {
      throw new Error(`Certificado no encontrado: ${devCertPath}`);
    }
    if (!fs.existsSync(devKeyPath)) {
      throw new Error(`Llave privada no encontrada: ${devKeyPath}`);
    }

    // Leer certificados
    let certContent, keyContent;
    try {
      certContent = fs.readFileSync(devCertPath, 'utf8');
    } catch (err) {
      throw new Error(`Error leyendo certificado: ${err.message}`);
    }
    try {
      keyContent = fs.readFileSync(devKeyPath, 'utf8');
    } catch (err) {
      throw new Error(`Error leyendo llave privada: ${err.message}`);
    }

    // Validar que no estén vacíos
    if (!certContent || certContent.trim().length === 0) {
      throw new Error('Certificado está vacío o corrupto');
    }
    if (!keyContent || keyContent.trim().length === 0) {
      throw new Error('Llave privada está vacía o corrupta');
    }

    // Validar formato básico (debe empezar con "-----BEGIN")
    if (!certContent.includes('-----BEGIN CERTIFICATE-----')) {
      throw new Error('Formato de certificado inválido (debe ser PEM)');
    }
    if (!keyContent.includes('-----BEGIN')) {
      throw new Error('Formato de llave privada inválido (debe ser PEM)');
    }

    console.log('✅ Certificados SSL cargados correctamente');
    console.log(`   Certificado: ${devCertPath}`);
    console.log(`   Llave: ${devKeyPath}`);

    return {
      key: keyContent,
      cert: certContent,
    };
  } catch (error) {
    console.error('\n❌ Error en getSSLConfig():', error.message);
    console.error('\n💡 Solución:');
    console.error(' 1. Ejecuta: npm run generate-cert');
    console.error(' 2. Verifica que ssl/dev/ contiene cert.pem y key.pem');
    console.error(' 3. O desactiva SSL: SSL_ENABLED=false en .env\n');
    throw error;
  }
};

export default getSSLConfig;
