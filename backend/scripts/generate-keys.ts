import { generateKeyPair, exportJWK } from 'jose';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateKeys() {
    console.log('🔑 Generating new RSA keys...');

    const { publicKey, privateKey } = await generateKeyPair('RS256', {
        modulusLength: 2048,
    });

    const privateJWK = await exportJWK(privateKey);
    const publicJWK = await exportJWK(publicKey);

    const kid = 'cermont-jwt-key-' + Date.now();
    privateJWK.kid = kid;
    privateJWK.use = 'sig';
    privateJWK.alg = 'RS256';

    publicJWK.kid = kid;
    publicJWK.use = 'sig';
    publicJWK.alg = 'RS256';

    const privateJWKS = { keys: [privateJWK] };
    const publicJWKS = { keys: [publicJWK] };

    const configDir = path.join(__dirname, '..', 'config');

    try {
        await fs.mkdir(configDir, { recursive: true });
    } catch (e) { }

    await fs.writeFile(
        path.join(configDir, 'jwks-private.json'),
        JSON.stringify(privateJWKS, null, 2)
    );

    await fs.writeFile(
        path.join(configDir, 'jwks-public.json'),
        JSON.stringify(publicJWKS, null, 2)
    );

    console.log('✅ Keys generated successfully in config/');
}

generateKeys().catch(console.error);
