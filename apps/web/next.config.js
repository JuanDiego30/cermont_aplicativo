const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    // Permitir orígenes de desarrollo para evitar warnings (Comentado para permitir cualquier origen/IP en dev)
    // allowedDevOrigins: ['http://127.0.0.1:3000', 'http://localhost:3000'],

    // Transpilar paquetes para webpack/turbopack
    transpilePackages: [
        '@fullcalendar/common',
        '@fullcalendar/daygrid',
        '@fullcalendar/timegrid',
        '@fullcalendar/interaction',
        '@fullcalendar/react',
        '@fullcalendar/core',
        '@vercel/analytics',
        '@vercel/speed-insights',
    ],

    // ============================================
    // MEJORAS BASADAS EN VERCEL/EXAMPLES
    // ============================================

    // Optimización de imágenes (vercel/examples/solutions/reduce-image-bandwidth-usage)
    images: {
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 60 * 60 * 24 * 30, // 30 días
        dangerouslyAllowSVG: true,
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.vercel.app',
            },
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
            },
        ],
    },

    // Headers de seguridad (vercel/examples/edge-middleware/add-header)
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                ],
            },
            {
                // Cachear assets estáticos por 1 año
                source: '/static/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                // Cachear imágenes optimizadas
                source: '/_next/image/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ];
    },

    // Rewrites para proxy al backend - DESHABILITADO: Ahora usa /api/proxy route handler
    // async rewrites() {
    //     const apiUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    //     return [
    //         {
    //             // Proxy todas las llamadas /api/proxy/* al backend
    //             source: '/api/proxy/:path*',
    //             destination: `${apiUrl}/api/:path*`,
    //         },
    //     ];
    // },

    // Redirects comunes
    async redirects() {
        return [
            {
                source: '/home',
                destination: '/',
                permanent: true,
            },
            {
                source: '/admin',
                destination: '/dashboard',
                permanent: false,
            },
        ];
    },

    // Configuración experimental
    experimental: {
        // Optimizar paquetes del servidor
        optimizePackageImports: [
            'lucide-react',
            '@fullcalendar/core',
            '@fullcalendar/react',
            'date-fns',
            'zod',
        ],
    },

    // Configuración de logging
    logging: {
        fetches: {
            fullUrl: process.env.NODE_ENV === 'development',
        },
    },

    // Configuración de Turbopack (requerido cuando hay webpack config)
    turbopack: {},

    // Webpack personalizado (si es necesario)
    webpack: (config, { isServer }) => {
        // Optimizaciones adicionales
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
            };
        }
        return config;
    },
};

module.exports = nextConfig;
