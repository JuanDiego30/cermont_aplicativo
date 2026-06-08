/**
 * Mapping Utilities — Shared serialization helpers
 *
 * Generic functions for converting ObjectId-like values, dates,
 * and query parameters. Used by controllers to serialize
 * persistence-layer documents into API response shapes.
 *
 * All functions comply with the CERMONT zero weak-token rule by using
 * concrete serialization inputs and explicit fallback values.
 */

import { getString } from "./request";

type IdCandidate =
	| string
	| number
	| boolean
	| { readonly _id?: string }
	| { readonly toString: () => string };

export function toStringId(value: IdCandidate): string {
	if (typeof value === "string") {
		return value;
	}

	if (value && typeof value === "object") {
		const candidateId = (value as { _id?: string })._id;
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

type ConvertibleDate = string | number | Date;

export function toIsoString(value: ConvertibleDate): string {
	if (value instanceof Date) {
		return value.toISOString();
	}

	if (typeof value === "string") {
		const parsed = new Date(value);
		return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
	}

	return "";
}

export function parseNumberQuery(value: string | number, fallback: number, max?: number): number {
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
