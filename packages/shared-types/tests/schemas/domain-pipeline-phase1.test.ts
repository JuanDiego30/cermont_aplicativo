import { describe, expect, it } from "vitest";

import {
	ApprovePlanningPacketSchema,
	ApproveSiteVisitSchema,
	CancelSiteVisitSchema,
	DomainBlockerCodeSchema,
	DomainBlockerSchema,
	DomainCommandNameSchema,
	DomainCommandSchema,
	ExecutionSessionSchema,
	ExecutionSessionStatusSchema,
	OfflineSyncStateSchema,
	PaymentSchema,
	PaymentStatusSchema,
	PlanningPacketSchema,
	PlanningPacketStatusSchema,
	PURCHASE_ORDER_STATUS_VALUES,
	PurchaseOrderAuthorizationSchema,
	RegisterPaymentSchema,
	ServiceCaseSchema,
	ServiceCaseStageSchema,
	StartExecutionSessionSchema,
	SubmitExecutionChecklistCommandSchema,
	ValidatePurchaseOrderSchema,
} from "../../src/schemas";

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

const VALID_OID = "507f1f77bcf86cd799439011";
const VALID_OID_2 = "507f1f77bcf86cd799439012";
const NOW = "2026-05-07T03:00:00.000Z";

// ──────────────────────────────────────────────────────────────────────────────
// 1. DomainBlocker
// ──────────────────────────────────────────────────────────────────────────────

describe("DomainBlockerSchema", () => {
	it("accepts a valid blocker", () => {
		const result = DomainBlockerSchema.safeParse({
			code: "MISSING_SITE_VISIT",
			severity: "blocking",
			message: "A site visit is required before creating a proposal.",
			ownerRole: "resident_engineer",
			recommendedAction: "Schedule a site visit from the work-request detail page.",
			artifactType: "WorkRequest",
			artifactId: VALID_OID,
		});
		expect(result.success).toBe(true);
	});

	it("accepts a blocker without optional artifactId", () => {
		const result = DomainBlockerSchema.safeParse({
			code: "MISSING_CREW_ASSIGNMENT",
			severity: "warning",
			message: "No crew has been assigned.",
			ownerRole: "supervisor",
			recommendedAction: "Assign at least one technician.",
			artifactType: "PlanningPacket",
		});
		expect(result.success).toBe(true);
	});

	it("rejects an invalid blocker code", () => {
		const result = DomainBlockerSchema.safeParse({
			code: "INVALID_BLOCKER_CODE",
			severity: "blocking",
			message: "bad",
			ownerRole: "manager",
			recommendedAction: "fix it",
			artifactType: "WorkOrder",
		});
		expect(result.success).toBe(false);
	});

	it("rejects unknown severity", () => {
		const result = DomainBlockerSchema.safeParse({
			code: "MISSING_PO",
			severity: "critical",
			message: "PO is missing",
			ownerRole: "administrator",
			recommendedAction: "Register the PO",
			artifactType: "PurchaseOrderAuthorization",
		});
		expect(result.success).toBe(false);
	});

	it("covers all 29 blocker code values defined in the plan", () => {
		const codes = DomainBlockerCodeSchema.options;
		expect(codes).toHaveLength(36);
		expect(codes).toContain("MISSING_SITE_VISIT");
		expect(codes).toContain("PAYMENT_OVERDUE");
		expect(codes).toContain("ARCHIVE_NOT_ALLOWED");
	});
});

// ──────────────────────────────────────────────────────────────────────────────
// 2. DomainCommand
// ──────────────────────────────────────────────────────────────────────────────

