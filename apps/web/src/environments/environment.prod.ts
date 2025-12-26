export const environment = {
  production: true,
  apiUrl: 'https://api.cermont.com/api',
  wsUrl: 'wss://api.cermont.com',
  appName: 'Cermont',
  version: '1.0.0',
  enableDebug: false,
  features: {
    weatherModule: true,
    offlineMode: true,
    analytics: true
  },
  cache: {
    ttl: 600000, // 10 minutos
    maxSize: 200
  },
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100
  }
};
