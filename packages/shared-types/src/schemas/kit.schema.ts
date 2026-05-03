/**
 * Kit Schema — Zod validation for kit templates and items
 *
 * Maps to backend model: apps/backend/src/models/Kit.ts
 * Reference: DOC-09 Section Diccionario de Datos, DOC-07 Section Kit Típico
 */

import { z } from "zod";

/**
 * Item within a kit template
 */
export const KitItemSchema = z.object({
	name: z.string().min(1).max(200),
	code: z.string().max(50).optional(),
	quantity: z.number().int().min(1),
	unit: z.string().min(1),
	unitCost: z.number().nonnegative().optional(),
});
export type KitItem = z.infer<typeof KitItemSchema>;

/**
 * Kit template categories
 */
export const KIT_CATEGORY_VALUES = [
	"electrical",
	"mechanical",
	"civil",
	"instrumentation",
	"general",
] as const;

const KIT_CATEGORY_LEGACY_ALIASES: Record<string, (typeof KIT_CATEGORY_VALUES)[number]> = {
	electrico: "electrical",
	mecanico: "mechanical",
	instrumentacion: "instrumentation",
	// "civil" and "general" are the same in both languages
};

function normalizeKitCategory(value: string): string {
	return KIT_CATEGORY_LEGACY_ALIASES[value] ?? value;
}

export const KitCategoryEnum = z.preprocess(
	(val) => (typeof val === "string" ? normalizeKitCategory(val) : val),
	z.enum(["electrical", "mechanical", "civil", "instrumentation", "general"]),
);
export type KitCategory = z.infer<typeof KitCategoryEnum>;

/**
 * Full kit template record (response)
 */
export const KitTemplateSchema = z.object({
	_id: z.string(),
	name: z.string().min(1).max(200),
	description: z.string().max(500).optional(),
	category: KitCategoryEnum,
	items: z.array(KitItemSchema).min(1),
	isActive: z.boolean().default(true),
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime(),
});
export type KitTemplate = z.infer<typeof KitTemplateSchema>;

/**
 * Create a new kit template
 */
export const CreateKitSchema = KitTemplateSchema.omit({
	_id: true,
	createdAt: true,
	updatedAt: true,
});
export type CreateKitInput = z.infer<typeof CreateKitSchema>;