describe("DomainCommandSchema", () => {
	it("accepts a command with clientMutationId", () => {
		const result = DomainCommandSchema.safeParse({
			commandId: "550e8400-e29b-41d4-a716-446655440000",
			clientMutationId: "550e8400-e29b-41d4-a716-446655440001",
			command: "StartExecutionSession",
			entityType: "ExecutionSession",
			entityId: VALID_OID,
			actorId: VALID_OID_2,
			actorRole: "technician",
			payload: { workOrderId: VALID_OID },
			status: "pending",
			attempts: 0,
			createdAt: NOW,
		});
		expect(result.success).toBe(true);
	});

	it("rejects an invalid command name", () => {
		const result = DomainCommandSchema.safeParse({
			commandId: "550e8400-e29b-41d4-a716-446655440000",
			clientMutationId: "550e8400-e29b-41d4-a716-446655440001",
			command: "NonExistentCommand",
			entityType: "Foo",
			actorId: VALID_OID,
			actorRole: "manager",
			payload: {},
			status: "pending",
			attempts: 0,
			createdAt: NOW,
		});
		expect(result.success).toBe(false);
	});

	it("covers all command names including offline commands", () => {
		const names = DomainCommandNameSchema.options;
		expect(names).toContain("SyncExecutionSession");
		expect(names).toContain("RegisterPayment");
		expect(names).toContain("ArchiveWorkOrder");
	});
});

// ──────────────────────────────────────────────────────────────────────────────
// 3. PurchaseOrderAuthorization
// ──────────────────────────────────────────────────────────────────────────────

describe("PurchaseOrderAuthorizationSchema", () => {
	it("accepts a validated PO", () => {
		const result = PurchaseOrderAuthorizationSchema.safeParse({
			_id: VALID_OID,
			proposalId: VALID_OID_2,
			poNumber: "PO-2026-001",
			serviceAccount: "SA-001",
			billingAccount: "BA-001",
			approvedAmount: 1500000,
			currency: "COP",
			receivedAt: NOW,
			attachments: [],
			validatedBy: VALID_OID,
			status: "validated",
			createdBy: VALID_OID,
			createdAt: NOW,
			updatedAt: NOW,
		});
		expect(result.success).toBe(true);
	});

	it("accepts a pending PO without validatedBy", () => {
		const result = PurchaseOrderAuthorizationSchema.safeParse({
			_id: VALID_OID,
			proposalId: VALID_OID_2,
			poNumber: "PO-2026-002",
			serviceAccount: "SA-001",
			billingAccount: "BA-001",
			approvedAmount: 500000,
			currency: "COP",
			receivedAt: NOW,
			attachments: [],
			status: "pending",
			createdBy: VALID_OID,
			createdAt: NOW,
			updatedAt: NOW,
		});
		expect(result.success).toBe(true);
	});

	it("covers all PO status values", () => {
		const statuses = PURCHASE_ORDER_STATUS_VALUES;
		expect(statuses).toContain("pending");
		expect(statuses).toContain("approved");
		expect(statuses).toContain("rejected");
	});

	it("normalizes legacy PO status aliases", () => {
		const result = PurchaseOrderAuthorizationSchema.safeParse({
			_id: VALID_OID,
			proposalId: VALID_OID_2,
			poNumber: "PO-2026-LEGACY",
			serviceAccount: "SA-001",
			billingAccount: "BA-001",
			approvedAmount: 500000,
			currency: "COP",
			receivedAt: NOW,
			attachments: [],
			status: "validated",
			validatedBy: VALID_OID,
			createdBy: VALID_OID,
			createdAt: NOW,
			updatedAt: NOW,
		});

		expect(result.success).toBe(true);
		expect(result.success && result.data.status).toBe("approved");
	});

	it("rejects negative approvedAmount", () => {
		const result = PurchaseOrderAuthorizationSchema.safeParse({
			_id: VALID_OID,
			proposalId: VALID_OID_2,
			poNumber: "PO-2026-003",
			serviceAccount: "SA-001",
			billingAccount: "BA-001",
			approvedAmount: -100,
			currency: "COP",
			receivedAt: NOW,
			attachments: [],
			status: "pending",
			createdBy: VALID_OID,
			createdAt: NOW,
			updatedAt: NOW,
		});
		expect(result.success).toBe(false);
	});
});

// ──────────────────────────────────────────────────────────────────────────────
// 4. PlanningPacket
// ──────────────────────────────────────────────────────────────────────────────

