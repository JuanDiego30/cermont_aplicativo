// apps/frontend/proxy.ts
// Next.js Proxy — Validates authentication and RBAC for protected routes
//
// NOTE: This file replaces the deprecated middleware.ts
// See: https://nextjs.org/docs/app/api-reference/file-conventions/proxy
// Migration guide: https://nextjs.org/docs/app/building-your-application/routing/proxy#migration-to-proxy
//
// Flow:
// 1. Check if route requires authentication (not in PUBLIC_PATHS)
// 2. Verify refreshToken exists in httpOnly cookie (set by login route handler)
// 3. If missing, redirect to /login
// 4. Check RBAC: read user role from non-HttpOnly cookie and verify path access
// 5. If role doesn't match, redirect to /unauthorized
// 6. If present and valid, allow request (token validity validated by backend)
//
// Reference: DOC-04 Section Middleware Strategy

import { ROUTE_ACCESS_RULES } from "@cermont/domain";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Public paths that don't require authentication
 */
const PUBLIC_PATHS = [
	"/",
	"/login",
	"/register",
	"/forgot-password",
	"/reset-password",
	"/unauthorized",
	"/_next", // Next.js internals
	"/api", // API endpoints (handled by backend auth)
	"/favicon.ico",
	"/robots.txt",
	"/sitemap.xml",
];

/**
 * Role-protected paths — require specific roles to access
 * The user role is read from a non-HttpOnly cookie set at login
 * (the HttpOnly refreshToken cannot be read by the proxy for claims)
 * Uses ROUTE_ACCESS_RULES from @cermont/domain as SSOT
 */
const ROLE_PROTECTED_PATHS: Array<{ path: string; roles: readonly string[] }> =
	(ROUTE_ACCESS_RULES ?? []).map((rule) => ({ path: rule.prefix, roles: rule.roles }));

/**
 * Proxy function — runs before request reaches app
 * Validates refreshToken cookie and RBAC for protected routes
 *
 * @param request - NextRequest object
 * @returns NextResponse with redirect or next()
 */
export function proxy(request: NextRequest): NextResponse {
	const { pathname } = request.nextUrl;

	// Skip auth validation for public paths
	if (PUBLIC_PATHS.some((path) => (path === "/" ? pathname === "/" : pathname.startsWith(path)))) {
		return NextResponse.next();
	}

	// Check for refresh token in httpOnly cookie
	// This cookie is set by the backend via login route handler
	// Name and path MUST match what backend sets in auth.controller.ts
	const hasRefreshToken = request.cookies.has("refreshToken");

	if (!hasRefreshToken) {
		// No token - redirect to login
		const loginUrl = new URL("/login", request.url);
		return NextResponse.redirect(loginUrl);
	}

	// RBAC check for role-protected paths
	// The user role cookie is non-HttpOnly so the proxy can read it
	// This is a first line of defense; Server Component layouts are the second
	for (const { path, roles } of ROLE_PROTECTED_PATHS) {
		if (pathname.startsWith(path)) {
			const userRole = request.cookies.get("userRole")?.value;
			if (!userRole || !roles.includes(userRole)) {
				return NextResponse.redirect(new URL("/unauthorized", request.url));
			}
			break;
		}
	}

	// Token exists and role checks passed - allow request
	// Note: Token signature and expiration is validated by backend on /api/auth/refresh
	// This proxy only checks presence, not validity
	// @see DOC-04 sección JWT Client Strategy
	return NextResponse.next();
}

/**
 * Proxy matcher configuration
 *
 * Applies proxy to all routes except:
 * - /api/* (API routes handled by backend)
 * - /_next/static/* (static files)
 * - /_next/image/* (image optimization)
 * - /favicon.ico (favicon)
 * - /public/* (public folder)
 *
 * Reference: https://nextjs.org/docs/app/api-reference/file-conventions/proxy#matcher
 */
export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico, sitemap.xml, robots.txt (metadata files)
		 * - public folder
		 */
		"/((?!api/|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|public/).*)",
	],
};
