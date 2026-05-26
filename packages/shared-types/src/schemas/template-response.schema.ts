// =============================================================================
// Template Response Schema - Phase 7: Dynamic Form Runtime
// =============================================================================
// Entidades para almacenar respuestas de formularios dinámicos basados en
// plantillas publicadas. Soporta fotos, firmas, GPS y datos tabulares.
// =============================================================================

import { z } from "zod";
import { CermontOperationalStepCodeSchema } from "./cermont-operational-step.schema";
import {
	DocumentLinkedEntityTypeSchema,
	TemplateResponseOfflineStateSchema,
	TemplateResponseSyncStateSchema,
	TemplateResponseValidationStateSchema,
	TemplateStageSchema,
} from "./document-ingestion.schema";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const TemplateResponseStatusEnum = z.enum([
	"draft", // Borrador guardado localmente
	"in_progress", // En progreso, respuestas parciales
	"submitted", // Enviado al servidor, pendiente de validación
	"validated", // Validado por sistema o supervisor
	"rejected", // Rechazado, requiere corrección
	"synced", // Sincronizado con backend
	"conflict", // Conflicto de sincronización detectado
]);

export const TemplateResponseAttachmentTypeEnum = z.enum(["photo", "document", "audio", "video"]);

// ─── GPS Point ────────────────────────────────────────────────────────────────

export const TemplateResponseGpsPointSchema = z
	.object({
		latitude: z.number().min(-90).max(90),
		longitude: z.number().min(-180).max(180),
		altitude: z.number().optional(),
		accuracy: z.number().optional(), // metros
		timestamp: z.string().datetime(),
		provider: z.string().optional(), // gps, network, etc.
	})
	.strict();

export type TemplateResponseGpsPoint = z.infer<typeof TemplateResponseGpsPointSchema>;

// ─── Signature ──────────────────────────────────────────────────────────────────

export const TemplateResponseSignatureSchema = z
	.object({
		signatureId: z.string().min(1),
		imageData: z.string().min(1), // Base64 encoded SVG or PNG
		imageFormat: z.enum(["svg", "png"]),
		signedAt: z.string().datetime(),
		signedBy: z.string().min(1), // User ID
		signedByName: z.string().min(1),
		ipAddress: z.string().optional(),
		deviceInfo: z.string().optional(),
		confirmed: z.boolean().default(false), // Una vez confirmada es inmutable
	})
	.strict();

export type TemplateResponseSignature = z.infer<typeof TemplateResponseSignatureSchema>;

// ─── Attachment ─────────────────────────────────────────────────────────────────

export const TemplateResponseAttachmentSchema = z
	.object({
		attachmentId: z.string().min(1),
		type: TemplateResponseAttachmentTypeEnum,
		fileName: z.string().min(1),
		mimeType: z.string().min(1),
		sizeBytes: z.number().int().min(0),
		fileHash: z.string().optional(), // SHA-256 para integridad
		storagePath: z.string().optional(), // Ruta en storage backend
		thumbnailPath: z.string().optional(), // Para fotos
		uploadedAt: z.string().datetime(),
		uploadedBy: z.string().min(1),
		gpsPoint: TemplateResponseGpsPointSchema.optional(), // GPS asociado a la foto
		metadata: z.object({}).passthrough().optional(),
	})
	.strict();

export type TemplateResponseAttachment = z.infer<typeof TemplateResponseAttachmentSchema>;

export const TemplateResponsePhotoSchema = TemplateResponseAttachmentSchema.extend({
	type: z.literal("photo"),
});

export type TemplateResponsePhoto = z.infer<typeof TemplateResponsePhotoSchema>;

export const TemplateResponsePrimitiveValueSchema = z.union([z.string(), z.number(), z.boolean()]);

export const TemplateResponseTableRowValueSchema = z.record(
	z.string(),
	z.union([TemplateResponsePrimitiveValueSchema, z.array(TemplateResponsePrimitiveValueSchema)]),
);

