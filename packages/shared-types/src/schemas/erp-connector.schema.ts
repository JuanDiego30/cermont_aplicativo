/**
 * ERP Connector Schema — Multi-ERP abstraction layer contracts
 *
 * Phase 3: Multi-ERP Abstraction Layer
 * Defines the contracts for pluggable ERP adapters (FSSM, GMAO/CSM, SAP, etc.)
 */
import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

export const ErpProviderTypeEnum = z.enum(["fssm", "gmao_csm", "sap", "ariba", "dian", "custom"]);

export type ErpProviderType = z.infer<typeof ErpProviderTypeEnum>;

export const ErpAuthTypeEnum = z.enum(["api_key", "oauth2", "basic", "jwt", "none"]);

export type ErpAuthType = z.infer<typeof ErpAuthTypeEnum>;

export const ErpSyncOperationEnum = z.enum([
	"create_order",
	"update_order",
	"sync_workforce",
	"sync_assets",
	"submit_invoice",
	"check_payment",
	"pull_catalog",
	"push_evidence",
	"push_report",
]);

export type ErpSyncOperation = z.infer<typeof ErpSyncOperationEnum>;

export const ErpConnectorConfigSchema = z.object({
	_id: ObjectIdSchema,
	provider: ErpProviderTypeEnum,
	name: z.string().min(1),
	baseUrl: z.string().url().optional(),
	authType: ErpAuthTypeEnum,
	authConfig: z.record(z.string(), z.unknown()).optional(),
	enabled: z.boolean().default(true),
	syncInterval: z.number().int().min(0).default(300),
	metadata: z.record(z.string(), z.unknown()).optional(),
	lifecycleStatus: z.enum(["active", "deleted"]).default("active"),
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime(),
});

export type IErpConnectorConfig = z.infer<typeof ErpConnectorConfigSchema>;

export const CreateErpConnectorSchema = z.object({
	provider: ErpProviderTypeEnum,
	name: z.string().min(1),
	baseUrl: z.string().url().optional(),
	authType: ErpAuthTypeEnum,
	authConfig: z.record(z.string(), z.unknown()).optional(),
	enabled: z.boolean().default(true),
	syncInterval: z.number().int().min(0).default(300),
	metadata: z.record(z.string(), z.unknown()).optional(),
});

export type CreateErpConnectorInput = z.infer<typeof CreateErpConnectorSchema>;

export const UpdateErpConnectorSchema = CreateErpConnectorSchema.partial();

export type UpdateErpConnectorInput = z.infer<typeof UpdateErpConnectorSchema>;

export const SyncErpConnectorParamsSchema = z
	.object({
		provider: ErpProviderTypeEnum,
	})
	.strict();

export type SyncErpConnectorParams = z.infer<typeof SyncErpConnectorParamsSchema>;

export const SyncErpConnectorRequestSchema = z.object({}).strict().default({});

export type SyncErpConnectorRequest = z.infer<typeof SyncErpConnectorRequestSchema>;

export const ValidateErpMappingSchema = z
	.object({
		fieldMappings: z.record(z.string(), z.string()),
	})
	.strict();

export type ValidateErpMappingInput = z.infer<typeof ValidateErpMappingSchema>;
