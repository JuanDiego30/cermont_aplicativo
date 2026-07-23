export type LandingEvent =
	| "landing_view"
	| "hero_primary_cta_click"
	| "hero_secondary_cta_click"
	| "service_view"
	| "service_finder_completed"
	| "evidence_open"
	| "case_view"
	| "resource_download"
	| "diagnostic_start"
	| "diagnostic_submit"
	| "contact_submit"
	| "phone_click"
	| "whatsapp_click"
	| "private_access_click"
	| "faq_expand";

type LandingEventPayload = {
	event: LandingEvent;
	label?: string;
};

export function fireLandingEvent(event: LandingEvent, label?: string) {
	if (typeof window === "undefined") {
		return;
	}

	const payload: LandingEventPayload = { event, label };

	if (typeof window.dataLayer !== "undefined" && Array.isArray(window.dataLayer)) {
		window.dataLayer.push({ event: payload.event, label: payload.label });
		return;
	}

	try {
		console.info("[Landing Analytics]", payload.event, payload.label ?? "");
	} catch {
	}
}

declare global {
	interface Window {
		dataLayer?: unknown[];
	}
}
