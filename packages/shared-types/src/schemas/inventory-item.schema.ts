import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

export const InventoryCategorySchema = z.enum([
	"herramienta",
	"equipo",
	"material",
	"epp",
	"consumible",
	"otro",
]);
export type InventoryCategory = z.infer<typeof InventoryCategorySchema>;

export const InventoryMovementTypeSchema = z.enum([
	"entrada",
	"salida",
	"ajuste",
	"prestamo",
	"devolucion",
]);
export type InventoryMovementType = z.infer<typeof InventoryMovementTypeSchema>;

export const InventoryItemSchema = z
	.object({
		_id: ObjectIdSchema.optional(),
		name: z.string().min(1).max(200),
		category: InventoryCategorySchema,
		currentStock: z.number().int().nonnegative().default(0),
		minStock: z.number().int().nonnegative().default(0),
		unit: z.string().min(1).max(30),
		location: z.string().max(200).optional(),
		lastMovementDate: z.string().datetime().optional(),
		notes: z.string().max(500).optional(),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strict();
export type InventoryItem = z.infer<typeof InventoryItemSchema>;

export const StockMovementSchema = z
	.object({
		_id: ObjectIdSchema.optional(),
		itemId: ObjectIdSchema,
		type: InventoryMovementTypeSchema,
		quantity: z.number().int(),
		reason: z.string().max(300).optional(),
		userId: ObjectIdSchema,
		orderId: ObjectIdSchema.optional(),
		movementDate: z.string().datetime(),
		createdAt: z.string().datetime(),
	})
	.strict();
export type StockMovement = z.infer<typeof StockMovementSchema>;

// ─── Input DTOs ──────────────────────────────────────────────────────────────

export const CreateInventoryItemSchema = InventoryItemSchema.omit({
	_id: true,
	currentStock: true,
	lastMovementDate: true,
	createdAt: true,
	updatedAt: true,
}).extend({
	initialStock: z.number().int().nonnegative().default(0),
});
export type CreateInventoryItemInput = z.infer<typeof CreateInventoryItemSchema>;

export const UpdateInventoryItemSchema = InventoryItemSchema.omit({
	_id: true,
	currentStock: true,
	lastMovementDate: true,
	createdAt: true,
	updatedAt: true,
}).partial();
export type UpdateInventoryItemInput = z.infer<typeof UpdateInventoryItemSchema>;

export const RegisterStockMovementSchema = z
	.object({
		type: InventoryMovementTypeSchema,
		quantity: z.number().int().positive(),
		reason: z.string().max(300).optional(),
		orderId: ObjectIdSchema.optional(),
	})
	.strict();
export type RegisterStockMovementInput = z.infer<typeof RegisterStockMovementSchema>;

export const InventoryItemIdParamsSchema = z.object({ id: ObjectIdSchema }).strict();

export const ListInventoryQuerySchema = z
	.object({
		page: z.coerce.number().int().positive().default(1),
		limit: z.coerce.number().int().positive().max(100).default(20),
		category: InventoryCategorySchema.optional(),
		lowStock: z.coerce.boolean().optional(),
		search: z.string().max(200).optional(),
	})
	.strict();
export type ListInventoryQuery = z.infer<typeof ListInventoryQuerySchema>;