export const TemplateResponseEvidenceBlockValueSchema = z
	.object({
		notes: z.string().max(5000).optional(),
		documentIds: z.array(z.string().min(1)).default([]),
		attachments: z.array(TemplateResponseAttachmentSchema).default([]),
		gpsPoint: TemplateResponseGpsPointSchema.optional(),
	})
	.strict();

export const TemplateResponseValueSchema = z.union([
	TemplateResponsePrimitiveValueSchema,
	z.array(TemplateResponsePrimitiveValueSchema),
	TemplateResponseGpsPointSchema,
	TemplateResponseEvidenceBlockValueSchema,
	TemplateResponseTableRowValueSchema,
	z.array(TemplateResponseTableRowValueSchema),
]);

export type TemplateResponseValue = z.infer<typeof TemplateResponseValueSchema>;

export const TemplateResponseValuesSchema = z.record(z.string(), TemplateResponseValueSchema);

// ─── Field Value ────────────────────────────────────────────────────────────────

export const TemplateResponseFieldValueSchema = z
	.object({
		fieldId: z.string().min(1), // Referencia al fieldId de la plantilla
		sectionId: z.string().min(1), // Referencia a la sección
		value: TemplateResponseValueSchema,
		// Valores display para UI (ej: "Sí" para true, "Aprobado" para código)
		displayValue: z.string().optional(),
		// Para campos calculados
		calculatedValue: z.union([z.string(), z.number()]).optional(),
		// Metadatos del campo específico
		metadata: z
			.object({
				originalValue: TemplateResponseValueSchema.optional(),
				overrideReason: z.string().optional(),
				calculationSource: z.string().optional(),
			})
			.optional(),
		// Adjuntos específicos del campo (ej: fotos en campo "Evidencia")
		attachments: z.array(TemplateResponseAttachmentSchema).optional().default([]),
		// Firma específica del campo
		signature: TemplateResponseSignatureSchema.optional(),
		// GPS específico del campo
		gpsPoint: TemplateResponseGpsPointSchema.optional(),
		// Validación del campo
		validation: z
			.object({
				isValid: z.boolean(),
				errors: z.array(z.string()).optional().default([]),
				warnings: z.array(z.string()).optional().default([]),
			})
			.optional(),
		// Timestamp de última modificación del campo
		modifiedAt: z.string().datetime(),
		modifiedBy: z.string().min(1),
	})
	.strict();

export type TemplateResponseFieldValue = z.infer<typeof TemplateResponseFieldValueSchema>;

// ─── Section Response ───────────────────────────────────────────────────────────

export const TemplateResponseSectionSchema = z
	.object({
		sectionId: z.string().min(1), // Referencia al sectionId de la plantilla
		order: z.number().int().min(0),
		// Campos de la sección
		fields: z.array(TemplateResponseFieldValueSchema).min(1),
		// Estado de completitud de la sección
		completionStatus: z.enum(["empty", "partial", "complete", "na"]).default("empty"),
		// Notas de la sección
		notes: z.string().max(5000).optional(),
		// Adjuntos a nivel de sección
		attachments: z.array(TemplateResponseAttachmentSchema).optional().default([]),
	})
	.strict();

export type TemplateResponseSection = z.infer<typeof TemplateResponseSectionSchema>;

// ─── Association Types ──────────────────────────────────────────────────────────

export const TemplateResponseAssociationSchema = z
	.object({
		entityType: z.enum([
			"workRequest",
			"siteVisit",
			"proposal",
			"workOrder",
			"planningPacket",
			"executionSession",
			"technicalReport",
			"deliveryRecord",
			"serviceEntrySheet",
			"invoice",
			"asset",
			"maintenanceEvent",
		]),
		entityId: z.string().min(1),
		associationType: z.enum([
			"required", // Requerido por la entidad
			"attached", // Adjunto a la entidad
			"generated", // Generado desde la entidad
		]),
	})
	.strict();

export type TemplateResponseAssociation = z.infer<typeof TemplateResponseAssociationSchema>;

