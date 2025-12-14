const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    // Permitir orígenes de desarrollo para evitar warnings
    allowedDevOrigins: ['http://127.0.0.1:3000', 'http://localhost:3000'],
    
    // Transpilar paquetes para webpack/turbopack
    transpilePackages: [
        '@fullcalendar/common',
        '@fullcalendar/daygrid',
        '@fullcalendar/timegrid',
        '@fullcalendar/interaction',
        '@fullcalendar/react',
        '@fullcalendar/core',
    ],
};

module.exports = nextConfig;
