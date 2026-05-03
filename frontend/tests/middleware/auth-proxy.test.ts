import type { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import {
	extractRefreshTokenFromCookie,
	getVerifiedRefreshTokenClaims,
} from "@/middleware/auth-proxy";
import { checkRouteAccess } from "@/middleware/rbac-proxy";

const REFRESH_TOKEN_SECRET = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6";

function encodeBase64Url(value: string): string {
	return Buffer.from(value, "utf8").toString("base64url");
}

async function signJwt(payload: Record<string, number | string>): Promise<string> {
	const header = encodeBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
	const body = encodeBase64Url(JSON.stringify(payload));
	const signingInput = `${header}.${body}`;
	
	const key = await globalThis.crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(REFRESH_TOKEN_SECRET),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	
	const signatureBuffer = await globalThis.crypto.subtle.sign(
		"HMAC",
		key,
		new TextEncoder().encode(signingInput)
	);
	
	const signature = Buffer.from(signatureBuffer).toString("base64url");

	return `${signingInput}.${signature}`;
}

describe("auth proxy helpers", () => {
	it("extracts the refresh token from cookies", () => {
		const request = {
			cookies: {
				get: (name: string) => (name === "refreshToken" ? { value: "cookie-token" } : undefined),
			},
		} as NextRequest;

		expect(extractRefreshTokenFromCookie(request)).toBe("cookie-token");
	});

	it("accepts a signed refresh token and exposes verified claims", async () => {
		const token = await signJwt({
			sub: "user-1",
			role: "gerente",
			jti: "token-1",
			exp: Math.floor(Date.now() / 1000) + 60,
		});

		const request = {
			cookies: {
				get: (name: string) => (name === "refreshToken" ? { value: token } : undefined),
			},
		} as NextRequest;

		await expect(getVerifiedRefreshTokenClaims(request)).resolves.toEqual({
			subjectId: "user-1",
			role: "manager",
			expiresAt: expect.any(Number),
			tokenId: "token-1",
		});
	});

	it("rejects tampered refresh tokens", async () => {
		const original = await signJwt({
			sub: "user-1",
			role: "gerente",
			jti: "token-1",
			exp: Math.floor(Date.now() / 1000) + 60,
		});
		const [header, , signature] = original.split(".");
		const tamperedPayload = encodeBase64Url(
			JSON.stringify({
				sub: "user-1",
				role: "administrativo",
				jti: "token-1",
				exp: Math.floor(Date.now() / 1000) + 60,
			}),
		);
		const request = {
			cookies: {
				get: (name: string) =>
					name === "refreshToken"
						? { value: `${header}.${tamperedPayload}.${signature}` }
						: undefined,
			},
		} as NextRequest;

		await expect(getVerifiedRefreshTokenClaims(request)).resolves.toBeNull();
	});

	it("rejects expired refresh tokens", async () => {
		const token = await signJwt({
			sub: "user-1",
			role: "gerente",
			jti: "token-1",
			exp: Math.floor(Date.now() / 1000) - 60,
		});

		const request = {
			cookies: {
				get: (name: string) => (name === "refreshToken" ? { value: token } : undefined),
			},
		} as NextRequest;

		await expect(getVerifiedRefreshTokenClaims(request)).resolves.toBeNull();
	});
});

describe("rbac proxy helpers", () => {
	it("allows public routes without a role", () => {
		expect(checkRouteAccess("/login", null)).toEqual({ allowed: true });
	});

	it("redirects protected routes without a role to login", () => {
		expect(checkRouteAccess("/dashboard", null)).toEqual({ allowed: false, redirect: "/login" });
	});

	it("sends unauthorized authenticated users to the unauthorized page", () => {
		expect(checkRouteAccess("/admin", "client")).toEqual({
			allowed: false,
			redirect: "/unauthorized",
		});
	});
});
