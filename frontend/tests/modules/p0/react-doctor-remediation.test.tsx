import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { metadata as consentMetadata } from "@/app/(legal)/consent/page";
import { metadata as privacyMetadata } from "@/app/(legal)/privacy/page";
import { ConsentGate } from "@/modules/consents/ui/ConsentGate";
import { OrderTimeline } from "@/modules/orders/ui/OrderTimeline";

describe("P0 React Doctor remediation", () => {
	beforeEach(() => {
		localStorage.clear();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("exports search-preview metadata for both legal pages", () => {
		expect(consentMetadata.title).toBeTruthy();
		expect(consentMetadata.description).toBeTruthy();
		expect(privacyMetadata.title).toBeTruthy();
		expect(privacyMetadata.description).toBeTruthy();
	});

	it("renders the non-blocking consent notice as complementary content", async () => {
		render(<ConsentGate />);
		await act(async () => {
			vi.advanceTimersByTime(2_000);
		});

		expect(screen.getByRole("complementary", { name: "Aviso de privacidad" })).toBeTruthy();
		expect(screen.queryByRole("dialog")).toBeNull();
	});

	it("uses the native progress element for order completion semantics", () => {
		render(<OrderTimeline status="planning" />);

		expect(screen.getByRole("progressbar").tagName).toBe("PROGRESS");
	});
});
