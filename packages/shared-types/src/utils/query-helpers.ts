export function normalizeQueryValue(value: unknown): unknown {
	return Array.isArray(value) ? value[0] : value;
}

export function normalizeOptionalStringQueryValue(value: unknown): string | undefined {
	const normalized = normalizeQueryValue(value);

	if (typeof normalized !== "string") {
		return undefined;
	}

	const trimmed = normalized.trim();
	return trimmed.length > 0 ? trimmed : undefined;
}

export function normalizeOptionalBooleanQueryValue(value: unknown): boolean | undefined {
	const normalized = normalizeQueryValue(value);

	if (typeof normalized === "boolean") {
		return normalized;
	}

	if (typeof normalized !== "string") {
		return undefined;
	}

	const trimmed = normalized.trim().toLowerCase();

	if (trimmed === "true" || trimmed === "1") {
		return true;
	}

	if (trimmed === "false" || trimmed === "0") {
		return false;
	}

	return undefined;
}
