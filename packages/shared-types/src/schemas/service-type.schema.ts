/**
 * Service Type Schema — Configuration for multi-service business model
 *
 * Defines service types that Cermont can operate with.
 * Maps to backend model and drives kit/form/evidence suggestions.
 *
 * Phase 1: Multi-service business model
 */

import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";
import { ServiceTypeSchema } from "./template-draft.schema";

/**
 * Full service type configuration
 */
export const ServiceTypeConfigSchema = z.object({
	id: ServiceTypeSchema, // Use the enum value as ID
	name: z.string().min(1).max(200),
	sector: z.enum([
		"construction",
		"maintenance",
		"industrial",
		"commercial",
		"residential",
		"infrastructure",
	]),
	description: z.string().max(1000).optional(),
	icon: z.string().max(100).optional(), // icon name for UI
	color: z.string().max(7).optional(), // hex color
	defaultTemplates: z.array(ObjectIdSchema).default([]),
	defaultKits: z.array(ObjectIdSchema).default([]),
	defaultEvidenceRequirements: z.array(z.string()).default([]), // evidence requirement names
	workflowId: ObjectIdSchema.optional(),
	active: z.boolean().default(true),
	order: z.number().int().min(0).default(0),
});

export type ServiceTypeConfig = z.infer<typeof ServiceTypeConfigSchema>;

/**
 * List of all service type configs
 */
export const ServiceTypeListSchema = z.array(ServiceTypeConfigSchema);
export type ServiceTypeList = z.infer<typeof ServiceTypeListSchema>;
