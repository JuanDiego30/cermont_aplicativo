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
