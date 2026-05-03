/**
 * Next.js 16 Proxy — Network boundary route protection.
 *
 * Intercepts every matched request to enforce authentication and RBAC
 * before the route renders. Unauthenticated users are redirected to
 * `/login`; authenticated users without the required role see `/unauthorized`.
 *
 * This is the first line of defense. The dashboard layout provides a
 * second server-side check, and the backend validates every API call.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/proxy
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getVerifiedRefreshTokenClaims } from "./middleware/auth-proxy";
import { checkRouteAccess } from "./middleware/rbac-proxy";

export async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const verifiedClaims = await getVerifiedRefreshTokenClaims(request);
	const role = verifiedClaims?.role ?? null;

	const result = checkRouteAccess(pathname, role);

	if (!result.allowed) {
		const destination = result.redirect ?? "/login";

		if (request.nextUrl.pathname === destination) {
			return NextResponse.next();
		}

		if (destination === "/unauthorized") {
			return NextResponse.rewrite(new URL("/unauthorized", request.url));
		}

		return NextResponse.redirect(new URL(destination, request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all paths except:
		 * - /_next (static assets + HMR WebSocket)
		 * - /api (API routes — backend validates these)
		 * - /favicon.ico, /sitemap.xml, /.well-known
		 * - /public/*
		 * - Static file extensions
		 */
		{
			source:
				"/((?!_next|api|favicon\\.ico|sitemap\\.xml|\\.well-known|public|.*\\.(?:ico|png|jpg|jpeg|svg|gif|webp|mp4|webm|woff2?|ttf|eot|css|js|json|xml)).*)",
			missing: [{ type: "header", key: "next-router-prefetch" }],
		},
	],
};
