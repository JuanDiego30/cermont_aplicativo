/**
 * Test de conectividad Frontend -> Backend
 * Simula una petición desde el frontend al backend con HTTPS
 */

import https from 'https';
import axios from 'axios';

// Agente HTTPS que acepta certificados auto-firmados
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const testLogin = async () => {
  console.log('\n🔐 Test de Login Frontend -> Backend');
  console.log('='.repeat(60));
  console.log('📧 Email: juan.arevalo2@unipamplona.edu.co');
  console.log('🔑 Password: Admin123');
  console.log('🌐 Backend: https://localhost:4100/api/v1/auth/login');
  console.log('🎨 Frontend: http://localhost:3001\n');

  try {
    const response = await axios.post(
      'https://localhost:4100/api/v1/auth/login',
      {
        email: 'juan.arevalo2@unipamplona.edu.co',
        password: 'Admin123',
      },
      {
        httpsAgent, // Acepta certificados auto-firmados
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:3001', // Simula petición desde frontend
        },
      }
    );

    console.log('✅ CONEXIÓN EXITOSA!');
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    console.log(`👤 Usuario: ${response.data.data.user.nombre}`);
    console.log(`🎫 Access Token: ${response.data.data.tokens.accessToken ? 'Presente' : 'No encontrado'}`);
    console.log(`🔄 Refresh Token: ${response.data.data.tokens.refreshToken ? 'Presente' : 'No encontrado'}`);
    console.log('\n🎉 El frontend PUEDE conectarse al backend!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ ERROR DE CONEXIÓN!');
    console.error('='.repeat(60));
    
    if (error.code === 'ECONNREFUSED') {
      console.error('🔴 Backend no está respondiendo');
      console.error('   Solución: Verifica que el backend esté corriendo');
    } else if (error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
      console.error('🔴 Problema con certificado HTTPS');
      console.error('   Solución: El httpsAgent debería resolverlo');
    } else if (error.response) {
      console.error(`🔴 Backend respondió con error: ${error.response.status}`);
      console.error(`   Mensaje: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(`🔴 Error: ${error.message}`);
      console.error(`   Código: ${error.code || 'N/A'}`);
    }
    
    console.error('\n💡 Detalles del error:');
    console.error(error);
    console.error('='.repeat(60));
    process.exit(1);
  }
};

testLogin();
