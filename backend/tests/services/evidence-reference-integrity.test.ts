import { describe, expect, it } from "vitest";
import { assertEvidenceReferencesBelongToCase } from "../../src/services/evidence-reference-integrity.service";

const WORK_ORDER_ID = "507f1f77bcf86cd799439021";
const EXECUTION_ID = "507f1f77bcf86cd799439022";

describe("evidence reference integrity", () => {
	it("accepts references registered on the same service case", () => {
		expect(() =>
			assertEvidenceReferencesBelongToCase(
				{
					workOrderId: WORK_ORDER_ID,
					executionSessionId: EXECUTION_ID,
				},
				{
					workOrderId: WORK_ORDER_ID,
					executionSessionId: EXECUTION_ID,
				},
			),
		).not.toThrow();
	});

	it("rejects a work order from another service case", () => {
		expect(() =>
			assertEvidenceReferencesBelongToCase(
				{ workOrderId: "507f1f77bcf86cd799439099" },
				{ workOrderId: WORK_ORDER_ID },
			),
		).toThrowError(/work order/i);
	});

	it("rejects an execution session from another service case", () => {
		expect(() =>
			assertEvidenceReferencesBelongToCase(
				{ executionSessionId: "507f1f77bcf86cd799439098" },
				{ executionSessionId: EXECUTION_ID },
			),
		).toThrowError(/execution session/i);
	});
});
