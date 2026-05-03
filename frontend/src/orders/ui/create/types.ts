"use client";

import { CreateOrderSchema } from "@cermont/shared-types";
import type { z } from "zod";

export const newOrderFormSchema = CreateOrderSchema;
export type NewOrderFormData = z.input<typeof newOrderFormSchema>;
export type NewOrderSubmitData = z.output<typeof newOrderFormSchema>;

export function toIsoDateTimeValue(value: unknown): string | undefined {
	if (typeof value !== "string" || value.trim().length === 0) {
		return undefined;
	}

	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? value : date.toISOString();
}

export function toOptionalNumber(value: unknown): number | undefined {
	if (typeof value !== "string" || value.trim().length === 0) {
		return undefined;
	}

	const parsed = Number(value);
	return Number.isNaN(parsed) ? undefined : parsed;
}

export function toOptionalString(value: unknown): string | undefined {
	return typeof value === "string" && value.trim().length === 0 ? undefined : (value as string);
}
