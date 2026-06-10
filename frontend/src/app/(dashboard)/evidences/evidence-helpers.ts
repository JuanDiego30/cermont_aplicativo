/**
 * Evidences Page — Helper Functions and Constants
 */

import type { Evidence } from "@cermont/shared-types";

export type EvidenceViewMode = "gallery" | "table";

// Hoisted Intl formatter for performance
const EVIDENCE_DATE_FORMATTER = new Intl.DateTimeFormat("es-CO", {
	dateStyle: "medium",
	timeStyle: "short",
});

export function toEvidenceViewMode(raw: string | undefined): EvidenceViewMode {
	return raw === "table" ? "table" : "gallery";
}

export function formatEvidenceDate(date: string | Date) {
	const d = typeof date === "string" ? new Date(date) : date;
	return EVIDENCE_DATE_FORMATTER.format(d);
}

function getFileName(url: string) {
	return url.split("/").pop() ?? url;
}

/** Returns the display title for an evidence: photoLabel > description > filename */
export function getEvidenceTitle(evidence: Evidence): string {
	const v2 = evidence as Evidence & { photoLabel?: string };
	if (v2.photoLabel?.trim()) {
		return v2.photoLabel.trim();
	}
	if (evidence.description?.trim()) {
		return evidence.description.trim();
	}
	return getFileName(evidence.url);
}

/** Returns the secondary description (everything that's not the title) */
export function getEvidenceSubtitle(evidence: Evidence): string {
	const v2 = evidence as Evidence & { photoLabel?: string };
	if (v2.photoLabel?.trim() && evidence.description?.trim()) {
		return evidence.description.trim();
	}
	return "";
}

/** Groups evidence by orderId for the gallery */
export function groupEvidencesByOrder(evidences: Evidence[]): Map<string, Evidence[]> {
	const groups = new Map<string, Evidence[]>();
	for (const ev of evidences) {
		const key = ev.orderId;
		const existing = groups.get(key) ?? [];
		existing.push(ev);
		groups.set(key, existing);
	}
	return groups;
}
