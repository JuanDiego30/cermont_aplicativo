/**
 * Resource Domain Schemas
 *
 * Re-exports Zod schemas from shared-types package.
 * The shared-types package is the single source of truth for API contracts.
 */

export {
	type CreateResource,
	CreateResourceSchema,
	type Resource,
	ResourceSchema,
	type ResourceStatus,
	type ResourceType,
	type UpdateResource,
	UpdateResourceSchema,
	type UpdateResourceStatus,
	UpdateResourceStatusSchema,
} from "@cermont/shared-types";
