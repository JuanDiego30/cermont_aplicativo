import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useConnectivity } from "@/lib/offline/connectivity";

function setNavigatorOnlineState(isOnline: boolean): void {
	Object.defineProperty(window.navigator, "onLine", {
		configurable: true,
		get: () => isOnline,
	});
}

describe("useConnectivity", () => {
	let originalDescriptor: PropertyDescriptor | undefined;

	beforeEach(() => {
		originalDescriptor = Object.getOwnPropertyDescriptor(window.navigator, "onLine");
	});

	afterEach(() => {
		if (originalDescriptor) {
			Object.defineProperty(window.navigator, "onLine", originalDescriptor);
		}
	});

	it("uses the current navigator online state on mount", () => {
		setNavigatorOnlineState(false);

		const { result } = renderHook(() => useConnectivity());

		expect(result.current.isOnline).toBe(false);
	});

	it("reacts to online and offline events", () => {
		setNavigatorOnlineState(false);

		const { result } = renderHook(() => useConnectivity());

		expect(result.current.isOnline).toBe(false);

		setNavigatorOnlineState(true);

		act(() => {
			window.dispatchEvent(new Event("online"));
		});

		expect(result.current.isOnline).toBe(true);

		setNavigatorOnlineState(false);

		act(() => {
			window.dispatchEvent(new Event("offline"));
		});

		expect(result.current.isOnline).toBe(false);
	});
});
