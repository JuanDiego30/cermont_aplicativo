export const config = {
  port: parseInt(process.env.PORT || '4100'),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/cermont',
  },
  
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  
  jwt: {
    issuer: process.env.JWT_ISSUER || 'https://atg.cermont.com',
    audience: process.env.JWT_AUDIENCE || 'cermont-atg-api',
    accessTtl: process.env.JWT_ACCESS_TTL || '15m',
    refreshTtl: process.env.JWT_REFRESH_TTL || '7d',
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
  
  rateLimit: {
    window: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  },
};
