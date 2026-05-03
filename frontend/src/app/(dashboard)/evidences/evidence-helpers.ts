/**
 * Evidences Page — Helper Functions and Constants
 */

import type { EvidenceType } from "@cermont/shared-types";

export type EvidenceFilter = "all" | EvidenceType;

const LEGACY_STAGE_TO_TYPE: Record<string, EvidenceType> = {
	antes: "before",
	durante: "during",
	despues: "after",
	final: "signature",
};

export const EVIDENCE_LABELS: Record<EvidenceType, string> = {
	before: "Before",
	during: "During",
	after: "After",
	defect: "Defect",
	safety: "HSE safety",
	signature: "Signature",
};

export const EVIDENCE_STYLES: Record<EvidenceType, string> = {
	before: "bg-slate-100 text-slate-700 ring-slate-200",
	during: "bg-blue-50 text-blue-700 ring-blue-200",
	after: "bg-emerald-50 text-emerald-700 ring-emerald-200",
	defect: "bg-rose-50 text-rose-700 ring-rose-200",
	safety: "bg-amber-50 text-amber-700 ring-amber-200",
	signature: "bg-purple-50 text-purple-700 ring-purple-200",
};

const DEFAULT_EVIDENCE_STYLE = "bg-slate-100 text-slate-700 ring-slate-200";

function resolveEvidenceType(value: string): EvidenceType | undefined {
	const normalized = value.trim().toLowerCase();
	if (normalized in EVIDENCE_LABELS) {
		return normalized as EvidenceType;
	}

	return LEGACY_STAGE_TO_TYPE[normalized];
}

export function getEvidenceLabel(value: string): string {
	const resolved = resolveEvidenceType(value);
	return resolved ? EVIDENCE_LABELS[resolved] : value;
}

export function getEvidenceStyle(value: string): string {
	const resolved = resolveEvidenceType(value);
	return resolved ? EVIDENCE_STYLES[resolved] : DEFAULT_EVIDENCE_STYLE;
}

export function toEvidenceFilter(raw: string | undefined): EvidenceFilter {
	if (!raw) {
		return "all";
	}

	const resolved = resolveEvidenceType(raw);
	return resolved ?? "all";
}

export function normalizeEvidenceStage(raw: string): string {
	return resolveEvidenceType(raw) ?? raw;
}

export function formatEvidenceDate(date: string | Date) {
	const d = typeof date === "string" ? new Date(date) : date;
	return new Intl.DateTimeFormat("en-US", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(d);
}

export function getFileName(url: string) {
	return url.split("/").pop() ?? url;
}
