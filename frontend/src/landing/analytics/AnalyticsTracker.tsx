"use client";

import { useEffect } from "react";
import { fireLandingEvent, type LandingEvent } from "./landing-analytics";

const EVENT_MAP: Record<string, LandingEvent> = {
	"cta-hero-primary": "hero_primary_cta_click",
	"cta-hero-secondary": "hero_secondary_cta_click",
	"cta-service": "service_view",
	"cta-evidence": "evidence_open",
	"cta-whatsapp": "whatsapp_click",
	"cta-phone": "phone_click",
	"cta-private-access": "private_access_click",
	"cta-contact-submit": "contact_submit",
	"cta-resource": "resource_download",
	"cta-faq-expand": "faq_expand",
	"cta-diagnostic-start": "diagnostic_start",
	"cta-diagnostic-submit": "diagnostic_submit",
};

export function AnalyticsTracker() {
	useEffect(() => {
		function handleClick(event: MouseEvent) {
			const target = (event.target as HTMLElement).closest("[data-analytics]");
			if (!target) {
				return;
			}
			const analyticsAttr = (target as HTMLElement).getAttribute("data-analytics");
			if (!analyticsAttr) {
				return;
			}
			const landingEvent = EVENT_MAP[analyticsAttr];
			if (!landingEvent) {
				return;
			}
			const label = (target as HTMLElement).getAttribute("data-analytics-label") ?? undefined;
			fireLandingEvent(landingEvent, label);
		}

		document.addEventListener("click", handleClick);
		return () => document.removeEventListener("click", handleClick);
	}, []);

	return null;
}
