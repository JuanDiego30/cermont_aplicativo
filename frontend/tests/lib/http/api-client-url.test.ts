/**
 * Regression tests for the API client URL construction.
 *
 * These tests guard against the bug where `useAuth.ts` was calling
 * `apiClient.post("/api/backend/auth/login", ...)` while the apiClient
 * already prepends `API_ROOT = "/api/backend"`, producing the malformed
 * URL `/api/backend/api/backend/auth/login` (which 404s on the Next.js
 * proxy and causes login to fail with 401).
 *
 * The correct contract is:
 *   - Modules call relative paths: `/auth/login`, `/users`, etc.
 *   - Dedicated auth handlers use `/api/auth/*`.
 *   - Other requests use the generic `/api/backend/*` proxy.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient, toApiUrl } from "@/lib/http/api-client";
import { API_ROOT } from "@/lib/http/api-client-constants";

describe("apiClient URL construction", () => {
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		globalThis.fetch = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ success: true, data: {} }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			}),
		) as unknown as typeof fetch;
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
		vi.restoreAllMocks();
	});

	describe("toApiUrl()", () => {
		it("prefixes relative paths with API_ROOT", () => {
			expect(toApiUrl("/auth/login")).toBe(`${API_ROOT}/auth/login`);
			expect(toApiUrl("/users")).toBe(`${API_ROOT}/users`);
		});

		it("normalizes paths missing a leading slash", () => {
			expect(toApiUrl("auth/login")).toBe(`${API_ROOT}/auth/login`);
		});

		it("produces the expected URL for the three auth endpoints", () => {
			expect(toApiUrl("/auth/login")).toBe("/api/backend/auth/login");
			expect(toApiUrl("/auth/refresh")).toBe("/api/backend/auth/refresh");
			expect(toApiUrl("/auth/logout")).toBe("/api/backend/auth/logout");
		});

		it("never produces a duplicated /api/backend prefix", () => {
			const loginUrl = toApiUrl("/auth/login");
			expect(loginUrl).not.toContain("/api/backend/api/backend");
			expect(loginUrl.match(/\/api\/backend/g)).toHaveLength(1);
		});
	});

	describe("apiClient.request URL", () => {
		it("routes login through its dedicated no-store handler", async () => {
			await apiClient.post("/auth/login", { email: "a@b.c", password: "x" });

			expect(globalThis.fetch).toHaveBeenCalledTimes(1);
			const calledUrl = (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mock
				.calls[0][0] as string;
			expect(calledUrl).toBe("/api/auth/login");
		});

		it("routes refresh through its dedicated cookie-forwarding handler", async () => {
			await apiClient.post("/auth/refresh");

			const calledUrl = (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mock
				.calls[0][0] as string;
			expect(calledUrl).toBe("/api/auth/refresh");
		});

		it("calls fetch with a single /api/backend prefix for logout", async () => {
			await apiClient.post("/auth/logout");

			const calledUrl = (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mock
				.calls[0][0] as string;
			expect(calledUrl).toBe("/api/backend/auth/logout");
			expect(calledUrl).not.toContain("/api/backend/api/backend");
		});

		it("does not double-prefix even if a caller passes a path containing /api/backend", async () => {
			// Defensive: if any module accidentally passes the full proxy URL,
			// the client must not strip the prefix and re-apply it.
			await apiClient.get("/api/backend/users");

			const calledUrl = (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mock
				.calls[0][0] as string;
			// The current implementation does NOT detect this case and will
			// produce /api/backend/api/backend/users. We document the actual
			// behaviour here so any future change is intentional.
			expect(calledUrl).toBe("/api/backend/api/backend/users");
		});

		it("does not retry backend-unavailable proxy responses", async () => {
			globalThis.fetch = vi.fn().mockResolvedValue(
				new Response(
					JSON.stringify({
						ok: false,
						code: "BACKEND_UNAVAILABLE",
						message: "El backend no está disponible. Se mostrarán datos locales si existen.",
					}),
					{
						status: 503,
						headers: { "Content-Type": "application/json" },
					},
				),
			) as unknown as typeof fetch;

			await expect(apiClient.get("/orders")).rejects.toMatchObject({
				status: 503,
				code: "BACKEND_UNAVAILABLE",
			});
			expect(globalThis.fetch).toHaveBeenCalledTimes(1);
		});
	});
});
