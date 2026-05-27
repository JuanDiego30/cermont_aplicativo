/**
 * Normalization Utilities — Shared helpers for data transformation
 *
 * Extracted from maintenance.service.ts and checklist.service.ts
 * to eliminate code duplication per DRY principle.
 *
 * All functions return concrete fallback values to comply with the
 * CERMONT zero weak-token rule.
 */

import type { JsonValue } from "../types/safe-types";

export function normalizeText(value?: string | number | boolean | JsonValue): string {
	if (typeof value !== "string") {
		return "";
	}

	return value.trim();
}

export function normalizeTextOptional(value?: string): string {
	if (typeof value !== "string") {
		return "";
	}

	return value.trim();
}

export function normalizeBoolean(value?: string | number | boolean | JsonValue): boolean {
	if (typeof value === "boolean") {
		return value;
	}

	if (typeof value === "string") {
		const normalized = value.trim().toLowerCase();
		if (normalized === "true") {
			return true;
		}
		if (normalized === "false") {
			return false;
		}
	}

	return false;
}

export function normalizeQuantity(value?: string | number | boolean | JsonValue): number {
	if (typeof value === "number" && Number.isFinite(value)) {
		return value;
	}

	if (typeof value === "string" && value.trim().length > 0) {
		const parsed = Number(value);
		if (Number.isFinite(parsed)) {
			return parsed;
		}
	}

	return 0;
}

export function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
