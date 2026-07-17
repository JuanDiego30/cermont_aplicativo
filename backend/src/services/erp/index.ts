/**
 * ERP Services Index
 */

export { FSSMAdapter } from "./adapters/fssm.adapter";
export { GMAOCSMAdapter } from "./adapters/gmao-csm.adapter";
export { ErpAdapter } from "./erp-adapter.service";
export type { ErpOperationResult, ErpProviderAdapter } from "./erp-core-engine";
export { ERPCoreEngine, erpEngine } from "./erp-core-engine";
export type { FieldMapping, ProviderFieldMappings } from "./erp-field-mapping.service";
export { FieldMappingService } from "./erp-field-mapping.service";
export type {
	ErpInvoicePayload,
	ErpPaymentResult,
	ErpSendResult,
	ErpSesPayload,
	ErpStatusResult,
	IERPService,
} from "./ports";
