/**
 * Closure Report Schema — Zod validation for closure reports (Pasos 8-14)
 *
 * Maps to backend model: backend/src/models/ClosureReport.ts
 * Reference: CERMONT Business Flow Map — Steps 8-14 (Acta → SES → Invoice → Payment → Closed)
 *
 * VERIFIED against repository commit 90ad367 (2026-05-03)
 */

import { z } from "zod";
import { CermontOperationalStepCodeSchema } from "./cermont-operational-step.schema";
import { ClosingEvidenceKindSchema } from "./document-ingestion.schema";

// ── Base Types ──────────────────────────────────────────

const MaterialItemSchema = z.object({
	name: z.string().min(1),
	quantity: z.number().positive(),
	unit: z.string().min(1),
	unitCost: z.number().nonnegative().optional(),
});

export type MaterialItem = z.infer<typeof MaterialItemSchema>;

// ── Paso 9: Firma del Acta ──────────────────────────────

export const ActaSignatureSchema = z.object({
	signedBy: z.string().min(1, "Nombre del firmante requerido"),
	signedAt: z.string().datetime(),
	signatureType: z.enum(["manual_upload", "digital_text", "pending"]).default("pending"),
	signatureDocumentUrl: z.string().url().optional(),
});

export type ActaSignature = z.infer<typeof ActaSignatureSchema>;

// ── Pasos 10-11: SES — Service Entry Sheet (SAP Ariba) ──

export const SESTrackingSchema = z.object({
	sesNumber: z.string().optional(),
	sesRadicatedAt: z.string().datetime().optional(),
	sesRadicatedBy: z.string().optional(),
	sesApprovedAt: z.string().datetime().optional(),
	sesApprovedBy: z.string().optional(),
	sesStatus: z.enum(["pending", "submitted", "approved", "rejected"]).default("pending"),
	sesNotes: z.string().max(1000).optional(),
	supportDocumentUrl: z.string().url().optional(),
});

export type SESTracking = z.infer<typeof SESTrackingSchema>;

// ── Pasos 12-13: Facturación (seguimiento interno) ──────

export const InvoiceTrackingSchema = z.object({
	invoiceNumber: z.string().optional(),
	invoiceAmount: z.number().nonnegative().optional(),
	invoiceCurrency: z.string().default("COP"),
	invoiceIssuedAt: z.string().datetime().optional(),
	invoiceStatus: z.enum(["pending", "issued", "approved", "rejected"]).default("pending"),
	invoiceApprovedAt: z.string().datetime().optional(),
	invoiceApprovedBy: z.string().optional(),
	invoiceDocumentUrl: z.string().url().optional(),
});

export type InvoiceTracking = z.infer<typeof InvoiceTrackingSchema>;

// ── Paso 14: Pago ───────────────────────────────────────

export const PaymentRecordSchema = z.object({
	paymentDate: z.string().datetime().optional(),
	paymentAmount: z.number().nonnegative().optional(),
	paymentReference: z.string().optional(),
	paymentConfirmedBy: z.string().optional(),
	paymentSupportUrl: z.string().url().optional(),
});

export type PaymentRecord = z.infer<typeof PaymentRecordSchema>;

export const ClosureRequirementStatusSchema = z.enum(["missing", "pending", "completed"]);
export type ClosureRequirementStatus = z.infer<typeof ClosureRequirementStatusSchema>;

export const ClosureRequirementSchema = z.object({
	kind: ClosingEvidenceKindSchema,
	stepCode: CermontOperationalStepCodeSchema,
	label: z.string().min(1),
	status: ClosureRequirementStatusSchema,
	message: z.string().max(1000).optional(),
	documentId: z.string().optional(),
	documentUrl: z.string().url().optional(),
});

export type ClosureRequirement = z.infer<typeof ClosureRequirementSchema>;

// ── Schema Completo del Cierre Administrativo ───────────

/**
 * Full closure report record (response).
 * Covers all 14 steps of the CERMONT business flow.
 */
export const ClosureReportSchema = z.object({
	_id: z.string(),
	orderId: z.string(),
	// Campos originales (pasos 7-8)
	technicalObservations: z.string().max(3000).optional(),
	materialsUsed: z.array(MaterialItemSchema).default([]),
	actualHours: z.number().nonnegative().optional(),
	completionNotes: z.string().max(2000).optional(),
	// Paso 9 — Firma del acta
	acta: ActaSignatureSchema.optional(),
	// Pasos 10-11 — SES
	ses: SESTrackingSchema.optional(),
	// Pasos 12-13 — Factura
	invoice: InvoiceTrackingSchema.optional(),
	// Paso 14 — Pago
	payment: PaymentRecordSchema.optional(),
	requirements: z.array(ClosureRequirementSchema).default([]),
	completionPercentage: z.number().min(0).max(100).default(0),
	/** false si falta algún requisito administrativo crítico (pasos 8–14). */
	canCloseAdministratively: z.boolean().default(false),
	/** Tipos de evidencia/documento que bloquean el cierre definitivo. */
	missingClosureKinds: z.array(ClosingEvidenceKindSchema).default([]),
	// Auditoría
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime(),
	createdBy: z.string().optional(),
	updatedBy: z.string().optional(),
});

export type ClosureReport = z.infer<typeof ClosureReportSchema>;

/**
 * Create a new closure report
 */
export const CreateClosureReportSchema = ClosureReportSchema.omit({
	_id: true,
	createdAt: true,
	updatedAt: true,
});

export type CreateClosureReportInput = z.infer<typeof CreateClosureReportSchema>;

/**
 * Update only the acta signature (Paso 9)
 */
export const UpdateActaSignatureSchema = ActaSignatureSchema.partial();
export type UpdateActaSignatureInput = z.infer<typeof UpdateActaSignatureSchema>;

/**
 * Update only the SES tracking (Pasos 10-11)
 */
export const UpdateSESTrackingSchema = SESTrackingSchema.partial();
export type UpdateSESTrackingInput = z.infer<typeof UpdateSESTrackingSchema>;

/**
 * Update only the invoice tracking (Pasos 12-13)
 */
export const UpdateInvoiceTrackingSchema = InvoiceTrackingSchema.partial();
export type UpdateInvoiceTrackingInput = z.infer<typeof UpdateInvoiceTrackingSchema>;

/**
 * Update only the payment record (Paso 14)
 */
export const UpdatePaymentRecordSchema = PaymentRecordSchema.partial();
export type UpdatePaymentRecordInput = z.infer<typeof UpdatePaymentRecordSchema>;