// ─── Main Template Response ─────────────────────────────────────────────────────

export const TemplateResponseSchema = z
	.object({
		_id: z.string().optional(),
		linkedEntityType: DocumentLinkedEntityTypeSchema.optional(),
		linkedEntityId: z.string().min(1).optional(),
		stage: TemplateStageSchema.optional(),
		targetStepCode: CermontOperationalStepCodeSchema.optional(),
		values: TemplateResponseValuesSchema.optional(),
		attachments: z.array(TemplateResponseAttachmentSchema).optional().default([]),
		photos: z.array(TemplateResponsePhotoSchema).optional().default([]),
		signatures: z.array(TemplateResponseSignatureSchema).optional().default([]),
		gpsPoints: z.array(TemplateResponseGpsPointSchema).optional().default([]),
		offlineState: TemplateResponseOfflineStateSchema.optional(),
		syncState: TemplateResponseSyncStateSchema.optional(),
		validationState: TemplateResponseValidationStateSchema.optional(),
		submittedBy: z.string().optional(),
		approvedBy: z.string().optional(),
		approvedAt: z.string().datetime().optional(),
		// Identificadores de la plantilla
		documentTemplateId: z.string().min(1),
		documentTemplateVersionId: z.string().min(1),
		versionNumber: z.number().int().min(1),
		// Verificación de versión (evita respuestas a versiones obsoletas)
		versionHash: z.string().optional(), // Hash de la versión usada
		// Estado de la respuesta
		status: TemplateResponseStatusEnum.default("draft"),
		// Nombre amigable (opcional, para visualización)
		templateName: z.string().optional(),
		// Secciones con sus valores
		sections: z.array(TemplateResponseSectionSchema).min(1),
		// Asociación con entidades del sistema
		associations: z.array(TemplateResponseAssociationSchema).optional().default([]),
		// Progreso general
		progress: z
			.object({
				totalFields: z.number().int().min(0),
				completedFields: z.number().int().min(0),
				requiredFields: z.number().int().min(0),
				requiredCompleted: z.number().int().min(0),
				percentage: z.number().min(0).max(100),
			})
			.optional(),
		// Offline sync metadata
		offlineMetadata: z
			.object({
				isOfflineCreated: z.boolean().default(false),
				clientMutationId: z.string().optional(), // Para idempotencia
				syncAttempts: z.number().int().min(0).default(0),
				lastSyncAttempt: z.string().datetime().optional(),
				syncError: z.string().optional(),
				pendingAttachments: z.number().int().min(0).default(0),
			})
			.optional(),
		// Conflicto de sincronización
		conflictData: z
			.object({
				serverVersion: z.object({}).passthrough().optional(),
				localVersion: z.object({}).passthrough().optional(),
				conflictFields: z.array(z.string()).optional().default([]),
				resolvedAt: z.string().datetime().optional(),
				resolvedBy: z.string().optional(),
				resolution: z.enum(["keep_local", "keep_server", "merged"]).optional(),
			})
			.optional(),
		// Firma global de la respuesta completa
		globalSignature: TemplateResponseSignatureSchema.optional(),
		// Ubicación de inicio y fin
		startGpsPoint: TemplateResponseGpsPointSchema.optional(),
		endGpsPoint: TemplateResponseGpsPointSchema.optional(),
		// Timestamps de inicio y finalización
		startedAt: z.string().datetime(),
		submittedAt: z.string().datetime().optional(),
		validatedAt: z.string().datetime().optional(),
		validatedBy: z.string().optional(),
		// Metadata
		deviceInfo: z
			.object({
				deviceId: z.string().optional(),
				platform: z.string().optional(),
				appVersion: z.string().optional(),
			})
			.optional(),
		// Audit
		createdAt: z.string().datetime().optional(),
		updatedAt: z.string().datetime().optional(),
		createdBy: z.string().min(1),
		updatedBy: z.string().min(1),
	})
	.strict();

export type TemplateResponse = z.infer<typeof TemplateResponseSchema>;

