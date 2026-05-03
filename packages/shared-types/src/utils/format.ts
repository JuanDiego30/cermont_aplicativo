export function formatBytes(bytes: number | null | undefined): string {
	if (!bytes) {
		return "—";
	}
	if (bytes < 1024) {
		return `${bytes} B`;
	}
	if (bytes < 1024 * 1024) {
		return `${(bytes / 1024).toFixed(1)} KB`;
	}
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type DateDisplayInput = string | number | Date | null | undefined;

const DEFAULT_LOCALE = "es-CO";
const EMPTY_DISPLAY = "—";

function toValidDate(value: DateDisplayInput): Date | false {
	if (!value) {
		return false;
	}

	const date = value instanceof Date ? value : new Date(value);
	return Number.isNaN(date.getTime()) ? false : date;
}

export function formatDate(value: DateDisplayInput): string {
	const date = toValidDate(value);
	if (!date) {
		return "—";
	}

	return date.toLocaleDateString(DEFAULT_LOCALE, {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
}

export function formatDateTime(value: DateDisplayInput): string {
	const date = toValidDate(value);
	if (!date) {
		return EMPTY_DISPLAY;
	}

	return date.toLocaleString(DEFAULT_LOCALE, {
		dateStyle: "medium",
		timeStyle: "short",
	});
}

export function formatCurrency(value: number): string {
	return new Intl.NumberFormat(DEFAULT_LOCALE, {
		style: "currency",
		currency: "COP",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(value);
}