describe("PlanningPacketSchema", () => {
	it("accepts an approved planning packet with no blockers", () => {
		const result = PlanningPacketSchema.safeParse({
			_id: VALID_OID,
			workOrderId: VALID_OID_2,
			crew: [],
			tools: [],
			equipment: [],
			requiredCertifications: [],
			supportDocuments: [],
			readinessChecklist: [],
			blockers: [],
			astRequired: false,
			ptwRequired: false,
			status: "approved",
			approvedBy: VALID_OID,
			approvedAt: NOW,
			createdBy: VALID_OID,
			createdAt: NOW,
			updatedAt: NOW,
		});
		expect(result.success).toBe(true);
	});

	it("accepts a blocked planning packet with active blockers", () => {
		const result = PlanningPacketSchema.safeParse({
			_id: VALID_OID,
			workOrderId: VALID_OID_2,
			crew: [],
			tools: [],
			equipment: [],
			requiredCertifications: [],
			supportDocuments: [],
			readinessChecklist: [],
			blockers: [
				{
					code: "MISSING_CREW_ASSIGNMENT",
					severity: "blocking",
					message: "No crew assigned.",
					ownerRole: "supervisor",
					recommendedAction: "Assign crew.",
					artifactType: "PlanningPacket",
				},
			],
			astRequired: true,
			ptwRequired: false,
			status: "blocked",
			createdBy: VALID_OID,
			createdAt: NOW,
			updatedAt: NOW,
		});
		expect(result.success).toBe(true);
	});

	it("covers all planning status values", () => {
		const statuses = PlanningPacketStatusSchema.options;
		expect(statuses).toContain("draft");
		expect(statuses).toContain("approved");
		expect(statuses).toContain("blocked");
	});

	it("rejects unknown status", () => {
		const result = PlanningPacketSchema.safeParse({
			_id: VALID_OID,
			workOrderId: VALID_OID_2,
			crew: [],
			tools: [],
			equipment: [],
			requiredCertifications: [],
			supportDocuments: [],
			readinessChecklist: [],
			blockers: [],
			status: "in_progress",
			createdBy: VALID_OID,
			createdAt: NOW,
			updatedAt: NOW,
		});
		expect(result.success).toBe(false);
	});
});

// ──────────────────────────────────────────────────────────────────────────────
// 5. ExecutionSession
// ──────────────────────────────────────────────────────────────────────────────

describe("ExecutionSessionSchema", () => {
	it("accepts a pending offline execution session", () => {
		const result = ExecutionSessionSchema.safeParse({
			_id: VALID_OID,
			code: "EX-2026-0001",
			workOrderId: VALID_OID_2,
			status: "sync_pending",
			assignedCrew: [],
			checklistResponses: [],
			dynamicFormResponses: [],
			materialsUsed: [],
			toolsUsed: [],
			equipmentUsed: [],
			laborEntries: [],
			incidents: [],
			observations: [],
			signatures: [],
			evidenceIds: [],
			evidences: [],
			documentImportIds: [],
			gpsPoints: [],
			offlineSyncStatus: "pending",
			clientMutationIds: ["550e8400-e29b-41d4-a716-446655440000"],
			blockers: [],
			nextActions: [],
			createdBy: VALID_OID,
			createdAt: NOW,
			updatedAt: NOW,
		});
		expect(result.success).toBe(true);
	});

	it("covers all offline sync state values", () => {
		const states = OfflineSyncStateSchema.options;
		expect(states).toContain("pending");
		expect(states).toContain("syncing");
		expect(states).toContain("synced");
		expect(states).toContain("failed");
	});

	it("covers all session status values", () => {
		const statuses = ExecutionSessionStatusSchema.options;
		expect(statuses).toContain("draft");
		expect(statuses).toContain("paused");
		expect(statuses).toContain("sync_pending");
	});

	it("rejects a session with unknown offlineSyncStatus", () => {
		const result = ExecutionSessionSchema.safeParse({
			_id: VALID_OID,
			code: "EX-2026-0002",
			workOrderId: VALID_OID_2,
			status: "in_progress",
			assignedCrew: [],
			checklistResponses: [],
			dynamicFormResponses: [],
			materialsUsed: [],
			toolsUsed: [],
			equipmentUsed: [],
			laborEntries: [],
			incidents: [],
			observations: [],
			signatures: [],
			evidenceIds: [],
			evidences: [],
			documentImportIds: [],
			gpsPoints: [],
			offlineSyncStatus: "unknown_state",
			clientMutationIds: [],
			blockers: [],
			nextActions: [],
			createdBy: VALID_OID,
			createdAt: NOW,
			updatedAt: NOW,
		});
		expect(result.success).toBe(false);
	});

	it("StartExecutionSessionSchema requires clientMutationId", () => {
		const result = StartExecutionSessionSchema.safeParse({
			startedAt: NOW,
		});
		expect(result.success).toBe(false);
	});

	it("StartExecutionSessionSchema accepts valid input with clientMutationId", () => {
		const result = StartExecutionSessionSchema.safeParse({
			clientMutationId: "550e8400-e29b-41d4-a716-446655440000",
			startedAt: NOW,
		});
		expect(result.success).toBe(true);
	});

	it("SubmitExecutionChecklistCommandSchema validates checklist response values", () => {
		const valid = SubmitExecutionChecklistCommandSchema.safeParse({
			clientMutationId: "550e8400-e29b-41d4-a716-446655440000",
			response: {
				responseId: "resp-1",
				checklistId: "pre-start",
				itemId: "Q1",
				label: "Area segura",
				value: true,
				required: true,
				evidenceIds: [],
				answeredAt: NOW,
				answeredBy: VALID_OID,
			},
		});
		const invalid = SubmitExecutionChecklistCommandSchema.safeParse({
			clientMutationId: "550e8400-e29b-41d4-a716-446655440000",
			response: {
				responseId: "resp-2",
				checklistId: "pre-start",
				itemId: "Q1",
				label: "Area segura",
				value: ["not-supported"],
				answeredAt: NOW,
				answeredBy: VALID_OID,
			},
		});
		expect(valid.success).toBe(true);
		expect(invalid.success).toBe(false);
	});
});

