/**
 * Regression tests for the API client 401 → refresh behaviour.
 *
 * Background:
 *   - The auth store intentionally keeps `accessToken` in memory only
 *     (XSS protection); only `user` and `isAuthenticated` are persisted.
 *   - After a page reload (e.g. Serwist's `reloadOnOnline: true` when
 *     connectivity flips back to online), `isAuthenticated` is rehydrated
 *     to `true` but `accessToken` is absent.
 *   - The backend returns `{"code":"UNAUTHORIZED", ...}` for missing
 *     tokens and `{"code":"TOKEN_EXPIRED", ...}` for expired tokens.
 *
 * The client must trigger a refresh-and-retry on ANY 401 when
 * `isAuthenticated` is true — not just on `TOKEN_EXPIRED`. Otherwise
 * the first batch of requests after a reload 401-storms the backend
 * (TanStack Query retries the query, each retry also 401s).
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/http/api-client";
import { useAuthStore } from "@/store/auth.store";

describe("apiClient 401 → refresh behaviour", () => {
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		useAuthStore.setState({
			user: { status: "absent" },
			accessToken: { status: "absent" },
			isAuthenticated: false,
		});
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
		vi.restoreAllMocks();
		useAuthStore.setState({
			user: { status: "absent" },
			accessToken: { status: "absent" },
			isAuthenticated: false,
		});
	});

	it("triggers refresh on 401 with code 'UNAUTHORIZED' when isAuthenticated is true", async () => {
		// Arrange: user is authenticated (persisted) but no in-memory token
		useAuthStore.setState({ isAuthenticated: true });

		// First call (GET /orders) → 401 UNAUTHORIZED (missing token)
		// Second call (POST /auth/refresh) → 200 with new token
		// Third call (GET /orders retry) → 200 OK
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(
				new Response(
					JSON.stringify({
						success: false,
						error: { code: "UNAUTHORIZED", message: "Missing or invalid Authorization header" },
					}),
					{ status: 401, headers: { "Content-Type": "application/json" } },
				),
			)
			.mockResolvedValueOnce(
				new Response(JSON.stringify({ success: true, data: { accessToken: "new-token-abc" } }), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				}),
			)
			.mockResolvedValueOnce(
				new Response(JSON.stringify({ success: true, data: [{ id: "1" }] }), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				}),
			);

		globalThis.fetch = fetchMock as unknown as typeof fetch;

		// Act
		const result = await apiClient.get<{ success: boolean; data: Array<{ id: string }> }>(
			"/orders",
		);

		// Assert
		expect(result).toEqual({ success: true, data: [{ id: "1" }] });
		expect(fetchMock).toHaveBeenCalledTimes(3);

		// Refresh uses the dedicated Next.js handler so rotated cookies and
		// no-store semantics are preserved.
		const refreshCall = fetchMock.mock.calls[1];
		expect(refreshCall[0]).toBe("/api/auth/refresh");
		expect(refreshCall[1].method).toBe("POST");

		// Verify the retry used the new token
		const retryCall = fetchMock.mock.calls[2];
		const retryHeaders = retryCall[1].headers as Record<string, string>;
		expect(retryHeaders.Authorization).toBe("Bearer new-token-abc");

		// Verify the auth store now holds the new token
		expect(useAuthStore.getState().accessToken).toEqual({
			status: "present",
			value: "new-token-abc",
		});
	});

	it("triggers refresh on 401 with code 'TOKEN_EXPIRED' when isAuthenticated is true", async () => {
		useAuthStore.setState({ isAuthenticated: true });

		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(
				new Response(
					JSON.stringify({
						success: false,
						error: { code: "TOKEN_EXPIRED", message: "Token expired" },
					}),
					{ status: 401, headers: { "Content-Type": "application/json" } },
				),
			)
			.mockResolvedValueOnce(
				new Response(JSON.stringify({ success: true, data: { accessToken: "refreshed-token" } }), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				}),
			)
			.mockResolvedValueOnce(
				new Response(JSON.stringify({ success: true, data: { items: [] } }), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				}),
			);

		globalThis.fetch = fetchMock as unknown as typeof fetch;

		const result = await apiClient.get<{ success: boolean; data: { items: unknown[] } }>(
			"/work-requests",
		);

		expect(result).toEqual({ success: true, data: { items: [] } });
		expect(fetchMock).toHaveBeenCalledTimes(3);
	});

	it("does NOT trigger refresh on 401 when isAuthenticated is false", async () => {
		// User is NOT authenticated — the 401 is a real auth failure, not a
		// missing-token-due-to-reload situation.
		useAuthStore.setState({ isAuthenticated: false });

		const fetchMock = vi.fn().mockResolvedValue(
			new Response(
				JSON.stringify({
					success: false,
					error: { code: "UNAUTHORIZED", message: "Invalid credentials" },
				}),
				{ status: 401, headers: { "Content-Type": "application/json" } },
			),
		);

		globalThis.fetch = fetchMock as unknown as typeof fetch;

		await expect(apiClient.get("/orders")).rejects.toMatchObject({
			status: 401,
			code: "UNAUTHORIZED",
		});

		// Only the original request — no refresh attempt
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it("clears auth when refresh itself returns 401", async () => {
		useAuthStore.setState({
			isAuthenticated: true,
			user: {
				status: "present",
				value: { id: "u1", name: "Test", email: "t@e.c", role: "gerente" as never },
			},
		});

		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(
				new Response(
					JSON.stringify({
						success: false,
						error: { code: "UNAUTHORIZED", message: "Missing token" },
					}),
					{ status: 401, headers: { "Content-Type": "application/json" } },
				),
			)
			.mockResolvedValueOnce(
				new Response(
					JSON.stringify({
						success: false,
						error: { code: "UNAUTHORIZED", message: "Refresh token invalid" },
					}),
					{ status: 401, headers: { "Content-Type": "application/json" } },
				),
			);

		globalThis.fetch = fetchMock as unknown as typeof fetch;

		await expect(apiClient.get("/orders")).rejects.toMatchObject({
			status: 401,
		});

		// Auth was cleared because the refresh failed
		expect(useAuthStore.getState().isAuthenticated).toBe(false);
		expect(useAuthStore.getState().user.status).toBe("absent");
		expect(useAuthStore.getState().accessToken.status).toBe("absent");
	});
});
