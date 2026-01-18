export const environment = {
  production: false,
  apiUrl: 'https://staging-api.cermont.com/api',
  wsUrl: 'wss://staging-api.cermont.com',
  appName: 'Cermont [STAGING]',
  version: '1.0.0-beta',
  enableDebug: true,
  features: {
    weatherModule: true,
    offlineMode: true,
    analytics: false,
  },
  cache: {
    ttl: 300000,
    maxSize: 100,
  },
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100,
  },
};
