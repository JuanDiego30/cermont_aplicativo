import { describe, expect, it } from "vitest";
import {
	CanonicalCaseDataSchema,
	FieldOverrideSchema,
	InheritedFieldSchema,
	PreviousStepEntitySchema,
	ServiceCaseStepContextSchema,
	StepContextQuerySchema,
} from "../../src/schemas/service-case-step-context.schema";

const VALID_OBJECT_ID = "507f1f77bcf86cd799439011";

describe("InheritedFieldSchema", () => {
	it("should parse a valid inherited field", () => {
		const result = InheritedFieldSchema.safeParse({
			key: "clientName",
			label: "Nombre del cliente",
			value: "Cliente Ejemplo S.A.S.",
			sourceStepCode: "step_01_work_request",
			sourceEntityId: VALID_OBJECT_ID,
			sourceStepLabel: "Solicitud de servicio",
			editable: true,
			required: true,
		});
		expect(result.success).toBe(true);
	});

	it("should reject inherited field without sourceStepCode", () => {
		const result = InheritedFieldSchema.safeParse({
			key: "clientName",
			label: "Nombre del cliente",
			value: "Cliente Ejemplo S.A.S.",
			sourceEntityId: VALID_OBJECT_ID,
			sourceStepLabel: "Solicitud de servicio",
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues.some((i) => i.path.includes("sourceStepCode"))).toBe(true);
		}
	});

	it("should reject inherited field with invalid stepCode", () => {
		const result = InheritedFieldSchema.safeParse({
			key: "clientName",
			label: "Nombre del cliente",
			value: "Cliente Ejemplo S.A.S.",
			sourceStepCode: "step_99_invalid",
			sourceEntityId: VALID_OBJECT_ID,
			sourceStepLabel: "Test",
		});
		expect(result.success).toBe(false);
	});

	it("should have default empty string for value", () => {
		const result = InheritedFieldSchema.safeParse({
			key: "clientName",
			label: "Nombre del cliente",
			sourceStepCode: "step_01_work_request",
			sourceEntityId: VALID_OBJECT_ID,
			sourceStepLabel: "Solicitud de servicio",
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.value).toBe("");
		}
	});

	it("should default editable to false and required to false", () => {
		const result = InheritedFieldSchema.safeParse({
			key: "clientName",
			label: "Nombre del cliente",
			value: "Test",
			sourceStepCode: "step_01_work_request",
			sourceEntityId: VALID_OBJECT_ID,
			sourceStepLabel: "Test",
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.editable).toBe(false);
			expect(result.data.required).toBe(false);
		}
	});
});

describe("FieldOverrideSchema", () => {
	it("should parse a valid field override", () => {
		const result = FieldOverrideSchema.safeParse({
			key: "location",
			label: "Ubicación",
			inheritedValue: "Campo A",
			overrideValue: "Campo B",
			reason: "Cliente corrigió ubicación durante visita técnica",
			changedBy: VALID_OBJECT_ID,
			changedAt: "2026-06-08T12:00:00.000Z",
		});
		expect(result.success).toBe(true);
	});

	it("should reject override without reason", () => {
		const result = FieldOverrideSchema.safeParse({
			key: "location",
			label: "Ubicación",
			inheritedValue: "Campo A",
			overrideValue: "Campo B",
			changedBy: VALID_OBJECT_ID,
			changedAt: "2026-06-08T12:00:00.000Z",
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues.some((i) => i.path.includes("reason"))).toBe(true);
		}
	});

	it("should reject override with empty reason", () => {
		const result = FieldOverrideSchema.safeParse({
			key: "location",
			label: "Ubicación",
			inheritedValue: "Campo A",
			overrideValue: "Campo B",
			reason: "",
			changedBy: VALID_OBJECT_ID,
			changedAt: "2026-06-08T12:00:00.000Z",
		});
		expect(result.success).toBe(false);
	});
});

