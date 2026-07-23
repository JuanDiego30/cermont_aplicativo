import { describe, expect, it, vi } from "vitest";
import { fireLandingEvent } from "@/landing/analytics/landing-analytics";

describe("landingAnalytics", () => {
	it("does not throw when called server-side", () => {
		expect(() => fireLandingEvent("landing_view")).not.toThrow();
	});

	it("logs to console when dataLayer is absent", () => {
		const consoleSpy = vi.spyOn(console, "info").mockImplementation(() => {});
		fireLandingEvent("hero_primary_cta_click", "hero-test");
		expect(consoleSpy).toHaveBeenCalledWith(
			"[Landing Analytics]",
			"hero_primary_cta_click",
			"hero-test",
		);
		consoleSpy.mockRestore();
	});

	it("pushes to dataLayer when available", () => {
		const dataLayer: unknown[] = [];
		vi.stubGlobal("dataLayer", dataLayer);
		fireLandingEvent("whatsapp_click");
		expect(dataLayer).toHaveLength(1);
		expect(dataLayer[0]).toEqual({ event: "whatsapp_click", label: undefined });
		vi.unstubAllGlobals();
	});
});
