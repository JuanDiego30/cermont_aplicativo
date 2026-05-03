// @vitest-environment node

import { createHmac } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const cookiesMock = vi.fn();

vi.mock("next/headers", () => ({
	cookies: cookiesMock,
}));

function encodeBase64Url(value: string): string {
	return Buffer.from(value, "utf8").toString("base64url");
}

function signJwt(payload: Record<string, number | string>): string {
	const header = encodeBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
	const body = encodeBase64Url(JSON.stringify(payload));
	const signingInput = `${header}.${body}`;
	const signature = createHmac(
		"sha256",
		process.env.REFRESH_TOKEN_SECRET ?? "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
	)
		.update(signingInput)
		.digest("base64url");

	return `${signingInput}.${signature}`;
}

describe("server auth helpers", () => {
	beforeEach(() => {
		process.env.REFRESH_TOKEN_SECRET = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6";
		cookiesMock.mockReset();
	});

	it("accepts verified refresh-token claims from the request cookie", async () => {
		const token = signJwt({
			sub: "user-1",
			role: "gerente",
			jti: "token-1",
			exp: Math.floor(Date.now() / 1000) + 60,
		});
		cookiesMock.mockResolvedValue({
			get: (name: string) => (name === "refreshToken" ? { value: token } : undefined),
		});

		const serverAuth = await import("@/_shared/lib/http/server-auth");

		await expect(serverAuth.getVerifiedRefreshTokenClaims()).resolves.toEqual({
			subjectId: "user-1",
			role: "manager",
			expiresAt: expect.any(Number),
			tokenId: "token-1",
		});
		await expect(serverAuth.hasValidToken()).resolves.toBe(true);
	});

	it("rejects tampered refresh-token cookies", async () => {
		const original = signJwt({
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
		cookiesMock.mockResolvedValue({
			get: (name: string) =>
				name === "refreshToken"
					? { value: `${header}.${tamperedPayload}.${signature}` }
					: undefined,
		});

		const serverAuth = await import("@/_shared/lib/http/server-auth");

		await expect(serverAuth.getVerifiedRefreshTokenClaims()).resolves.toBeNull();
		await expect(serverAuth.hasValidToken()).resolves.toBe(false);
	});

	it("rejects expired refresh-token cookies", async () => {
		const token = signJwt({
			sub: "user-1",
			role: "gerente",
			jti: "token-1",
			exp: Math.floor(Date.now() / 1000) - 60,
		});
		cookiesMock.mockResolvedValue({
			get: (name: string) => (name === "refreshToken" ? { value: token } : undefined),
		});

		const serverAuth = await import("@/_shared/lib/http/server-auth");

		await expect(serverAuth.getVerifiedRefreshTokenClaims()).resolves.toBeNull();
		await expect(serverAuth.hasValidToken()).resolves.toBe(false);
	});
});
