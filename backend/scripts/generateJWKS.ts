import { generateKeyPair, exportJWK } from 'jose';
import fs from 'fs/promises';
import path from 'path';

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

async function generateJWKS() {
  console.log('🔐 Generando par de claves RSA para JWT RS256...');

  // Generar par de claves RSA 2048 bits con extractable: true
  const { publicKey, privateKey } = await generateKeyPair('RS256', {
    modulusLength: 2048,
    extractable: true,
  });

  // Exportar a formato JWK
  const publicJWK = await exportJWK(publicKey);
  const privateJWK = await exportJWK(privateKey);

  // Agregar KID (Key ID) único
  const kid = 'cermont-jwt-key-1';

  // ✅ FIX: Crear objetos con tipos explícitos
  const publicJWKS: JWKSKeys = {
    keys: [
      {
        kty: publicJWK.kty!,
        kid: kid,
        use: 'sig',
        alg: 'RS256',
        n: publicJWK.n!,
        e: publicJWK.e!,
      },
    ],
  };

  const privateJWKS: JWKSKeys = {
    keys: [
      {
        kty: privateJWK.kty!,
        kid: kid,
        use: 'sig',
        alg: 'RS256',
        n: privateJWK.n!,
        e: privateJWK.e!,
        d: privateJWK.d,
        p: privateJWK.p,
        q: privateJWK.q,
        dp: privateJWK.dp,
        dq: privateJWK.dq,
        qi: privateJWK.qi,
      },
    ],
  };

  // Crear directorio config si no existe
  const configDir = path.join(process.cwd(), 'backend', 'config');
  await fs.mkdir(configDir, { recursive: true });

  // Guardar archivos
  await fs.writeFile(
    path.join(configDir, 'jwks-public.json'),
    JSON.stringify(publicJWKS, null, 2)
  );

  await fs.writeFile(
    path.join(configDir, 'jwks-private.json'),
    JSON.stringify(privateJWKS, null, 2)
  );

  console.log('✅ Claves RSA generadas exitosamente:');
  console.log('   - backend/config/jwks-public.json (para verificación)');
  console.log('   - backend/config/jwks-private.json (para firma - PRIVADO)');
  console.log(`   - KID: ${kid}`);
}

generateJWKS().catch(console.error);
