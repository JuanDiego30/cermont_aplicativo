
import selfsigned from 'selfsigned';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sslDir = path.join(__dirname, '..', 'ssl', 'dev');

if (!fs.existsSync(sslDir)) {
  fs.mkdirSync(sslDir, { recursive: true });
  console.log('✅ Directorio ssl/dev creado');
}

const attrs = [
  { name: 'commonName', value: 'localhost' },
  { name: 'countryName', value: 'CO' },
  { name: 'stateOrProvinceName', value: 'Arauca' },
  { name: 'localityName', value: 'Arauca' },
  { name: 'organizationName', value: 'CERMONT SAS' },
  { shortName: 'OU', value: 'Development' },
];

const options = {
  keySize: 2048,
  days: 365,
  algorithm: 'sha256',
  extensions: [
    { name: 'basicConstraints', cA: true },
    { name: 'keyUsage', keyCertSign: true, digitalSignature: true, nonRepudiation: true, keyEncipherment: true, dataEncipherment: true },
    { name: 'extKeyUsage', serverAuth: true, clientAuth: true, codeSigning: true, timeStamping: true },
    { name: 'subjectAltName', altNames: [
      { type: 2, value: 'localhost' },
      { type: 2, value: '*.localhost' },
      { type: 7, ip: '127.0.0.1' },
      { type: 7, ip: '::1' },
    ] },
  ],
};

try {
  console.log('🔐 Generando certificado SSL self-signed...');
  const pems = selfsigned.generate(attrs, options);
  if (!pems || !pems.cert || !pems.private) {
    throw new Error('La generación de certificados falló (respuesta vacía)');
  }
  const certPath = path.join(sslDir, 'cert.pem');
  const keyPath = path.join(sslDir, 'key.pem');
  fs.writeFileSync(certPath, pems.cert, { encoding: 'utf8', mode: 0o600 });
  console.log(`✅ Certificado guardado: ${certPath}`);
  fs.writeFileSync(keyPath, pems.private, { encoding: 'utf8', mode: 0o600 });
  console.log(`✅ Llave privada guardada: ${keyPath}`);
  if (!fs.existsSync(certPath) || fs.statSync(certPath).size === 0) {
    throw new Error('El archivo cert.pem está vacío o no se creó');
  }
  if (!fs.existsSync(keyPath) || fs.statSync(keyPath).size === 0) {
    throw new Error('El archivo key.pem está vacío o no se creó');
  }
  console.log('\n✅ Certificados SSL generados exitosamente');
  console.log(` 📁 Ubicación: ${sslDir}`);
  console.log(' 📄 Archivos:');
  console.log(' - cert.pem (certificado público)');
  console.log(' - key.pem (llave privada)');
  console.log(` ⏰ Válido por: 365 días`);
  console.log(' 🌐 Dominios: localhost, 127.0.0.1, ::1');
  console.log('\n⚠️ Advertencia: Certificado self-signed solo para desarrollo.');
  console.log(' Los navegadores mostrarán advertencia de seguridad (es normal).');
  console.log('\n💡 Siguiente paso:');
  console.log(' Ejecuta: npm run dev:https\n');
} catch (error) {
  console.error('\n❌ Error generando certificados:', error.message);
  console.error(' Stack:', error.stack);
  console.error('\n💡 Solución:');
  console.error(' 1. Verifica que "selfsigned" esté instalado: npm list selfsigned');
  console.error(' 2. Reinstala si es necesario: npm install --save-dev selfsigned');
  console.error(' 3. Verifica permisos de escritura en el directorio ssl/dev/\n');
  process.exit(1);
}
