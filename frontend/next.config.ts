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

  // Quitar cabecera X-Powered-By
  poweredByHeader: false,

  // Headers de seguridad y caché
  async headers() {
    return [
      {
        // Estáticos de Next: cache largos
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
      {
        // Imágenes de Next Image
        source: '/_next/image',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=60' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
      {
        // Todas las rutas: seguridad básica
        source: '/:path*',
        headers: [
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=*' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },
    ];
  },
};

export default nextConfig;
