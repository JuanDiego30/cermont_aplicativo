/**
 * Order Types — Re-exports from @cermont/shared-types (SSOT)
 *
 * All entity types live in shared-types. This file only re-exports
 * for convenience so local consumers don't need to change imports.
 *
 * Single Source of Truth: @cermont/shared-types/src/schemas/order.schema.ts
 */
export type {
	AssignOrderInput,
	CreateOrderInput,
	Order,
	OrderIdParams,
	OrderPriority,
	OrderStatus,
	OrderType,
	UpdateOrderStatusInput,
} from "@cermont/shared-types";
