import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Diagnóstico de configuración SSL...\n');

// Verificar variables de entorno
console.log('📋 Variables de entorno:');
console.log(` SSL_ENABLED: ${process.env.SSL_ENABLED || 'no definido'}`);
console.log(` NODE_ENV: ${process.env.NODE_ENV || 'no definido'}`);
console.log(` PORT: ${process.env.PORT || 'no definido'}`);
console.log('');

// Verificar existencia de certificados
const sslDir = path.join(__dirname, '..', 'ssl', 'dev');
const certPath = path.join(sslDir, 'cert.pem');
const keyPath = path.join(sslDir, 'key.pem');

console.log('📁 Archivos SSL:');
console.log(` Directorio: ${sslDir}`);
console.log(` ${fs.existsSync(sslDir) ? '✅' : '❌'} Directorio ssl/dev/ existe`);

if (fs.existsSync(certPath)) {
  const certStats = fs.statSync(certPath);
  console.log(` ✅ cert.pem existe (${certStats.size} bytes)`);
  const certContent = fs.readFileSync(certPath, 'utf8');
  if (certContent.includes('-----BEGIN CERTIFICATE-----')) {
    console.log(' ✅ cert.pem tiene formato válido');
  } else {
    console.log(' ❌ cert.pem tiene formato inválido');
  }
} else {
  console.log(' ❌ cert.pem NO existe');
}

if (fs.existsSync(keyPath)) {
  const keyStats = fs.statSync(keyPath);
  console.log(` ✅ key.pem existe (${keyStats.size} bytes)`);
  const keyContent = fs.readFileSync(keyPath, 'utf8');
  if (keyContent.includes('-----BEGIN')) {
    console.log(' ✅ key.pem tiene formato válido');
  } else {
    console.log(' ❌ key.pem tiene formato inválido');
  }
} else {
  console.log(' ❌ key.pem NO existe');
}

console.log('');

if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
  console.log('💡 Solución:');
  console.log(' Ejecuta: npm run generate-cert');
} else if (process.env.SSL_ENABLED !== 'true') {
  console.log('💡 Para habilitar HTTPS:');
  console.log(' Configura SSL_ENABLED=true en .env');
} else {
  console.log('✅ Configuración SSL lista');
  console.log('💡 Siguiente paso:');
  console.log(' Ejecuta: npm run dev:https');
}

console.log('');
