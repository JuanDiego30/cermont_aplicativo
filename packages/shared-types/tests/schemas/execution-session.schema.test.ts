import { describe, expect, it } from "vitest";
import {
	ExecutionOfflineCommandSchema,
	ExecutionSessionSchema,
	OrderStatusSchema,
	ResolveExecutionIncidentCommandSchema,
} from "../../src";

const objectId = "507f1f77bcf86cd799439011";
const isoDate = "2026-05-14T00:00:00.000Z";
const mutationId = "4d0ca85d-fcc7-4021-9ec6-c1be6090f9ad";

describe("execution session contracts", () => {
	it("includes execution statuses in the order lifecycle", () => {
		expect(OrderStatusSchema.options).toContain("ready_for_execution");
		expect(OrderStatusSchema.options).toContain("execution_in_progress");
		expect(OrderStatusSchema.options).toContain("execution_completed");
	});

	it("parses a completed execution session with field artifacts", () => {
		const parsed = ExecutionSessionSchema.parse({
			_id: objectId,
			code: "EX-2026-0001",
			workOrderId: objectId,
			status: "completed",
			startedAt: isoDate,
			completedAt: isoDate,
			assignedCrew: [objectId],
			checklistResponses: [],
			dynamicFormResponses: [],
			materialsUsed: [
				{
					usageId: "mat-1",
					name: "Cable acerado",
					quantityPlanned: 0,
					quantityUsed: 2,
					unit: "und",
					recordedAt: isoDate,
					recordedBy: objectId,
				},
			],
			toolsUsed: [],
			equipmentUsed: [],
			laborEntries: [
				{
					laborEntryId: "lab-1",
					userId: objectId,
					role: "tecnico",
					startedAt: isoDate,
					endedAt: isoDate,
					durationMinutes: 60,
					description: "Trabajo de campo",
				},
			],
			incidents: [],
			observations: [],
			signatures: [],
			evidenceIds: [objectId],
			evidences: [],
			documentImportIds: [],
			gpsPoints: [],
			offlineSyncStatus: "synced",
			clientMutationIds: [mutationId],
			blockers: [],
			nextActions: [{ code: "generate_technical_report", label: "Generar informe tecnico" }],
			createdBy: objectId,
			createdAt: isoDate,
			updatedAt: isoDate,
		});

		expect(parsed.status).toBe("completed");
		expect(parsed.materialsUsed[0]?.quantityUsed).toBe(2);
		expect(parsed.nextActions[0]?.code).toBe("generate_technical_report");
	});

	it("accepts resolve_incident as an offline idempotent command", () => {
		const parsed = ExecutionOfflineCommandSchema.parse({
			clientMutationId: mutationId,
			commandType: "resolve_incident",
			incidentId: "inc-1",
			actionTaken: "Se corrigio la desviacion tecnica en campo.",
		});
		const direct = ResolveExecutionIncidentCommandSchema.parse({
			clientMutationId: mutationId,
			incidentId: "inc-1",
			actionTaken: "Se corrigio la desviacion tecnica en campo.",
		});

		expect(parsed.commandType).toBe("resolve_incident");
		expect(direct.commandType).toBe("resolve_incident");
	});
});
