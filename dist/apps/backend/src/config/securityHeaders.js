import helmet from 'helmet';
import { logger } from '../utils/logger';
const generateNonce = () => {
    return Buffer.from(crypto.randomUUID()).toString('base64');
};
export const advancedSecurityHeaders = () => {
    const isProduction = process.env.NODE_ENV === 'production';
    const frontendUrl = process.env.FRONTEND_URL || (isProduction ? 'https://your-frontend-domain.com' : 'http://localhost:3000');
    const cspNonce = isProduction ? "'nonce-{{nonce}}'" : "'unsafe-inline'";
    const cspDirectives = {
        defaultSrc: ["'self'"],
        scriptSrc: [
            "'self'",
            cspNonce,
            ...(isProduction ? [] : ["'unsafe-eval'"]),
            frontendUrl,
        ],
        styleSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://fonts.googleapis.com',
            ...(isProduction ? [] : ["'unsafe-inline'"]),
        ],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'https:', ...(isProduction ? [] : ['http:'])],
        connectSrc: [
            "'self'",
            frontendUrl,
            ...(isProduction ? ['wss://your-domain.com'] : ['ws://localhost:*', 'wss://localhost:*']),
        ],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: isProduction ? [] : undefined,
    };
    if (isProduction) {
        cspDirectives.reportUri = ['/csp-report'];
    }
    const hstsConfig = isProduction ? {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
    } : false;
    const helmetOptions = {
        contentSecurityPolicy: {
            directives: cspDirectives,
            reportOnly: !isProduction,
        },
        hsts: hstsConfig,
        frameguard: { action: 'deny' },
        hidePoweredBy: true,
        ieNoOpen: true,
        noSniff: true,
        xssFilter: true,
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
        dnsPrefetchControl: { allow: false },
        crossOriginEmbedderPolicy: isProduction ? { policy: 'require-corp' } : false,
        crossOriginOpenerPolicy: isProduction ? { policy: 'same-origin' } : false,
        crossOriginResourcePolicy: { policy: 'same-origin' },
        originAgentCluster: isProduction ? true : false,
    };
    return helmet(helmetOptions);
};
export const permissionsPolicy = (req, res, next) => {
    const isProduction = process.env.NODE_ENV === 'production';
    let policy;
    if (isProduction) {
        policy = [
            'geolocation=()',
            'microphone=()', 'camera=()', 'payment=()', 'usb=()', 'vr=()',
            'accelerometer=()', 'gyroscope=()', 'magnetometer=()', 'midi=()', 'notifications=()',
            'fullscreen=(self)',
        ].join(', ');
    }
    else {
        policy = [
            'geolocation=(self)', 'microphone=()', 'camera=()', 'payment=()', 'usb=()',
            'fullscreen=(self)',
            'geolocation=(self)',
        ].join(', ');
    }
    res.setHeader('Permissions-Policy', policy);
    if (process.env.NODE_ENV === 'development') {
        logger.debug(`Permissions-Policy set: ${policy.substring(0, 50)}...`);
    }
    next();
};
export const securityMiddleware = [
    advancedSecurityHeaders(),
    permissionsPolicy,
];
export default advancedSecurityHeaders;
//# sourceMappingURL=securityHeaders.js.map