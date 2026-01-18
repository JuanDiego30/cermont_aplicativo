export const environment = {
  production: true,
  // La URL de la API se configura en el build o mediante proxy de nginx
  apiUrl: '/api',
  wsUrl: '',
  appName: 'Cermont',
  version: '1.0.0',
  enableDebug: false,
  features: {
    weatherModule: true,
    offlineMode: true,
    analytics: false,
  },
  cache: {
    ttl: 600000, // 10 minutos
    maxSize: 200,
  },
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },
};
