import { format, isValid } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Safely format a date with locale and invalid-date guard.
 *
 * @returns Formatted string, "—" for nullish input, or "Fecha inválida" for unparseable values.
 */
export function formatDate(
	date: string | Date | null | undefined,
	pattern = "dd MMM yyyy",
): string {
	if (!date) {
		return "—";
	}
	const d = new Date(date);
	if (!isValid(d)) {
		return "Fecha inválida";
	}
	return format(d, pattern, { locale: es });
}

/**
 * Format with time included.
 */
export function formatDateTime(
	date: string | Date | null | undefined,
	pattern = "dd MMM yyyy HH:mm",
): string {
	return formatDate(date, pattern);
}

/**
 * Locale-formatted date string (alias for readability in templates).
 */
export function localeDate(
	date: string | Date | null | undefined,
	options?: Intl.DateTimeFormatOptions,
): string {
	if (!date) {
		return "—";
	}
	const d = new Date(date);
	if (!isValid(d)) {
		return "Fecha inválida";
	}
	if (options) {
		return new Intl.DateTimeFormat("es-CO", options).format(d);
	}
	return formatDate(date, "dd MMM yyyy");
}

/**
 * Locale-formatted date with time.
 */
export function localeDateTime(date: string | Date | null | undefined): string {
	return formatDateTime(date);
}

/**
 * Locale-formatted number (uses Intl.NumberFormat).
 */
export function localeNumber(value: number, decimals = 0): string {
	return new Intl.NumberFormat("es-CO", {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	}).format(value);
}