// ─── Create Template Response ───────────────────────────────────────────────────

export const CreateTemplateResponseSchema = z
	.object({
		documentTemplateId: z.string().min(1),
		documentTemplateVersionId: z.string().min(1),
		associations: z.array(TemplateResponseAssociationSchema).optional().default([]),
		deviceInfo: z
			.object({
				deviceId: z.string().optional(),
				platform: z.string().optional(),
				appVersion: z.string().optional(),
			})
			.optional(),
	})
	.strict();

export type CreateTemplateResponse = z.infer<typeof CreateTemplateResponseSchema>;

// ─── Update Template Response ───────────────────────────────────────────────────

export const UpdateTemplateResponseSchema = z
	.object({
		sections: z.array(TemplateResponseSectionSchema).optional(),
		status: TemplateResponseStatusEnum.optional(),
		progress: z
			.object({
				totalFields: z.number().int().min(0),
				completedFields: z.number().int().min(0),
				requiredFields: z.number().int().min(0),
				requiredCompleted: z.number().int().min(0),
				percentage: z.number().min(0).max(100),
			})
			.optional(),
		offlineMetadata: z
			.object({
				isOfflineCreated: z.boolean().optional(),
				clientMutationId: z.string().optional(),
				syncAttempts: z.number().int().min(0).optional(),
				lastSyncAttempt: z.string().datetime().optional(),
				syncError: z.string().optional(),
				pendingAttachments: z.number().int().min(0).optional(),
			})
			.optional(),
		globalSignature: TemplateResponseSignatureSchema.optional(),
		startGpsPoint: TemplateResponseGpsPointSchema.optional(),
		endGpsPoint: TemplateResponseGpsPointSchema.optional(),
		submittedAt: z.string().datetime().optional(),
		deviceInfo: z
			.object({
				deviceId: z.string().optional(),
				platform: z.string().optional(),
				appVersion: z.string().optional(),
			})
			.optional(),
	})
	.strict();

export type UpdateTemplateResponse = z.infer<typeof UpdateTemplateResponseSchema>;

// ─── Submit Template Response ───────────────────────────────────────────────────

export const SubmitTemplateResponseSchema = z
	.object({
		responseId: z.string().min(1),
		globalSignature: TemplateResponseSignatureSchema.optional(),
		endGpsPoint: TemplateResponseGpsPointSchema.optional(),
		notes: z.string().max(5000).optional(),
	})
	.strict();

export type SubmitTemplateResponse = z.infer<typeof SubmitTemplateResponseSchema>;

// ─── Validate/Reject Template Response ──────────────────────────────────────────

export const ValidateTemplateResponseSchema = z
	.object({
		responseId: z.string().min(1),
		action: z.enum(["validate", "reject"]),
		reason: z.string().max(5000).optional(),
	})
	.strict();

export type ValidateTemplateResponse = z.infer<typeof ValidateTemplateResponseSchema>;

// ─── Filters for Listing ──────────────────────────────────────────────────────────

export const TemplateResponseFiltersSchema = z
	.object({
		documentTemplateId: z.string().optional(),
		documentTemplateVersionId: z.string().optional(),
		status: z.array(TemplateResponseStatusEnum).optional(),
		createdBy: z.string().optional(),
		associationType: z.string().optional(),
		associationEntityId: z.string().optional(),
		dateFrom: z.string().datetime().optional(),
		dateTo: z.string().datetime().optional(),
		isOffline: z.boolean().optional(),
		hasConflicts: z.boolean().optional(),
	})
	.strict();

export type TemplateResponseFilters = z.infer<typeof TemplateResponseFiltersSchema>;

// ─── Utility Schemas ─────────────────────────────────────────────────────────────

export const TemplateResponseIdSchema = z.string().min(1).describe("ID de la respuesta");

export const ResolveSyncConflictSchema = z.object({
	resolution: z.enum(["keep_local", "keep_server", "merged"]),
	mergedData: z.object({}).passthrough().optional(),
});
