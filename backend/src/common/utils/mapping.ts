/**
 * Mapping Utilities — Shared serialization helpers
 *
 * Generic functions for converting ObjectId-like values, dates,
 * and query parameters. Used by controllers to serialize
 * persistence-layer documents into API response shapes.
 */

import { getString } from "./request";

export function toStringId(value: unknown): string {
	if (typeof value === "string") {
		return value;
	}

	if (value && typeof value === "object") {
		const candidateId = (value as { _id?: unknown })._id;
		if (typeof candidateId === "string") {
			return candidateId;
		}

		if (candidateId && typeof candidateId === "object" && "toString" in candidateId) {
			const candidate = (candidateId as { toString: () => string }).toString();
			if (candidate !== "[object Object]") {
				return candidate;
			}
		}
	}

	if (value && typeof value === "object" && "toString" in value) {
		const candidate = (value as { toString: () => string }).toString();
		if (candidate !== "[object Object]") {
			return candidate;
		}
	}

	return "";
}

export function toIsoString(value: unknown): string | undefined {
	if (value === undefined || value === null) {
		return undefined;
	}

	if (value instanceof Date) {
		return value.toISOString();
	}

	if (typeof value === "string") {
		const parsed = new Date(value);
		return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
	}

	return undefined;
}

export function parseNumberQuery(value: unknown, fallback: number, max?: number): number {
	const parsed = Number(getString(value));
	if (!Number.isFinite(parsed) || parsed <= 0) {
		return fallback;
	}

	return typeof max === "number" ? Math.min(parsed, max) : parsed;
}

export function offsetToPage(offset: string | number, limit: string | number): number {
	const offsetNum = Number(offset);
	const limitNum = Number(limit);
	if (limitNum === 0) {
		return 1;
	}
	return Math.floor(offsetNum / limitNum) + 1;
}
