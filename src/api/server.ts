import http from 'node:http';
import app from './app';
import { env } from './config/env';

const server = http.createServer(app);

server.listen(env.port, () => {
  console.log(`⚡️ Backend API escuchando en http://localhost:${env.port}/v1`);
});

process.on('SIGINT', () => {
  console.log('Cerrando servidor (SIGINT)');
  server.close(() => process.exit(0));
});

process.on('SIGTERM', () => {
  console.log('Cerrando servidor (SIGTERM)');
  server.close(() => process.exit(0));
});
