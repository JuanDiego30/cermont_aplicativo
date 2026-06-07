import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GET, HEAD } from "../../../src/app/api/backend/[...path]/route";

describe("/api/backend proxy route", () => {
	const originalFetch = globalThis.fetch;

	afterEach(() => {
		globalThis.fetch = originalFetch;
		vi.restoreAllMocks();
	});

	it("forwards backend responses through the frontend proxy", async () => {
		const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
			new Response(JSON.stringify({ success: true, data: [{ id: "order-1" }] }), {
				status: 200,
				headers: {
					"Content-Type": "application/json",
				},
			}),
		);
		globalThis.fetch = fetchMock;

		const request = new NextRequest("http://localhost:3000/api/backend/orders?limit=1", {
			headers: {
				Authorization: "Bearer token",
				Cookie: "refreshToken=old",
			},
		});
		const response = await GET(request, {
			params: Promise.resolve({ path: ["orders"] }),
		});

		expect(fetchMock).toHaveBeenCalledWith(
			"http://localhost:4000/api/orders?limit=1",
			expect.objectContaining({
				method: "GET",
				cache: "no-store",
				redirect: "manual",
			}),
		);
		expect(response.status).toBe(200);
		await expect(response.json()).resolves.toEqual({
			success: true,
			data: [{ id: "order-1" }],
		});
	});

	it("returns BACKEND_UNAVAILABLE instead of a generic 500 when backend fetch fails", async () => {
		const fetchMock = vi.fn<typeof fetch>().mockRejectedValue(new Error("ECONNREFUSED"));
		globalThis.fetch = fetchMock;

		const request = new NextRequest("http://localhost:3000/api/backend/dashboard/summary");
		const response = await GET(request, {
			params: Promise.resolve({ path: ["dashboard", "summary"] }),
		});

		expect(response.status).toBe(503);
		await expect(response.json()).resolves.toEqual({
			ok: false,
			code: "BACKEND_UNAVAILABLE",
			message: "El backend no está disponible. Se mostrarán datos locales si existen.",
		});
	});

	it("returns a no-error fallback signal for the connectivity health probe", async () => {
		const fetchMock = vi.fn<typeof fetch>().mockRejectedValue(new Error("ECONNREFUSED"));
		globalThis.fetch = fetchMock;

		const request = new NextRequest("http://localhost:3000/api/backend/health", {
			method: "HEAD",
		});
		const response = await HEAD(request, {
			params: Promise.resolve({ path: ["health"] }),
		});

		expect(response.status).toBe(204);
		expect(response.headers.get("X-Cermont-Backend-Available")).toBe("false");
		expect(response.headers.get("X-Cermont-Connectivity-Fallback")).toBe("serwist");
	});
});
