import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetConnectivityForTests, useConnectivity } from "@/lib/offline/connectivity";

function setNavigatorOnlineState(isOnline: boolean): void {
	Object.defineProperty(window.navigator, "onLine", {
		configurable: true,
		get: () => isOnline,
	});
}

describe("useConnectivity", () => {
	let originalDescriptor: PropertyDescriptor | undefined;

	beforeEach(() => {
		vi.useFakeTimers();
		resetConnectivityForTests();
		originalDescriptor = Object.getOwnPropertyDescriptor(window.navigator, "onLine");
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.unstubAllGlobals();
		resetConnectivityForTests();
		if (originalDescriptor) {
			Object.defineProperty(window.navigator, "onLine", originalDescriptor);
		}
	});

	it("uses the current navigator online state as the initial snapshot", () => {
		setNavigatorOnlineState(false);
		vi.stubGlobal("fetch", vi.fn());

		const { result, unmount } = renderHook(() => useConnectivity());

		expect(result.current.isOnline).toBe(false);
		unmount();
	});

	it("uses online and offline events as triggers, not as truth", async () => {
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
			pendingFetches[0]?.(new Response(null, { status: 204 }));
			await Promise.resolve();
		});

		expect(result.current.isOnline).toBe(true);
		unmount();
	});
});
