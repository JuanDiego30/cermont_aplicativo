import { describe, expect, it } from "vitest";
import {
	CERMONT_OPERATIONAL_STEPS,
	CermontOperationalStepCodeSchema,
	normalizeCermontOperationalStepCode,
} from "../../src/schemas/cermont-operational-step.schema";
import { ClosureReportSchema } from "../../src/schemas/closureReport.schema";

describe("Cermont Operational Step Schema", () => {
	it("should have exactly 14 steps", () => {
		expect(CERMONT_OPERATIONAL_STEPS.length).toBe(14);
	});

	it("should have sequential step numbers from 1 to 14", () => {
		const numbers = CERMONT_OPERATIONAL_STEPS.map((s) => s.stepNumber);
		expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
	});

	it("should have unique codes for all steps", () => {
		const codes = CERMONT_OPERATIONAL_STEPS.map((s) => s.code);
		const uniqueCodes = new Set(codes);
		expect(uniqueCodes.size).toBe(14);
	});

	it("should have allowed roles in Spanish for all steps", () => {
		const VALID_ROLES = [
			"gerente",
			"residente",
			"hes",
			"supervisor",
			"operador",
			"tecnico",
			"administrativo",
			"cliente",
		];

		for (const step of CERMONT_OPERATIONAL_STEPS) {
			for (const role of step.allowedRoles) {
				expect(VALID_ROLES).toContain(role);
			}
		}
	});

	it("uses evidence as step 7 and keeps technical delivery artifacts in steps 8 to 10", () => {
		const step7 = CERMONT_OPERATIONAL_STEPS.find((s) => s.stepNumber === 7);
		const step8 = CERMONT_OPERATIONAL_STEPS.find((s) => s.stepNumber === 8);
		const step9 = CERMONT_OPERATIONAL_STEPS.find((s) => s.stepNumber === 9);
		const step10 = CERMONT_OPERATIONAL_STEPS.find((s) => s.stepNumber === 10);

		expect(step7?.code).toBe("step_07_evidence");
		expect(step8?.code).toBe("step_08_technical_report");
		expect(step9?.code).toBe("step_09_delivery_record");
		expect(step10?.code).toBe("step_10_client_signature");
	});

	it("represents SES / Ariba as one operational step", () => {
		const step11 = CERMONT_OPERATIONAL_STEPS.find((s) => s.stepNumber === 11);

		expect(step11?.code).toBe("step_11_ses");
		expect(step11?.label).toBe("SES / Ariba");
	});

	it("should have independent steps for invoice submission and approval (12 and 13)", () => {
		const step12 = CERMONT_OPERATIONAL_STEPS.find((s) => s.stepNumber === 12);
		const step13 = CERMONT_OPERATIONAL_STEPS.find((s) => s.stepNumber === 13);

		expect(step12?.code).toBe("step_12_invoice");
		expect(step13?.code).toBe("step_13_invoice_approval");
	});

	it("should keep execution controls on step 6 and evidence capture on step 7", () => {
		const step6 = CERMONT_OPERATIONAL_STEPS.find((s) => s.code === "step_06_execution");
		const step7 = CERMONT_OPERATIONAL_STEPS.find((s) => s.code === "step_07_evidence");
		expect(step6?.blocksTransition).toBe(true);
		expect(step6?.requiredSignatures).toEqual(
			expect.arrayContaining(["firma_tecnico", "firma_supervisor"]),
		);
		expect(step6?.requiredForms).toContain("execution_dynamic_form");
		expect(step7?.requiredEvidences).toEqual(
			expect.arrayContaining(["during_photos", "after_photos"]),
		);
	});

	it("should have step 14 as the terminal payment step", () => {
		const step14 = CERMONT_OPERATIONAL_STEPS.find((s) => s.stepNumber === 14);
		expect(step14?.code).toBe("step_14_payment");
		expect(step14?.phase).toBe("administrative");
	});

	it("should parse ClosureReport with administrative closure readiness fields", () => {
		const result = ClosureReportSchema.safeParse({
			_id: "507f1f77bcf86cd799439011",
			orderId: "507f1f77bcf86cd799439012",
			requirements: [],
			completionPercentage: 0,
			canCloseAdministratively: false,
			missingClosureKinds: ["acta_delivery"],
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		});
		expect(result.success).toBe(true);
	});

	it("should validate a valid step code", () => {
		const result = CermontOperationalStepCodeSchema.safeParse("step_01_work_request");
		expect(result.success).toBe(true);
	});

	it("normalizes a legacy persisted code at the contract boundary", () => {
		expect(CermontOperationalStepCodeSchema.parse("step_08_delivery_record")).toBe(
			"step_09_delivery_record",
		);
		expect(normalizeCermontOperationalStepCode("step_11_ses_approval")).toEqual({
			status: "legacy_alias",
			legacyCode: "step_11_ses_approval",
			code: "step_11_ses",
		});
	});

	it("normalizes codes emitted by the former domain SSOT", () => {
		expect(CermontOperationalStepCodeSchema.parse("step_10_ses")).toBe("step_11_ses");
		expect(CermontOperationalStepCodeSchema.parse("STEP_14_CLOSURE")).toBe("step_14_payment");
	});

	it("should reject an invalid step code", () => {
		const result = CermontOperationalStepCodeSchema.safeParse("invalid_step");
		expect(result.success).toBe(false);
	});
});