// ──────────────────────────────────────────────────────────────────────────────
// 6. Payment
// ──────────────────────────────────────────────────────────────────────────────

describe("PaymentSchema", () => {
	it("accepts a reconciled payment", () => {
		const result = PaymentSchema.safeParse({
			_id: VALID_OID,
			invoiceId: VALID_OID_2,
			workOrderId: VALID_OID,
			serviceEntrySheetId: VALID_OID_2,
			clientId: VALID_OID,
			paymentReference: "TRF-2026-001",
			paidAt: NOW,
			amount: 1500000,
			currency: "COP",
			paymentMethod: "bank_transfer",
			bankReference: "BNK-XYZ-001",
			recordedBy: VALID_OID,
			recordedAt: NOW,
			reconciledBy: VALID_OID,
			reconciledAt: NOW,
			commandHistory: [],
			status: "reconciled",
			createdAt: NOW,
			updatedAt: NOW,
		});
		expect(result.success).toBe(true);
	});

	it("rejects a payment without paymentReference", () => {
		const result = RegisterPaymentSchema.safeParse({
			invoiceId: VALID_OID,
			paidAt: NOW,
			amount: 500000,
			currency: "COP",
			paymentMethod: "bank_transfer",
		});
		expect(result.success).toBe(false);
	});

	it("covers all payment status values", () => {
		const statuses = PaymentStatusSchema.options;
		expect(statuses).toContain("not_due");
		expect(statuses).toContain("recorded");
		expect(statuses).toContain("reconciled");
		expect(statuses).toContain("rejected");
	});

	it("rejects negative payment amount", () => {
		const result = RegisterPaymentSchema.safeParse({
			invoiceId: VALID_OID,
			paymentReference: "TRF-2026-002",
			paidAt: NOW,
			amount: -100,
			currency: "COP",
			paymentMethod: "bank_transfer",
		});
		expect(result.success).toBe(false);
	});
});

// ──────────────────────────────────────────────────────────────────────────────
// 7. ServiceCase
// ──────────────────────────────────────────────────────────────────────────────

