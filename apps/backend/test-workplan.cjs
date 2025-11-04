const axios = require('axios');
const https = require('https');

const agent = new https.Agent({
  rejectUnauthorized: false
});

async function test() {
  try {
    // Login first
    console.log('Logging in...');
    const loginRes = await axios.post('https://localhost:4100/api/v1/auth/login', {
      email: 'admin@cermont.com',
      password: 'Admin123'
    }, { httpsAgent: agent });

    const token = loginRes.data.token;
    console.log('Login successful, token:', token.substring(0, 20) + '...');

    // Create workplan
    console.log('Creating workplan...');
    const workplanRes = await axios.post('https://localhost:4100/api/v1/workplans', {
      orderId: 'ORDER-001',
      titulo: 'Test Workplan',
      alcance: 'Test scope',
      unidadNegocio: 'Test Unit',
      startDate: '2024-01-01T00:00:00.000Z',
      endDate: '2024-12-31T23:59:59.000Z',
      assignedUsers: ['user1@example.com'],
      tools: ['tool1']
    }, {
      httpsAgent: agent,
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Workplan created successfully:', workplanRes.data);
  } catch (error) {
    console.error('Error details:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Message:', error.message);
    }
  }
}

test();