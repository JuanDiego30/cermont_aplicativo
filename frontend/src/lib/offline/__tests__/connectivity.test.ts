import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { checkRealConnectivity, resetConnectivityForTests, useConnectivity } from "../connectivity";

function setNavigatorOnlineState(isOnline: boolean): void {
	Object.defineProperty(window.navigator, "onLine", {
		configurable: true,
		get: () => isOnline,
	});
}

function createHeadResponse(status: number): Response {
	return new Response(null, { status });
}

describe("offline connectivity", () => {
	let originalNavigatorOnline: PropertyDescriptor | undefined;

	beforeEach(() => {
		vi.useFakeTimers();
		resetConnectivityForTests();
		originalNavigatorOnline = Object.getOwnPropertyDescriptor(window.navigator, "onLine");
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.unstubAllGlobals();
		resetConnectivityForTests();
		if (originalNavigatorOnline) {
			Object.defineProperty(window.navigator, "onLine", originalNavigatorOnline);
		}
	});

	it("reports online when the health ping succeeds", async () => {
		const fetchMock = vi.fn(async () => createHeadResponse(204));
		vi.stubGlobal("fetch", fetchMock);

		await expect(checkRealConnectivity({ endpoints: ["/api/backend/health"] })).resolves.toBe(true);

		expect(fetchMock).toHaveBeenCalledWith(
			"/api/backend/health",
			expect.objectContaining({ method: "HEAD", cache: "no-store" }),
		);
	});

	it("falls back to the Serwist endpoint when the backend health probe asks for fallback", async () => {
		const fetchMock = vi
			.fn<typeof fetch>()
			.mockResolvedValueOnce(
				new Response(null, {
					status: 204,
					headers: { "X-Cermont-Connectivity-Fallback": "serwist" },
				}),
			)
			.mockResolvedValueOnce(createHeadResponse(204));
		vi.stubGlobal("fetch", fetchMock);

		await expect(
			checkRealConnectivity({ endpoints: ["/api/backend/health", "/serwist/sw.js"] }),
		).resolves.toBe(true);

		expect(fetchMock).toHaveBeenNthCalledWith(
			1,
			"/api/backend/health",
			expect.objectContaining({ method: "HEAD", cache: "no-store" }),
		);
		expect(fetchMock).toHaveBeenNthCalledWith(
			2,
			"/serwist/sw.js",
			expect.objectContaining({ method: "HEAD", cache: "no-store" }),
		);
	});

	it("reports offline when the ping fails", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => {
				throw new TypeError("network failure");
			}),
		);

		await expect(checkRealConnectivity({ endpoints: ["/api/backend/health"] })).resolves.toBe(
			false,
		);
	});

	it("reports offline on ping timeout", async () => {
		const fetchMock = vi.fn(
			(_url: string, init?: RequestInit) =>
				new Promise<Response>((_resolve, reject) => {
					init?.signal?.addEventListener("abort", () => {
						reject(new DOMException("Aborted", "AbortError"));
					});
				}),
		);
		vi.stubGlobal("fetch", fetchMock);

		const result = checkRealConnectivity({ endpoints: ["/api/backend/health"] });
		await vi.advanceTimersByTimeAsync(5_000);

		await expect(result).resolves.toBe(false);
	});

	it("uses browser online/offline events only as a trigger for a real check", async () => {
		setNavigatorOnlineState(false);

		const pendingFetches: Array<(response: Response) => void> = [];
		vi.stubGlobal(
			"fetch",
			vi.fn(
				() =>
					new Promise<Response>((resolve) => {
						pendingFetches.push(resolve);
					}),
			),
		);

		const { result, unmount } = renderHook(() => useConnectivity());

		expect(result.current.isOnline).toBe(false);

		setNavigatorOnlineState(true);
		act(() => {
			window.dispatchEvent(new Event("online"));
		});

		expect(result.current.isOnline).toBe(false);

		await act(async () => {
			await vi.advanceTimersByTimeAsync(0);
			pendingFetches[0]?.(createHeadResponse(204));
			await Promise.resolve();
		});

		expect(result.current.isOnline).toBe(true);
		unmount();
	});
});
