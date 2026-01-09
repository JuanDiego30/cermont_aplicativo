export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  wsUrl: 'ws://localhost:3000',
  appName: 'Cermont',
  version: '1.0.0',
  enableDebug: true,
  features: {
    weatherModule: true,
    offlineMode: false,
    analytics: false
  },
  cache: {
    ttl: 300000, // 5 minutos
    maxSize: 100
  },
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100
  }
};
