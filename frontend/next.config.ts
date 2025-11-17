import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // ✅ AGREGADO: Resolver warning de lockfiles múltiples
  outputFileTracingRoot: path.join(__dirname, '../'),

  // Usar el tsconfig del directorio actual (frontend)
  typescript: {
    tsconfigPath: './tsconfig.json',
  },

  // Configuración de Next.js
  reactStrictMode: true,

  // Rutas con type-safety
  typedRoutes: true,

  // Configuración de Turbopack para evitar warnings
  turbopack: {},

  // Forzar webpack en lugar de Turbopack para evitar errores
  experimental: {
    webpackBuildWorker: true,
  },

  // Deshabilitar Turbopack completamente
  webpack: (config) => {
    return config;
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*', // Proxy al backend
      },
    ];
  },
};

const isProduction = process.env.NODE_ENV === 'production';

// Garantizar que el worker de webpack se mantenga habilitado a nivel global
nextConfig.experimental = {
  ...nextConfig.experimental,
  webpackBuildWorker: true,
};

// ✅ PWA Configuration - Solo en producción
if (isProduction) {
  try {
    const withPWA = require('next-pwa');
    const pwaConfig = withPWA({
      dest: 'public',
      register: true,
      skipWaiting: true,
      disable: !isProduction,
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts',
            expiration: {
              maxEntries: 4,
              maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
            },
          },
        },
        {
          urlPattern: /^https:\/\/localhost:4100\/api\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            networkTimeoutSeconds: 10,
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 5 * 60, // 5 minutes
            },
          },
        },
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'images',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
            },
          },
        },
      ],
    });

    module.exports = pwaConfig(nextConfig);
  } catch (error) {
    console.warn('next-pwa not available, skipping PWA configuration');
    module.exports = nextConfig;
  }
} else {
  module.exports = nextConfig;
}

export default nextConfig;
