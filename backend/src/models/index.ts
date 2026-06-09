// ═══════════════════════════════════════════════════════════════════════════════
// Models Barrel Export — Per DOC-09 §7
//
// ALIGNMENT WITH @cermont/shared-types:
// Each model file contains its own alignment comment block.
// See individual model files (Order.ts, User.ts, Cost.ts, etc.) for field mapping.
//
// NOTE: This barrel re-exports all Mongoose models. For field-level alignment
// documentation, refer to each model's source file.
// ═══════════════════════════════════════════════════════════════════════════════

// Barrel export for all Mongoose models
// Centralizes model imports across the backend
//
// STRUCTURE:
// - Public models (shared contracts): User, Order, Evidence, Proposal, etc.
// - Backend-only models: AuditLog, TokenBlacklist (in apps/backend/src/schemas/)
// - Constants: USER_ROLES (SSOT for roles per DOC-04)

// Backend-only models (not exported to frontend)
// @see DOC-09 Section Colecciones Solo-Backend
export { AuditLog } from "./AuditLog";
export { Checklist } from "./Checklist";
export { Cost } from "./Cost";
// Optional: Legacy models (kept for compatibility but may be deprecated)
export { CostControl } from "./CostControl";
export { Counter } from "./Counter";
export { DeliveryRecord, type DeliveryRecordDocument } from "./DeliveryRecord";
export { Document } from "./Document";
export {
	DocumentAttachment,
	type IDocumentAttachmentDocument,
} from "./DocumentAttachment";
export {
	DocumentExtractionJob,
	type IDocumentExtractionJobDocument,
} from "./DocumentExtractionJob";
export { DocumentTemplate, type IDocumentTemplateDocument } from "./DocumentTemplate";
export {
	DocumentTemplateVersion,
	type IDocumentTemplateVersionDocument,
} from "./DocumentTemplateVersion";
export { DynamicFormTemplate, type DynamicFormTemplateDocument } from "./DynamicFormTemplate";
export { Evidence } from "./Evidence";
export { EvidenceCollection, type IEvidenceCollectionDocument } from "./EvidenceCollection";
export { ExecutionSession, type ExecutionSessionDocument } from "./ExecutionSession";
export { FileAsset, type IFileAssetDocument } from "./FileAsset";
export { FormSubmission, type FormSubmissionDocument } from "./FormSubmission";
export { IdempotencyEntry, type IdempotencyEntryDocument } from "./IdempotencyEntry";
export { Inspection } from "./Inspection";
export { Invoice, type InvoiceDocument } from "./Invoice";
export { type IKitDocument, Kit } from "./Kit";
export { MaintenanceKit } from "./MaintenanceKit";
export { type INotification, Notification } from "./Notification";
export { Order } from "./Order";
export { Payment, type PaymentDocument } from "./Payment";
export { PlanningPacket } from "./PlanningPacket";
export { Proposal } from "./Proposal";
export { Report } from "./Report";
export { Resource } from "./Resource";
export { ServiceCase } from "./ServiceCase";
export { ServiceEntrySheet, type ServiceEntrySheetDocument } from "./ServiceEntrySheet";
export { TechnicalReport, type TechnicalReportDocument } from "./TechnicalReport";
export { type ITemplateDraftDocument, TemplateDraft } from "./TemplateDraft";
export { type ITemplateResponseDocument, TemplateResponse } from "./TemplateResponse";
export { TokenBlacklist } from "./TokenBlacklist";
export { type IToolDocument, Tool } from "./Tool";
export { type Role, USER_ROLES, User } from "./User";
export { WorkReport } from "./WorkReport";
export { WorkRequest } from "./WorkRequest";