describe("CanonicalCaseDataSchema", () => {
	it("should parse complete canonical data", () => {
		const result = CanonicalCaseDataSchema.safeParse({
			clientId: VALID_OBJECT_ID,
			clientName: "Cliente Ejemplo S.A.S.",
			contactName: "Juan Pérez",
			contactPhone: "+57 300 123 4567",
			contactEmail: "juan@ejemplo.com",
			location: "Bogotá, Colombia",
			priority: "high",
			generalScope: "Mantenimiento preventivo de equipos",
		});
		expect(result.success).toBe(true);
	});

	it("should allow empty canonical data (all fields optional)", () => {
		const result = CanonicalCaseDataSchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it("should reject extra fields not in schema", () => {
		const result = CanonicalCaseDataSchema.safeParse({
			clientName: "Test",
			unknownField: "should not be here",
		});
		expect(result.success).toBe(false);
	});
});

describe("PreviousStepEntitySchema", () => {
	it("should parse a valid previous step entity", () => {
		const result = PreviousStepEntitySchema.safeParse({
			stepCode: "step_01_work_request",
			entityId: VALID_OBJECT_ID,
			entityType: "workRequest",
			status: "completed",
		});
		expect(result.success).toBe(true);
	});

	it("should reject without entityId", () => {
		const result = PreviousStepEntitySchema.safeParse({
			stepCode: "step_01_work_request",
			entityType: "workRequest",
			status: "completed",
		});
		expect(result.success).toBe(false);
	});
});

describe("ServiceCaseStepContextSchema", () => {
	it("should parse a valid step context", () => {
		const result = ServiceCaseStepContextSchema.safeParse({
			serviceCaseId: VALID_OBJECT_ID,
			currentStepCode: "step_02_site_visit",
			currentStepLabel: "Visita técnica",
			canonical: {
				clientName: "Cliente Ejemplo S.A.S.",
				location: "Bogotá",
			},
			inheritedFields: [
				{
					key: "clientName",
					label: "Nombre del cliente",
					value: "Cliente Ejemplo S.A.S.",
					sourceStepCode: "step_01_work_request",
					sourceEntityId: VALID_OBJECT_ID,
					sourceStepLabel: "Solicitud de servicio",
				},
			],
			linkedEntityIds: {
				workRequestId: VALID_OBJECT_ID,
			},
			generatedAt: "2026-06-08T12:00:00.000Z",
		});
		expect(result.success).toBe(true);
	});

	it("should reject context with invalid stepCode", () => {
		const result = ServiceCaseStepContextSchema.safeParse({
			serviceCaseId: VALID_OBJECT_ID,
			currentStepCode: "step_99_invalid",
			currentStepLabel: "Test",
			canonical: {},
			generatedAt: "2026-06-08T12:00:00.000Z",
		});
		expect(result.success).toBe(false);
	});

	it("should have defaults for arrays and object", () => {
		const result = ServiceCaseStepContextSchema.safeParse({
			serviceCaseId: VALID_OBJECT_ID,
			currentStepCode: "step_01_work_request",
			currentStepLabel: "Solicitud de servicio",
			canonical: {},
			generatedAt: "2026-06-08T12:00:00.000Z",
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.inheritedFields).toEqual([]);
			expect(result.data.overrides).toEqual([]);
			expect(result.data.blockers).toEqual([]);
			expect(result.data.allowedActions).toEqual([]);
			expect(result.data.requiredFields).toEqual([]);
			expect(result.data.linkedEntityIds).toEqual({});
		}
	});
});

describe("StepContextQuerySchema", () => {
	it("should parse a valid step code query", () => {
		const result = StepContextQuerySchema.safeParse({ stepCode: "step_02_site_visit" });
		expect(result.success).toBe(true);
	});

	it("should reject empty query", () => {
		const result = StepContextQuerySchema.safeParse({});
		expect(result.success).toBe(false);
	});

	it("should reject invalid step code", () => {
		const result = StepContextQuerySchema.safeParse({ stepCode: "invalid" });
		expect(result.success).toBe(false);
	});
});
