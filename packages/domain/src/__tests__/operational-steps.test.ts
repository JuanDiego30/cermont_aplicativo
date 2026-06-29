import { describe, expect, it } from "vitest";
import {
	CANONICAL_CODES,
	getNextStep,
	getStep,
	isValidStepKey,
	OPERATIONAL_STEPS,
	STEP_KEYS,
} from "../operational-steps";

describe("OPERATIONAL_STEPS", () => {
	it("should have exactly 14 steps", () => {
		expect(OPERATIONAL_STEPS).toHaveLength(14);
	});

	it("should have sequential step numbers 1-14", () => {
		const numbers = OPERATIONAL_STEPS.map((s) => s.stepNumber);
		expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
	});

	it("each step should have required fields", () => {
		for (const step of OPERATIONAL_STEPS) {
			expect(step.key).toBeTruthy();
			expect(step.canonicalCode).toMatch(/^STEP_\d{2}_[A-Z_]+$/);
			expect(step.label).toBeTruthy();
			expect(step.entityName).toBeTruthy();
			expect(typeof step.requiresEvidence).toBe("boolean");
			expect(typeof step.requiresDocuments).toBe("boolean");
			expect(Array.isArray(step.preconditions)).toBe(true);
			expect(Array.isArray(step.nextActions)).toBe(true);
			expect(Array.isArray(step.allowedRoles)).toBe(true);
		}
	});

	it("step keys should be unique", () => {
		const keys = OPERATIONAL_STEPS.map((s) => s.key);
		expect(new Set(keys).size).toBe(keys.length);
	});

	it("canonical codes should be unique", () => {
		const codes = OPERATIONAL_STEPS.map((s) => s.canonicalCode);
		expect(new Set(codes).size).toBe(codes.length);
	});

	it("CANONICAL_CODES should export all codes", () => {
		expect(CANONICAL_CODES).toHaveLength(14);
		expect(CANONICAL_CODES).toEqual([
			"STEP_01_WORK_REQUEST",
			"STEP_02_SITE_VISIT",
			"STEP_03_PROPOSAL",
			"STEP_04_PURCHASE_ORDER",
			"STEP_05_PLANNING",
			"STEP_06_EXECUTION",
			"STEP_07_TECHNICAL_REPORT",
			"STEP_08_DELIVERY_RECORD",
			"STEP_09_CLIENT_SIGNATURE",
			"STEP_10_SES",
			"STEP_11_INVOICE",
			"STEP_12_INVOICE_APPROVAL",
			"STEP_13_PAYMENT",
			"STEP_14_CLOSURE",
		]);
	});

	it("STEP_KEYS should export all keys in order", () => {
		expect(STEP_KEYS).toHaveLength(14);
		expect(STEP_KEYS).toEqual([
			"work_request",
			"site_visit",
			"proposal",
			"purchase_order",
			"planning",
			"execution",
			"technical_report",
			"delivery_record",
			"client_signature",
			"ses",
			"invoice",
			"invoice_approval",
			"payment",
			"closure",
		]);
	});

	it("each step's preconditions should be valid step keys", () => {
		for (const step of OPERATIONAL_STEPS) {
			for (const precond of step.preconditions) {
				expect(STEP_KEYS).toContain(precond);
			}
		}
	});

	it("each step's nextActions should be valid step keys", () => {
		for (const step of OPERATIONAL_STEPS) {
			for (const action of step.nextActions) {
				expect(STEP_KEYS).toContain(action);
			}
		}
	});

	it("closure step should have no next actions", () => {
		const closure = OPERATIONAL_STEPS[13];
		expect(closure.key).toBe("closure");
		expect(closure.nextActions).toEqual([]);
	});

	it("work_request step should have no preconditions", () => {
		const first = OPERATIONAL_STEPS[0];
		expect(first.key).toBe("work_request");
		expect(first.preconditions).toEqual([]);
	});
});

describe("getStep", () => {
	it("should return step by key", () => {
		const step = getStep("site_visit");
		expect(step).toBeDefined();
		expect(step?.key).toBe("site_visit");
		expect(step?.canonicalCode).toBe("STEP_02_SITE_VISIT");
	});

	it("should return undefined for unknown key", () => {
		expect(getStep("nonexistent")).toBeUndefined();
	});
});

describe("getNextStep", () => {
	it("should return next step in sequence", () => {
		const next = getNextStep("work_request");
		expect(next?.key).toBe("site_visit");
	});

	it("should return undefined for last step", () => {
		const next = getNextStep("closure");
		expect(next).toBeUndefined();
	});

	it("should chain through all steps correctly", () => {
		const chain: string[] = [];
		let currentKey: string | undefined = "work_request";
		while (currentKey) {
			chain.push(currentKey);
			currentKey = getNextStep(currentKey)?.key;
		}
		expect(chain).toEqual(STEP_KEYS);
	});
});

describe("isValidStepKey", () => {
	it("should return true for valid keys", () => {
		expect(isValidStepKey("work_request")).toBe(true);
		expect(isValidStepKey("closure")).toBe(true);
	});

	it("should return false for invalid keys", () => {
		expect(isValidStepKey("invalid")).toBe(false);
		expect(isValidStepKey("")).toBe(false);
	});
});
