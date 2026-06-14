import type { ReminderRule, ReminderType } from "@cermont/shared-types";

export interface ReminderCandidate {
	type: ReminderType;
	threshold: number;
	occurrenceKey: string;
	templateName: string;
	variables: Record<string, string>;
	relatedEntity: {
		entityType: string;
		entityId: string;
	};
}

export type ReminderCheck = (rule: ReminderRule, now: Date) => Promise<ReminderCandidate[]>;

export const DAY_MS = 24 * 60 * 60 * 1000;
export const HOUR_MS = 60 * 60 * 1000;

export function dateOccurrenceKey(date: Date): string {
	return date.toISOString();
}

export function findThreshold(value: number, thresholds: number[]): number | false {
	return thresholds.find((threshold) => threshold === value) ?? false;
}

export function formatDate(date: Date): string {
	return new Intl.DateTimeFormat("es-CO", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		timeZone: "America/Bogota",
	}).format(date);
}

export function formatAmount(amount: number, currency: string): string {
	return new Intl.NumberFormat("es-CO", {
		style: "currency",
		currency,
		maximumFractionDigits: 0,
	}).format(amount);
}
