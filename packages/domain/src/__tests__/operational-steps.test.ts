import { describe, expect, it } from "vitest";
import {
	CANONICAL_CODES,
	getNextStep,
	getOperationalStepCodeAliases,
	getStep,
	isValidStepKey,
	normalizeOperationalStepCode,
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
			expect(step.canonicalCode).toMatch(/^step_\d{2}_[a-z_]+$/);
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
			"step_01_work_request",
			"step_02_site_visit",
			"step_03_proposal",
			"step_04_purchase_order",
			"step_05_planning",
			"step_06_execution",
			"step_07_evidence",
			"step_08_technical_report",
			"step_09_delivery_record",
			"step_10_client_signature",
			"step_11_ses",
			"step_12_invoice",
			"step_13_invoice_approval",
			"step_14_payment",
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
			"evidence",
			"technical_report",
			"delivery_record",
			"client_signature",
			"ses",
			"invoice",
			"invoice_approval",
			"payment",
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

	it("payment step should be last with no next actions", () => {
		const last = OPERATIONAL_STEPS[13];
		expect(last.key).toBe("payment");
		expect(last.nextActions).toEqual([]);
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
		expect(step?.canonicalCode).toBe("step_02_site_visit");
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
		const next = getNextStep("payment");
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
		expect(isValidStepKey("payment")).toBe(true);
	});

	it("should return false for invalid keys", () => {
		expect(isValidStepKey("invalid")).toBe(false);
		expect(isValidStepKey("")).toBe(false);
	});
});

describe("normalizeOperationalStepCode", () => {
	it("passes canonical codes through", () => {
		expect(normalizeOperationalStepCode("step_07_evidence")).toEqual({
			status: "canonical",
			code: "step_07_evidence",
		});
	});

	it("maps legacy v1 aliases to canonical codes", () => {
		expect(normalizeOperationalStepCode("step_07_technical_report")).toEqual({
			status: "legacy_alias",
			legacyCode: "step_07_technical_report",
			code: "step_08_technical_report",
		});
		expect(normalizeOperationalStepCode("STEP_14_CLOSURE")).toEqual({
			status: "legacy_alias",
			legacyCode: "STEP_14_CLOSURE",
			code: "step_14_payment",
		});
	});

	it("flags unknown codes as invalid", () => {
		expect(normalizeOperationalStepCode("step_99_unknown")).toEqual({
			status: "invalid",
			input: "step_99_unknown",
		});
	});
});

describe("getOperationalStepCodeAliases", () => {
	it("returns every legacy code that maps to the canonical code", () => {
		const aliases = getOperationalStepCodeAliases("step_14_payment");
		expect(aliases).toContain("step_13_payment");
		expect(aliases).toContain("step_14_closure");
		expect(aliases).toContain("STEP_14_CLOSURE");
	});
});
