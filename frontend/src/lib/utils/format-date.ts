import { format, isValid } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Cermont canonical locale and timezone.
 * Explicit values are passed to all Intl formatters to guarantee
 * server/client render identical strings (prevents hydration mismatches).
 */
const CERMONT_LOCALE = "es-CO" as const;
const CERMONT_TIMEZONE = "America/Bogota" as const;

/**
 * SSR-safe locale date formatter.
 *
 * Always passes an explicit locale AND timeZone so the server and browser
 * render the exact same text. This satisfies the react-doctor
 * `no-locale-format-in-render` rule without requiring a `useEffect`.
 */
export function formatLocaleDate(
	date: string | Date | null | undefined,
	options: Intl.DateTimeFormatOptions = { dateStyle: "medium" },
): string {
	if (!date) {
		return "—";
	}
	const d = new Date(date);
	if (!isValid(d)) {
		return "Fecha inválida";
	}
	return new Intl.DateTimeFormat(CERMONT_LOCALE, {
		...options,
		timeZone: CERMONT_TIMEZONE,
	}).format(d);
}

/**
 * SSR-safe locale date+time formatter.
 */
export function formatLocaleDateTime(
	date: string | Date | null | undefined,
	options: Intl.DateTimeFormatOptions = {
		dateStyle: "medium",
		timeStyle: "short",
	},
): string {
	return formatLocaleDate(date, options);
}

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
	return formatLocaleDate(date, options);
}

/**
 * Locale-formatted date with time.
 */
export function localeDateTime(date: string | Date | null | undefined): string {
	return formatLocaleDateTime(date);
}

/**
 * Locale-formatted number (uses Intl.NumberFormat).
 */
export function localeNumber(value: number, decimals = 0): string {
	return new Intl.NumberFormat(CERMONT_LOCALE, {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	}).format(value);
}
