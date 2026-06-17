import { canAccessPath, isPublicPath, normalizeUserRole, type UserRole } from "@cermont/domain";
import { type NextRequest, NextResponse } from "next/server";
import { APP_ROUTES } from "@/lib/routes";

const REFRESH_TOKEN_COOKIE = "refreshToken";
const USER_ROLE_COOKIE = "userRole";

type RoleLookup =
	| {
			status: "found";
			role: UserRole;
	  }
	| {
			status: "missing";
	  };

function missingRole(): RoleLookup {
	return { status: "missing" };
}

function foundRole(value: string): RoleLookup {
	const role = normalizeUserRole(value);
	return role ? { status: "found", role } : missingRole();
}

function decodeBase64Url(segment: string): string {
	const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
	const padding = "=".repeat((4 - (base64.length % 4)) % 4);
	return atob(`${base64}${padding}`);
}

function getRoleFromRefreshToken(token: string): RoleLookup {
	const payloadSegment = token.split(".")[1];
	if (!payloadSegment) {
		return missingRole();
	}

	try {
		const payload = JSON.parse(decodeBase64Url(payloadSegment)) as { role?: string };
		return typeof payload.role === "string" ? foundRole(payload.role) : missingRole();
	} catch {
		return missingRole();
	}
}

function getRequestRole(request: NextRequest): RoleLookup {
	const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
	if (!refreshToken) {
		return missingRole();
	}

	const readableRole = request.cookies.get(USER_ROLE_COOKIE)?.value;
	if (readableRole) {
		return foundRole(readableRole);
	}

	return getRoleFromRefreshToken(refreshToken);
}

function redirectTo(pathname: string, request: NextRequest): NextResponse {
	return NextResponse.redirect(new URL(pathname, request.url));
}

function redirectToLogin(request: NextRequest): NextResponse {
	const url = new URL(APP_ROUTES.login, request.url);
	url.searchParams.set("next", request.nextUrl.pathname);
	return NextResponse.redirect(url);
}

export function proxy(request: NextRequest) {
	const pathname = request.nextUrl.pathname;

	if (isPublicPath(pathname)) {
		return NextResponse.next();
	}

	const roleLookup = getRequestRole(request);

	if (roleLookup.status === "missing") {
		return redirectToLogin(request);
	}

	if (!canAccessPath(pathname, roleLookup.role)) {
		return redirectTo(APP_ROUTES.unauthorized, request);
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)"],
};

// Service Worker Cache Headers
// In production, the service worker (/serwist/sw.js) is served via Next.js
// Route Handler. Nginx or reverse proxy should override Cache-Control to
// prevent stale SW registration:
//
//   location /serwist/sw.js {
//       add_header Cache-Control "no-cache, no-store, must-revalidate";
//       add_header Pragma "no-cache";
//       expires 0;
//   }
//
// In the VPS nginx config (or equivalent reverse proxy), ensure these
// headers are set so the browser always fetches the latest SW version.
