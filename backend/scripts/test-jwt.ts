
import 'dotenv/config';
import { jwtService } from '../src/shared/security/jwtService.js';

async function main() {
  try {
    console.log('Esperando inicialización de JWKS...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Probando generación de token...');
    const token = await jwtService.generateAccessToken({
      userId: 'test-id',
      email: 'test@example.com',
      role: 'USER'
    });
    console.log('Token generado con éxito:', token.substring(0, 20) + '...');
  } catch (error) {
    console.error('Error generando token:', error);
  }
}

main();