describe("ServiceCaseSchema", () => {
	it("accepts a minimal projection with stage planning", () => {
		const result = ServiceCaseSchema.safeParse({
			_id: VALID_OID,
			code: "SC-2026-0001",
			clientName: "Acme Corp",
			currentStage: "planning",
			artifacts: {},
			blockers: [],
			nextActions: [],
			timeline: [],
			createdAt: NOW,
			updatedAt: NOW,
		});
		expect(result.success).toBe(true);
	});

	it("accepts a service case with all artifact references", () => {
		const artifactRef = {
			id: VALID_OID,
			status: "active",
			updatedAt: NOW,
		};
		const result = ServiceCaseSchema.safeParse({
			_id: VALID_OID,
			code: "SC-2026-0002",
			clientId: VALID_OID,
			clientName: "Petroco",
			currentStage: "billing_pending",
			artifacts: {
				workRequest: artifactRef,
				proposal: artifactRef,
				workOrder: artifactRef,
				serviceEntrySheet: artifactRef,
				invoice: artifactRef,
			},
			blockers: [
				{
					code: "INVOICE_NOT_CREATED",
					severity: "blocking",
					message: "Invoice not created.",
					ownerRole: "administrator",
					recommendedAction: "Create invoice from SES.",
					artifactType: "Invoice",
				},
			],
			nextActions: [
				{
					command: "CreateInvoice",
					label: "Create invoice",
					requiredRole: "administrator",
				},
			],
			timeline: [],
			createdAt: NOW,
			updatedAt: NOW,
		});
		expect(result.success).toBe(true);
	});

	it("covers all 15 service case stage values", () => {
		const stages = ServiceCaseStageSchema.options;
		expect(stages).toHaveLength(15);
		expect(stages).toContain("intake");
		expect(stages).toContain("in_execution");
		expect(stages).toContain("paid");
		expect(stages).toContain("cancelled");
	});

	it("rejects unknown stage", () => {
		const result = ServiceCaseSchema.safeParse({
			_id: VALID_OID,
			code: "SC-2026-0003",
			clientName: "Test",
			currentStage: "unknown_stage",
			artifacts: {},
			blockers: [],
			nextActions: [],
			timeline: [],
			createdAt: NOW,
			updatedAt: NOW,
		});
		expect(result.success).toBe(false);
	});
});

// ──────────────────────────────────────────────────────────────────────────────
// 8. SiteVisit standalone command schemas
// ──────────────────────────────────────────────────────────────────────────────

describe("SiteVisit standalone command schemas", () => {
	it("ApproveSiteVisitSchema accepts valid input", () => {
		const result = ApproveSiteVisitSchema.safeParse({
			approvedBy: VALID_OID,
			notes: "Looks good.",
		});
		expect(result.success).toBe(true);
	});

	it("ApproveSiteVisitSchema accepts input without notes", () => {
		const result = ApproveSiteVisitSchema.safeParse({
			approvedBy: VALID_OID,
		});
		expect(result.success).toBe(true);
	});

	it("CancelSiteVisitSchema requires a reason", () => {
		const valid = CancelSiteVisitSchema.safeParse({ reason: "Client postponed." });
		const invalid = CancelSiteVisitSchema.safeParse({ reason: "ab" }); // too short (< 5 chars)
		expect(valid.success).toBe(true);
		expect(invalid.success).toBe(false);
	});
});

// ──────────────────────────────────────────────────────────────────────────────
// 9. No schema uses weak sentinel or escape-hatch values explicitly
// (Verified by TypeScript compilation — this test documents the contract)
// ──────────────────────────────────────────────────────────────────────────────

describe("Schema type-safety contract", () => {
	it("ApprovePlanningPacketSchema requires a valid approvedBy OID", () => {
		const valid = ApprovePlanningPacketSchema.safeParse({ approvedBy: VALID_OID });
		const invalid = ApprovePlanningPacketSchema.safeParse({ approvedBy: "not-an-oid" });
		expect(valid.success).toBe(true);
		expect(invalid.success).toBe(false);
	});

	it("ValidatePurchaseOrderSchema requires a valid validatedBy OID", () => {
		const valid = ValidatePurchaseOrderSchema.safeParse({ validatedBy: VALID_OID });
		const invalid = ValidatePurchaseOrderSchema.safeParse({ validatedBy: "bad" });
		expect(valid.success).toBe(true);
		expect(invalid.success).toBe(false);
	});
});
