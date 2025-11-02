/**
 * Test Login API
 */

import https from 'https';

const data = JSON.stringify({
  email: 'juan.arevalo2@unipamplona.edu.co',
  password: 'Admin123'
});

const options = {
  hostname: 'localhost',
  port: 4100,
  path: '/api/v1/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  },
  rejectUnauthorized: false // Aceptar certificados auto-firmados
};

console.log('\n🔐 Probando Login API');
console.log('='.repeat(50));
console.log(`📧 Email: juan.arevalo2@unipamplona.edu.co`);
console.log(`🔑 Password: Admin123`);
console.log(`🌐 URL: https://localhost:4100/api/v1/auth/login\n`);

const req = https.request(options, (res) => {
  let body = '';

  res.on('data', (chunk) => {
    body += chunk;
  });

  res.on('end', () => {
    console.log(`📊 Status: ${res.statusCode} ${res.statusMessage}`);
    console.log(`📝 Response:\n`);
    
    try {
      const json = JSON.parse(body);
      console.log(JSON.stringify(json, null, 2));
      
      if (res.statusCode === 200 && json.success) {
        console.log('\n✅ LOGIN EXITOSO!');
        console.log(`👤 Usuario: ${json.data?.user?.nombre || 'N/A'}`);
        console.log(`🎫 Access Token: ${json.data?.tokens?.accessToken ? 'Presente' : 'No encontrado'}`);
        console.log(`🔄 Refresh Token: ${json.data?.tokens?.refreshToken ? 'Presente' : 'No encontrado'}`);
      } else {
        console.log('\n❌ LOGIN FALLIDO');
      }
    } catch (e) {
      console.log(body);
    }
    
    console.log('\n' + '='.repeat(50));
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error);
});

req.write(data);
req.end();
