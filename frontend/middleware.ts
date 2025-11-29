import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware for Route Protection and RBAC
 * 
 * This middleware runs BEFORE page rendering and protects routes based on:
 * 1. Authentication status (has valid token?)
 * 2. User role (ROOT, ADMIN, COORDINADOR, AUXILIAR, CLIENTE)
 * 
 * Route Configuration:
 * - Public: Anyone can access (login, register, landing)
 * - Authenticated: Any logged-in user
 * - Admin: Only ROOT and ADMIN roles
 * - Client: Only CLIENTE role
 */

// ==================================================
// ROUTE CONFIGURATION
// ==================================================

const PUBLIC_ROUTES = [
    '/signin',
    '/signup',
    '/login',
    '/register',
    '/forgot-password',
    '/',
    '/api/auth/login',
    '/api/auth/register',
];

const CLIENT_ONLY_ROUTES = [
    '/client',
];

const ADMIN_ONLY_ROUTES = [
    '/admin',
    '/users',
    '/billing',
];

const ADMIN_ROLES = ['ROOT', 'ADMIN', 'COORDINADOR', 'COORDINATOR', 'SUPERVISOR'];
const CLIENT_ROLES = ['CLIENTE', 'CLIENT'];

// ==================================================
// HELPER FUNCTIONS
// ==================================================

function isPublicRoute(pathname: string): boolean {
    return PUBLIC_ROUTES.some(route =>
        pathname === route || pathname.startsWith(`${route}/`)
    );
}

function isClientRoute(pathname: string): boolean {
    return CLIENT_ONLY_ROUTES.some(route => pathname.startsWith(route));
}

function isAdminRoute(pathname: string): boolean {
    return ADMIN_ONLY_ROUTES.some(route =>
        pathname === route || pathname.startsWith(`${route}/`)
    );
}

function isAdminRole(role: string | undefined): boolean {
    return role ? ADMIN_ROLES.includes(role) : false;
}

// ==================================================
// MIDDLEWARE
// ==================================================

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip middleware for static files and API routes (except auth)
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname.includes('/favicon.ico') ||
        pathname.includes('/manifest.json') ||
        (pathname.startsWith('/api') && !pathname.startsWith('/api/auth'))
    ) {
        return NextResponse.next();
    }

    // Get auth data from cookies
    const accessToken = request.cookies.get('cermont_atg_token')?.value;
    const userRole = request.cookies.get('userRole')?.value;
    const isAuthenticated = !!accessToken;

    // ================================================
    // 1. PUBLIC ROUTES - Always allow
    // ================================================
    if (isPublicRoute(pathname)) {
        // If authenticated user tries to access login/register, redirect to appropriate dashboard
        if (isAuthenticated && (pathname === '/login' || pathname === '/register' || pathname === '/signin' || pathname === '/signup')) {
            const dashboardUrl = CLIENT_ROLES.includes(userRole || '') ? '/client/dashboard' : '/dashboard';
            return NextResponse.redirect(new URL(dashboardUrl, request.url));
        }
        return NextResponse.next();
    }

    // ================================================
    // 2. AUTHENTICATION CHECK
    // ================================================
    if (!isAuthenticated) {
        // Redirect to login with return URL
        const loginUrl = new URL('/signin', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // ================================================
    // 3. ROLE-BASED ACCESS CONTROL
    // ================================================

    // CLIENT ROLE - Only access client routes
    if (CLIENT_ROLES.includes(userRole || '')) {
        if (!isClientRoute(pathname)) {
            // Clients can only access /client/* routes
            return NextResponse.redirect(new URL('/client/dashboard', request.url));
        }
        return NextResponse.next();
    }

    // ADMIN ROLES - Can access admin routes
    if (isAdminRoute(pathname)) {
        if (!isAdminRole(userRole)) {
            // Non-admin trying to access admin route
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        return NextResponse.next();
    }

    // CLIENT ROUTES - Non-clients can't access
    if (isClientRoute(pathname) && !CLIENT_ROLES.includes(userRole || '')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // ================================================
    // 4. DEFAULT - Allow access to general routes
    // ================================================
    return NextResponse.next();
}

// ==================================================
// MATCHER CONFIGURATION
// ==================================================

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, robots.txt, etc.
         */
        '/((?!_next/static|_next/image|favicon.ico|robots.txt|manifest.json|sw.js|workbox-.*.js).*)',
    ],
};
