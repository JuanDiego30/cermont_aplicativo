/**
 * Evidences Page — Helper Functions and Constants
 */

import type { Evidence, EvidenceType } from "@cermont/shared-types";

export type EvidenceFilter = "all" | EvidenceType;
export type EvidenceViewMode = "gallery" | "table";

// Hoisted Intl formatters for performance
const EVIDENCE_DATE_FORMATTER = new Intl.DateTimeFormat("es-CO", {
	dateStyle: "medium",
	timeStyle: "short",
});

const LEGACY_STAGE_TO_TYPE: Record<string, EvidenceType> = {
	antes: "before",
	durante: "during",
	despues: "after",
	final: "signature",
};

export const EVIDENCE_STAGE_ORDER: EvidenceType[] = [
	"before",
	"during",
	"after",
	"defect",
	"safety",
	"signature",
];

export const EVIDENCE_LABELS: Record<EvidenceType, string> = {
	before: "Antes",
	during: "Durante",
	after: "Después",
	defect: "Defecto",
	safety: "Seguridad",
	signature: "Firma",
};

const EVIDENCE_DESCRIPTIONS: Record<EvidenceType, string> = {
	before: "Estado inicial antes de intervenir el servicio o activo.",
	during: "Avance operativo, maniobras y soporte del trabajo en curso.",
	after: "Resultado final entregable después de ejecutar la orden.",
	defect: "Hallazgos, fallas o no conformidades detectadas en campo.",
	safety: "Soportes HSE, controles críticos y condiciones seguras.",
	signature: "Firmas o constancias visuales de validación de cierre.",
};

const EVIDENCE_STYLES: Record<EvidenceType, string> = {
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

export function toEvidenceViewMode(raw: string | undefined): EvidenceViewMode {
	return raw === "table" ? "table" : "gallery";
}

export function normalizeEvidenceStage(raw: string): string {
	return resolveEvidenceType(raw) ?? raw;
}

export function groupEvidencesByStage(evidences: Evidence[]): Array<{
	description: string;
	items: Evidence[];
	label: string;
	type: EvidenceType;
}> {
	const grouped = EVIDENCE_STAGE_ORDER.map((type) => ({
		type,
		label: EVIDENCE_LABELS[type],
		description: EVIDENCE_DESCRIPTIONS[type],
		items: evidences.filter((evidence) => evidence.type === type),
	}));

	return grouped.filter((group) => group.items.length > 0);
}

export function formatEvidenceDate(date: string | Date) {
	const d = typeof date === "string" ? new Date(date) : date;
	return EVIDENCE_DATE_FORMATTER.format(d);
}

export function getFileName(url: string) {
	return url.split("/").pop() ?? url;
}
