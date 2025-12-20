/**
 * ARCHIVO: middleware.ts
 * FUNCION: Edge Middleware para autenticación, seguridad, rate limiting, geolocalización,
 *          IP blocking, modo mantenimiento y redirects optimizados
 * IMPLEMENTACION: Basado en patrones de vercel/examples (jwt-authentication, add-header, rate-limit, ip-blocking)
 * DEPENDENCIAS: next/server
 * EXPORTS: middleware, config
 */
import { NextRequest, NextResponse } from 'next/server';

// Rutas que requieren autenticación
const PROTECTED_ROUTES = ['/dashboard'];
const PROTECTED_API_ROUTES = ['/api/ordenes', '/api/users', '/api/clientes', '/api/productos'];

// Rutas públicas (no requieren autenticación)
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

// Rutas excluidas del middleware
const EXCLUDED_ROUTES = ['/maintenance', '/offline', '/api/health', '/api/cron'];

// Nombre de la cookie de autenticación
const AUTH_COOKIE_NAME = 'cermont-auth';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-touch-icon.png|manifest.json|og-image.png|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
};

/**
 * Verifica si la ruta es protegida
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Verifica si es una API protegida
 */
function isProtectedApiRoute(pathname: string): boolean {
  return PROTECTED_API_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Verifica si la ruta es pública
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Verifica si la ruta está excluida del middleware
 */
function isExcludedRoute(pathname: string): boolean {
  return EXCLUDED_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Verifica si el modo mantenimiento está activo
 */
function isMaintenanceMode(): boolean {
  return process.env.MAINTENANCE_MODE === 'true';
}

/**
 * Añade headers de seguridad a la respuesta
 * Basado en: vercel/examples/edge-middleware/add-header
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevenir MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Prevenir clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // Protección XSS
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Política de referrer
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permisos del navegador
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self), interest-cohort=()'
  );

  // HSTS (solo en producción)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  return response;
}

/**
 * Extrae información de geolocalización del request
 * Basado en: vercel/examples/edge-middleware/geolocation
 * Nota: request.geo solo está disponible en Vercel Edge Runtime
 */
function getGeolocationInfo(request: NextRequest): { country: string; city: string; region: string } {
  return {
    country: request.headers.get('x-vercel-ip-country') || 'CO',
    city: request.headers.get('x-vercel-ip-city') || 'Unknown',
    region: request.headers.get('x-vercel-ip-country-region') || 'Unknown',
  };
}

/**
 * Obtiene la IP del cliente para rate limiting
 * Nota: request.ip solo está disponible en Vercel Edge Runtime
 */
/**
 * Lista de IPs bloqueadas (en memoria para desarrollo)
 * En producción usar @upstash/redis
 */
const blockedIPs = new Set<string>();

function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1';
}

/**
 * Rate limiting simple en memoria (para desarrollo)
 * En producción usar Vercel KV o Upstash Redis
 */
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const RATE_LIMIT_MAX = 100; // 100 requests por minuto

function checkRateLimit(ip: string): { success: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now - record.lastReset > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return { success: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return { success: false, remaining: 0 };
  }

  record.count++;
  return { success: true, remaining: RATE_LIMIT_MAX - record.count };
}

/**
 * Middleware principal
 * Basado en: vercel/examples/edge-middleware/jwt-authentication
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIp(request);

  // 0. Excluir rutas específicas del middleware
  if (isExcludedRoute(pathname)) {
    return NextResponse.next();
  }

  // 0.1 Verificar IP bloqueada
  if (blockedIPs.has(ip)) {
    return NextResponse.json(
      {
        error: 'Forbidden',
        message: 'Tu IP ha sido bloqueada. Contacta al administrador.'
      },
      { status: 403 }
    );
  }

  // 0.2 Modo mantenimiento (excepto para admins)
  if (isMaintenanceMode()) {
    const isAdmin = request.cookies.get('cermont-role')?.value === 'admin';
    if (!isAdmin && !pathname.startsWith('/api/')) {
      return NextResponse.redirect(new URL('/maintenance', request.url));
    }
  }

  // 1. Rate Limiting (solo para API routes)
  if (pathname.startsWith('/api/')) {
    const rateLimit = checkRateLimit(ip);

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: 'Too Many Requests',
          message: 'Has excedido el límite de solicitudes. Intenta de nuevo en un minuto.',
          retryAfter: 60
        },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': RATE_LIMIT_MAX.toString(),
            'X-RateLimit-Remaining': '0',
          }
        }
      );
    }
  }

  // 2. Obtener token de autenticación
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = !!token;

  // 3. Geolocalización
  const geo = getGeolocationInfo(request);

  // 4. Manejo de rutas protegidas
  if (isProtectedRoute(pathname) && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 5. Manejo de API routes protegidas
  if (isProtectedApiRoute(pathname) && !isAuthenticated) {
    return NextResponse.json(
      {
        error: 'Unauthorized',
        message: 'Autenticación requerida para acceder a este recurso'
      },
      { status: 401 }
    );
  }

  // 6. Redirigir usuarios autenticados fuera de rutas públicas de auth
  if (isPublicRoute(pathname) && isAuthenticated && pathname !== '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 7. Crear respuesta con headers personalizados
  const response = NextResponse.next();

  // Añadir headers de geolocalización para uso en la app
  response.headers.set('x-user-country', geo.country);
  response.headers.set('x-user-city', geo.city);
  response.headers.set('x-user-region', geo.region);

  // Añadir headers de rate limit
  if (pathname.startsWith('/api/')) {
    const rateLimit = checkRateLimit(ip);
    response.headers.set('X-RateLimit-Limit', RATE_LIMIT_MAX.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
  }

  // Añadir headers de seguridad
  addSecurityHeaders(response);

  // Cache headers para recursos estáticos
  if (pathname.startsWith('/_next/static')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }

  return response;
}
